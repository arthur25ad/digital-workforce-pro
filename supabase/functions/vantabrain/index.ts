import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // ── GET CONTEXT: Fetch brain data for AI prompt enrichment ──
    if (action === "get-context") {
      const { workspaceId, roleScope } = body;

      // Fetch shared + role-specific memories
      const { data: memories } = await supabase
        .from("brain_memories")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("scope", ["shared", roleScope])
        .order("times_reinforced", { ascending: false })
        .limit(30);

      // Fetch active patterns
      const { data: patterns } = await supabase
        .from("brain_patterns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("role_scope", ["shared", roleScope])
        .eq("is_active", true)
        .order("confidence", { ascending: false })
        .limit(15);

      // Build context string for AI prompts
      const memoryLines = (memories || []).map(
        (m: any) => `[${m.category}] ${m.memory_key}: ${m.memory_value} (confidence: ${m.confidence}, reinforced: ${m.times_reinforced}x)`
      );
      const patternLines = (patterns || []).map(
        (p: any) => `[${p.pattern_type}] ${p.description} (confidence: ${p.confidence}, seen: ${p.evidence_count}x)`
      );

      const contextBlock = [
        memoryLines.length > 0 ? `LEARNED PREFERENCES:\n${memoryLines.join("\n")}` : "",
        patternLines.length > 0 ? `BEHAVIORAL PATTERNS:\n${patternLines.join("\n")}` : "",
      ].filter(Boolean).join("\n\n");

      return new Response(JSON.stringify({ context: contextBlock, memories, patterns }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── RECORD INTERACTION: Log approval/edit/rejection ──
    if (action === "record-interaction") {
      const { workspaceId, roleScope, interactionType, actionTaken, originalContent, editedContent, metadata } = body;

      const { error: insertErr } = await supabase
        .from("brain_interactions")
        .insert({
          workspace_id: workspaceId,
          role_scope: roleScope,
          interaction_type: interactionType,
          action_taken: actionTaken,
          original_content: originalContent || null,
          edited_content: editedContent || null,
          metadata: metadata || {},
        });

      if (insertErr) throw insertErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LEARN: Analyze recent interactions and update memories/patterns ──
    if (action === "learn") {
      const { workspaceId, roleScope } = body;

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      // Fetch recent interactions for this role
      const { data: recentInteractions } = await supabase
        .from("brain_interactions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("role_scope", roleScope)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!recentInteractions || recentInteractions.length < 3) {
        return new Response(JSON.stringify({ learned: false, reason: "Not enough interactions yet" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch existing memories to avoid duplicates
      const { data: existingMemories } = await supabase
        .from("brain_memories")
        .select("memory_key, memory_value")
        .eq("workspace_id", workspaceId)
        .eq("scope", roleScope)
        .limit(20);

      const existingKeys = (existingMemories || []).map((m: any) => m.memory_key);

      const interactionSummary = recentInteractions.map((i: any) =>
        `[${i.interaction_type}] ${i.action_taken}${i.edited_content ? ` | Edit: ${i.edited_content.slice(0, 200)}` : ""}`
      ).join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You analyze user interaction patterns to extract useful preferences and behavioral patterns. Return JSON (no markdown):
{
  "memories": [{"key": "short_key", "value": "what was learned", "category": "preference|style|timing|tone|workflow", "confidence": 0.5-1.0}],
  "patterns": [{"type": "approval_trend|edit_pattern|timing_preference|rejection_reason|style_preference", "description": "pattern observed", "confidence": 0.5-1.0}]
}
Only include genuinely useful insights. Skip obvious or trivial observations. Existing memory keys to avoid duplicating: ${existingKeys.join(", ") || "none"}`
            },
            {
              role: "user",
              content: `Role: ${roleScope}\nRecent interactions:\n${interactionSummary}`
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          return new Response(JSON.stringify({ learned: false, reason: "Rate limited" }), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI learning failed");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      let result;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch {
        return new Response(JSON.stringify({ learned: false, reason: "Parse error" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert memories
      for (const mem of result.memories || []) {
        // Check if memory exists to reinforce
        const { data: existing } = await supabase
          .from("brain_memories")
          .select("id, times_reinforced, confidence")
          .eq("workspace_id", workspaceId)
          .eq("scope", roleScope)
          .eq("memory_key", mem.key)
          .maybeSingle();

        if (existing) {
          await supabase.from("brain_memories").update({
            memory_value: mem.value,
            confidence: Math.min(1, (existing.confidence + mem.confidence) / 2 + 0.05),
            times_reinforced: existing.times_reinforced + 1,
            last_used_at: new Date().toISOString(),
          }).eq("id", existing.id);
        } else {
          await supabase.from("brain_memories").insert({
            workspace_id: workspaceId,
            scope: roleScope,
            category: mem.category || "preference",
            memory_key: mem.key,
            memory_value: mem.value,
            confidence: mem.confidence || 0.5,
            source: "ai",
          });
        }
      }

      // Insert patterns
      for (const pat of result.patterns || []) {
        const { data: existingPat } = await supabase
          .from("brain_patterns")
          .select("id, evidence_count, confidence")
          .eq("workspace_id", workspaceId)
          .eq("role_scope", roleScope)
          .eq("pattern_type", pat.type)
          .eq("description", pat.description)
          .maybeSingle();

        if (existingPat) {
          await supabase.from("brain_patterns").update({
            confidence: Math.min(1, (existingPat.confidence + pat.confidence) / 2 + 0.05),
            evidence_count: existingPat.evidence_count + 1,
          }).eq("id", existingPat.id);
        } else {
          await supabase.from("brain_patterns").insert({
            workspace_id: workspaceId,
            role_scope: roleScope,
            pattern_type: pat.type,
            description: pat.description,
            confidence: pat.confidence || 0.5,
          });
        }
      }

      return new Response(JSON.stringify({
        learned: true,
        memoriesUpdated: (result.memories || []).length,
        patternsUpdated: (result.patterns || []).length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET STATS: Return brain stats for dashboard ──
    if (action === "get-stats") {
      const { workspaceId } = body;

      const [memRes, patRes, intRes] = await Promise.all([
        supabase.from("brain_memories").select("scope, category", { count: "exact" }).eq("workspace_id", workspaceId),
        supabase.from("brain_patterns").select("role_scope", { count: "exact" }).eq("workspace_id", workspaceId).eq("is_active", true),
        supabase.from("brain_interactions").select("role_scope", { count: "exact" }).eq("workspace_id", workspaceId),
      ]);

      return new Response(JSON.stringify({
        totalMemories: memRes.count || 0,
        totalPatterns: patRes.count || 0,
        totalInteractions: intRes.count || 0,
        memories: memRes.data || [],
        patterns: patRes.data || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vantabrain error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
