import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const body = await req.json();
    const { event_type, payload } = body;

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: "event_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's workspace
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_workspace_id")
      .eq("id", userId)
      .single();

    if (!profile?.active_workspace_id) {
      return new Response(
        JSON.stringify({ error: "No active workspace" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const workspaceId = profile.active_workspace_id;

    // Get n8n settings
    const { data: settings } = await supabase
      .from("n8n_workspace_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();

    if (!settings) {
      return new Response(
        JSON.stringify({ error: "n8n not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which webhook URL to use based on event type
    let webhookUrl = settings.webhook_url_general || "";
    let enabled = true;

    switch (event_type) {
      case "lead":
        webhookUrl = settings.webhook_url_leads || settings.webhook_url_general || "";
        enabled = settings.enable_lead_automations;
        break;
      case "support":
        webhookUrl = settings.webhook_url_support || settings.webhook_url_general || "";
        enabled = settings.enable_support_automations;
        break;
      case "form":
        webhookUrl = settings.webhook_url_forms || settings.webhook_url_general || "";
        enabled = settings.enable_form_automations;
        break;
      case "task":
        webhookUrl = settings.webhook_url_tasks || settings.webhook_url_general || "";
        enabled = settings.enable_task_automations;
        break;
      default:
        webhookUrl = settings.webhook_url_general || "";
    }

    if (!enabled) {
      return new Response(
        JSON.stringify({ success: false, reason: "Automation disabled for this event type" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ success: false, reason: "No webhook URL configured for this event type" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire the webhook
    const webhookPayload = {
      source: "vantory",
      event_type,
      workspace_id: workspaceId,
      timestamp: new Date().toISOString(),
      data: payload || {},
    };

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    // Update trigger count
    await supabase
      .from("n8n_workspace_settings")
      .update({
        last_triggered_at: new Date().toISOString(),
        total_triggers: (settings.total_triggers || 0) + 1,
      })
      .eq("workspace_id", workspaceId);

    return new Response(
      JSON.stringify({
        success: webhookRes.ok,
        status: webhookRes.status,
        event_type,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("n8n trigger error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
