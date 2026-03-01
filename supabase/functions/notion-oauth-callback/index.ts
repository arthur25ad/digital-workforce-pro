import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_CLIENT_ID = Deno.env.get("NOTION_OAUTH_CLIENT_ID");
    const NOTION_CLIENT_SECRET = Deno.env.get("NOTION_OAUTH_CLIENT_SECRET");
    if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "Notion integration not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code, state, redirect_uri } = await req.json();
    if (!code || !state) {
      return new Response(JSON.stringify({ error: "Missing code or state" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode state
    let stateData: { user_id: string; workspace_id: string; redirect_uri: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(JSON.stringify({ error: "Invalid state" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`)}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri || stateData.redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Notion token exchange failed:", errBody);
      return new Response(JSON.stringify({ error: "Failed to connect to Notion" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const workspaceName = tokenData.workspace_name || null;
    const workspaceId = tokenData.workspace_id || null;
    const botId = tokenData.bot_id || null;

    // Store the connection using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error: upsertError } = await supabase
      .from("notion_connections")
      .upsert({
        workspace_id: stateData.workspace_id,
        access_token_encrypted: accessToken,
        notion_workspace_name: workspaceName,
        notion_workspace_id: workspaceId,
        bot_id: botId,
        status: "active",
        connected_at: new Date().toISOString(),
      }, { onConflict: "workspace_id" });

    if (upsertError) {
      console.error("Error storing Notion connection:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to save connection" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also create a platform_connections record
    await supabase
      .from("platform_connections")
      .upsert({
        workspace_id: stateData.workspace_id,
        platform: "notion",
        connected: true,
        account_name: workspaceName,
        connected_at: new Date().toISOString(),
        status: "active",
      }, { onConflict: "workspace_id,platform" })
      .then(() => {});

    return new Response(JSON.stringify({ 
      success: true, 
      workspace_name: workspaceName 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notion-oauth-callback:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
