import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    const { data: profile } = await supabase.from("profiles").select("active_workspace_id").eq("id", userId).single();
    if (!profile?.active_workspace_id) {
      return new Response(JSON.stringify({ error: "No active workspace" }), { status: 400, headers: corsHeaders });
    }
    const workspaceId = profile.active_workspace_id;

    // Get Shopify settings using service role to access token
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await serviceClient
      .from("shopify_store_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!settings?.access_token_encrypted || !settings?.shop_domain) {
      return new Response(JSON.stringify({ error: "Shopify not connected" }), { status: 400, headers: corsHeaders });
    }

    const accessToken = settings.access_token_encrypted;
    const shopDomain = settings.shop_domain;

    // Fetch products
    let syncedProducts: any[] = [];
    if (settings.enable_product_context) {
      try {
        const productsRes = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json?limit=50&fields=id,title,product_type,vendor,status,tags`, {
          headers: { "X-Shopify-Access-Token": accessToken },
        });
        if (productsRes.ok) {
          const data = await productsRes.json();
          syncedProducts = (data.products || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            product_type: p.product_type,
            vendor: p.vendor,
            status: p.status,
            tags: p.tags,
          }));
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
      }
    }

    // Fetch collections
    let syncedCollections: any[] = [];
    if (settings.enable_collection_context) {
      try {
        const collectionsRes = await fetch(`https://${shopDomain}/admin/api/2024-01/custom_collections.json?limit=50&fields=id,title,handle`, {
          headers: { "X-Shopify-Access-Token": accessToken },
        });
        if (collectionsRes.ok) {
          const data = await collectionsRes.json();
          syncedCollections = (data.custom_collections || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            handle: c.handle,
          }));
        }
      } catch (e) {
        console.error("Failed to fetch collections:", e);
      }
    }

    // Fetch updated shop info
    let storeMetadata: any = settings.store_metadata || {};
    try {
      const shopRes = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
        headers: { "X-Shopify-Access-Token": accessToken },
      });
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        storeMetadata = {
          name: shopData.shop?.name,
          domain: shopData.shop?.domain,
          myshopify_domain: shopData.shop?.myshopify_domain,
          plan_name: shopData.shop?.plan_name,
          country: shopData.shop?.country_name,
          timezone: shopData.shop?.timezone,
        };
      }
    } catch (e) {
      console.error("Failed to fetch shop info:", e);
    }

    const now = new Date().toISOString();

    // Update shopify_store_settings
    await serviceClient.from("shopify_store_settings").update({
      synced_products: syncedProducts,
      synced_collections: syncedCollections,
      store_metadata: storeMetadata,
      shop_name: storeMetadata.name || settings.shop_name,
      last_synced_at: now,
    }).eq("workspace_id", workspaceId);

    // Update platform_connections last_synced_at
    await serviceClient.from("platform_connections").update({
      last_synced_at: now,
      account_name: storeMetadata.name || settings.shop_name,
    }).eq("workspace_id", workspaceId).eq("platform", "shopify");

    // Log activity
    await serviceClient.from("activity_logs").insert({
      workspace_id: workspaceId,
      type: "shopify_synced",
      message: `Synced Shopify store: ${syncedProducts.length} products, ${syncedCollections.length} collections`,
    });

    return new Response(JSON.stringify({
      success: true,
      products_count: syncedProducts.length,
      collections_count: syncedCollections.length,
      synced_at: now,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("shopify-sync-store error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
