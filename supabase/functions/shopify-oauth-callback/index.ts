import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SHOPIFY_API_KEY = Deno.env.get("SHOPIFY_API_KEY");
    const SHOPIFY_API_SECRET = Deno.env.get("SHOPIFY_API_SECRET");
    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) throw new Error("Shopify app credentials not configured");

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const shop = url.searchParams.get("shop");

    if (!code || !state || !shop) {
      return new Response("Missing required parameters", { status: 400 });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify state
    const { data: stateRecord } = await serviceClient
      .from("shopify_oauth_states")
      .select("*")
      .eq("state", state)
      .eq("shop_domain", shop)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!stateRecord) {
      return new Response("Invalid or expired state", { status: 400 });
    }

    const { workspace_id, user_id } = stateRecord;

    // Exchange code for access token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Token exchange failed:", errorText);
      return new Response("Failed to exchange token with Shopify", { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope || "";

    // Fetch basic shop info
    const shopInfoRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });

    let shopName = shop.replace(".myshopify.com", "");
    let currency = "USD";
    if (shopInfoRes.ok) {
      const shopInfo = await shopInfoRes.json();
      shopName = shopInfo.shop?.name || shopName;
      currency = shopInfo.shop?.currency || currency;
    }

    const now = new Date().toISOString();

    // Upsert platform_connections
    const { data: connection } = await serviceClient
      .from("platform_connections")
      .upsert({
        workspace_id,
        platform: "shopify",
        account_name: shopName,
        connected: true,
        connected_at: now,
        last_synced_at: now,
        status: "connected",
      }, { onConflict: "workspace_id,platform" })
      .select()
      .single();

    // Upsert shopify_store_settings
    await serviceClient
      .from("shopify_store_settings")
      .upsert({
        workspace_id,
        platform_connection_id: connection?.id || null,
        shop_domain: shop,
        shop_name: shopName,
        currency,
        scopes,
        access_token_encrypted: accessToken, // In production, encrypt this
        last_synced_at: now,
      }, { onConflict: "workspace_id" })
      .select();

    // Clean up used state
    await serviceClient.from("shopify_oauth_states").delete().eq("state", state);

    // Log activity
    await serviceClient.from("activity_logs").insert({
      workspace_id,
      type: "shopify_connected",
      message: `Connected Shopify store: ${shopName}`,
    });

    // Redirect back to VANTORY dashboard
    const redirectUrl = `${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "").includes("localhost") ? "http://localhost:5173" : "https://vantory.lovable.app"}/dashboard?shopify=connected`;

    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (error) {
    console.error("shopify-oauth-callback error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
