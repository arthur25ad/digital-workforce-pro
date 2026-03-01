import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";

const VALID_ACTIONS = ["connect", "disconnect", "send_message", "test_message", "list_channels", "update_settings"] as const;

function validatePayload(body: Record<string, unknown>) {
  if (!body.action || typeof body.action !== "string") {
    throw new Error("Missing or invalid 'action' field");
  }
  if (!VALID_ACTIONS.includes(body.action as any)) {
    throw new Error(`Unknown action: ${body.action}`);
  }
  if (!body.workspaceId || typeof body.workspaceId !== "string") {
    throw new Error("Missing or invalid 'workspaceId' field");
  }
}

async function verifyWorkspaceOwnership(
  supabase: ReturnType<typeof createClient>,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SLACK_API_KEY = Deno.env.get("SLACK_API_KEY");
    if (!SLACK_API_KEY) throw new Error("SLACK_API_KEY is not configured");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = claimsData.claims.sub as string;

    // Parse and validate body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    validatePayload(body);

    const { action, workspaceId, channel, text, blocks, settings: settingsUpdate } = body as any;

    // Verify workspace ownership - critical security check
    const isOwner = await verifyWorkspaceOwnership(supabase, workspaceId, userId);
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Forbidden: you do not own this workspace" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Helper: get slack settings
    const getSlackSettings = async () => {
      const { data } = await supabase
        .from("slack_workspace_settings")
        .select("*")
        .eq("workspace_id", workspaceId)
        .single();
      return data;
    };

    // Helper: resolve target channel
    const resolveChannel = async (overrideChannel?: string) => {
      const settings = await getSlackSettings();
      return overrideChannel || settings?.default_channel_id || settings?.default_channel_name || "#general";
    };

    // Helper: send Slack message
    const postSlackMessage = async (targetChannel: string, messageText: string, opts?: { icon_emoji?: string; messageBlocks?: any }) => {
      const response = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: messageText,
          blocks: opts?.messageBlocks || undefined,
          username: "VANTORY",
          icon_emoji: opts?.icon_emoji || ":robot_face:",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(`Slack API error [${response.status}]: ${JSON.stringify(data)}`);
      }
      return data;
    };

    // ─── ACTIONS ────────────────────────────────────────────

    if (action === "send_message") {
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Missing 'text' for send_message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const targetChannel = await resolveChannel(channel);
      const data = await postSlackMessage(targetChannel, text, { messageBlocks: blocks });

      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_notification_sent",
        message: `Slack message sent to ${targetChannel}`,
      });

      return new Response(JSON.stringify({ success: true, channel: data.channel, ts: data.ts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test_message") {
      const targetChannel = await resolveChannel(channel);
      await postSlackMessage(targetChannel, "✅ VANTORY is now connected to this Slack workspace. Your AI Employees can now send updates here.", { icon_emoji: ":rocket:" });

      const settings = await getSlackSettings();
      if (settings) {
        await supabase
          .from("slack_workspace_settings")
          .update({ last_test_sent_at: new Date().toISOString() })
          .eq("id", settings.id);
      }

      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_test_sent",
        message: `Test message sent to ${targetChannel}`,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_channels") {
      const response = await fetch(`${GATEWAY_URL}/conversations.list?types=public_channel&limit=200&exclude_archived=true`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(`Slack API error [${response.status}]: ${JSON.stringify(data)}`);
      }

      const channels = (data.channels || []).map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        is_member: ch.is_member,
        num_members: ch.num_members,
      }));

      return new Response(JSON.stringify({ channels }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "connect") {
      const response = await fetch(`${GATEWAY_URL}/auth.test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(`Slack API error [${response.status}]: ${JSON.stringify(data)}`);
      }

      const now = new Date().toISOString();
      const { data: connData } = await supabase
        .from("platform_connections")
        .upsert({
          workspace_id: workspaceId,
          platform: "Slack",
          account_name: data.team || "",
          connected: true,
          connected_at: now,
          status: "connected",
        }, { onConflict: "workspace_id,platform" })
        .select()
        .single();

      await supabase
        .from("slack_workspace_settings")
        .upsert({
          workspace_id: workspaceId,
          platform_connection_id: connData?.id || null,
          slack_team_id: data.team_id || "",
          slack_team_name: data.team || "",
          slack_bot_user_id: data.user_id || "",
          slack_workspace_name: data.team || "",
          installed_by_user_id: userId,
        }, { onConflict: "workspace_id" })
        .select()
        .single();

      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_connected",
        message: `Connected Slack workspace: ${data.team}`,
      });

      return new Response(JSON.stringify({
        success: true,
        team_name: data.team,
        team_id: data.team_id,
        bot_user_id: data.user_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      await supabase
        .from("platform_connections")
        .update({ connected: false, status: "disconnected" })
        .eq("workspace_id", workspaceId)
        .eq("platform", "Slack");

      await supabase
        .from("slack_workspace_settings")
        .delete()
        .eq("workspace_id", workspaceId);

      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_disconnected",
        message: "Disconnected Slack workspace",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_settings") {
      if (!settingsUpdate || typeof settingsUpdate !== "object") {
        return new Response(JSON.stringify({ error: "Missing 'settings' object" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Whitelist allowed fields
      const allowed = [
        "default_channel_id", "default_channel_name", "notifications_enabled",
        "daily_summary_enabled", "weekly_summary_enabled", "support_alerts_enabled",
        "content_approvals_enabled", "marketing_updates_enabled", "scheduling_alerts_enabled",
        "billing_alerts_enabled", "access_alerts_enabled",
      ];
      const sanitized: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in settingsUpdate) sanitized[key] = settingsUpdate[key];
      }

      const { error } = await supabase
        .from("slack_workspace_settings")
        .update(sanitized)
        .eq("workspace_id", workspaceId);

      if (error) throw error;

      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_settings_updated",
        message: "Updated Slack notification settings",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Slack function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
