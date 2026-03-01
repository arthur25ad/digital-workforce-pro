import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SLACK_API_KEY = Deno.env.get("SLACK_API_KEY");
    if (!SLACK_API_KEY) throw new Error("SLACK_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { action, workspaceId, channel, text, blocks } = await req.json();

    // Verify workspace ownership
    const { data: ws } = await supabase.from("workspaces").select("id").eq("id", workspaceId).single();
    if (!ws) {
      return new Response(JSON.stringify({ error: "Workspace not found" }), { status: 404, headers: corsHeaders });
    }

    if (action === "send_message") {
      // Get slack settings for workspace
      const { data: settings } = await supabase
        .from("slack_workspace_settings")
        .select("*")
        .eq("workspace_id", workspaceId)
        .single();

      const targetChannel = channel || settings?.default_channel_id || settings?.default_channel_name || "#general";

      const response = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: text || "",
          blocks: blocks || undefined,
          username: "VANTORY",
          icon_emoji: ":robot_face:",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(`Slack API error [${response.status}]: ${JSON.stringify(data)}`);
      }

      // Log activity
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
      const { data: settings } = await supabase
        .from("slack_workspace_settings")
        .select("*")
        .eq("workspace_id", workspaceId)
        .single();

      const targetChannel = channel || settings?.default_channel_id || settings?.default_channel_name || "#general";

      const response = await fetch(`${GATEWAY_URL}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: targetChannel,
          text: "✅ VANTORY is now connected to this Slack workspace. Your AI Employees can now send updates here.",
          username: "VANTORY",
          icon_emoji: ":rocket:",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(`Slack API error [${response.status}]: ${JSON.stringify(data)}`);
      }

      // Update last_test_sent_at
      if (settings) {
        await supabase
          .from("slack_workspace_settings")
          .update({ last_test_sent_at: new Date().toISOString() })
          .eq("id", settings.id);
      }

      // Log activity
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
      // Fetch Slack team info
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

      const userId = claimsData.claims.sub;

      // Upsert platform_connections
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

      // Upsert slack_workspace_settings
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

      // Log activity
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
      // Update platform_connections
      await supabase
        .from("platform_connections")
        .update({ connected: false, status: "disconnected" })
        .eq("workspace_id", workspaceId)
        .eq("platform", "Slack");

      // Delete slack settings
      await supabase
        .from("slack_workspace_settings")
        .delete()
        .eq("workspace_id", workspaceId);

      // Log activity
      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_disconnected",
        message: "Disconnected Slack workspace",
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
