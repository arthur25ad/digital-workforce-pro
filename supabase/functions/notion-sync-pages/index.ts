import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract plain text from Notion blocks
function blocksToPlainText(blocks: any[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const richTexts = block[block.type]?.rich_text;
    if (richTexts && Array.isArray(richTexts)) {
      const text = richTexts.map((rt: any) => rt.plain_text || "").join("");
      if (text.trim()) lines.push(text.trim());
    }
  }
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseUser = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { workspace_id } = await req.json();
    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "Missing workspace_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the Notion connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from("notion_connections")
      .select("*")
      .eq("workspace_id", workspace_id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "Notion not connected" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = connection.access_token_encrypted;

    // Search for pages the integration has access to
    const searchResponse = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { value: "page", property: "object" },
        page_size: 50,
      }),
    });

    if (!searchResponse.ok) {
      console.error("Notion search failed:", await searchResponse.text());
      return new Response(JSON.stringify({ error: "Failed to fetch Notion pages" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const searchData = await searchResponse.json();
    const pages = searchData.results || [];
    let syncedCount = 0;

    for (const page of pages) {
      try {
        // Get page title
        const titleProp = Object.values(page.properties || {}).find(
          (p: any) => p.type === "title"
        ) as any;
        const title = titleProp?.title?.map((t: any) => t.plain_text).join("") || "Untitled";

        // Get page blocks (content)
        const blocksResponse = await fetch(
          `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`,
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Notion-Version": "2022-06-28",
            },
          }
        );

        let contentPlain = "";
        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json();
          contentPlain = blocksToPlainText(blocksData.results || []);
        }

        // Only store pages with actual content
        if (contentPlain.trim().length > 10) {
          await supabaseAdmin.from("notion_synced_pages").upsert({
            workspace_id,
            notion_page_id: page.id,
            title,
            content_plain: contentPlain.substring(0, 50000), // Cap at 50k chars
            page_url: page.url || null,
            last_synced_at: new Date().toISOString(),
          }, { onConflict: "workspace_id,notion_page_id" });
          syncedCount++;
        }
      } catch (pageError) {
        console.error(`Error syncing page ${page.id}:`, pageError);
      }
    }

    // Update last synced timestamp
    await supabaseAdmin.from("notion_connections").update({
      last_synced_at: new Date().toISOString(),
    }).eq("workspace_id", workspace_id);

    return new Response(JSON.stringify({ 
      success: true, 
      synced_pages: syncedCount,
      total_found: pages.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notion-sync-pages:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
