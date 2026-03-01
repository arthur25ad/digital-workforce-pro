import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SHOPIFY_API_KEY = Deno.env.get("SHOPIFY_API_KEY");
    if (!SHOPIFY_API_KEY) throw new Error("SHOPIFY_API_KEY not configured");

    // Authenticate user
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
    const userId = claimsData.claims.sub;

    // Get workspace
    const { data: profile } = await supabase.from("profiles").select("active_workspace_id").eq("id", userId).single();
    if (!profile?.active_workspace_id) {
      return new Response(JSON.stringify({ error: "No active workspace" }), { status: 400, headers: corsHeaders });
    }
    const workspaceId = profile.active_workspace_id;

    // Parse body
    const { shop_domain } = await req.json();
    if (!shop_domain) {
      return new Response(JSON.stringify({ error: "shop_domain is required" }), { status: 400, headers: corsHeaders });
    }

    // Normalize domain
    let normalizedDomain = shop_domain.trim().toLowerCase();
    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!normalizedDomain.includes(".myshopify.com")) {
      normalizedDomain = `${normalizedDomain}.myshopify.com`;
    }

    // Generate secure state
    const stateBytes = new Uint8Array(32);
    crypto.getRandomValues(stateBytes);
    const state = Array.from(stateBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    // Store state using service role for security (no RLS on oauth_states)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("shopify_oauth_states").insert({
      workspace_id: workspaceId,
      user_id: userId,
      shop_domain: normalizedDomain,
      state,
    });

    // Build Shopify auth URL
    const scopes = "read_products,read_orders,read_customers";
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/shopify-oauth-callback`;

    const authUrl = `https://${normalizedDomain}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;

    return new Response(JSON.stringify({ auth_url: authUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("shopify-oauth-start error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
