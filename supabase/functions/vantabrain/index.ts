import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { INTELLIGENCE_ENGINE_PREAMBLE } from "../_shared/brain-context.ts";

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
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
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

      const { data: memories } = await supabase
        .from("brain_memories")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("scope", ["shared", roleScope])
        .order("times_reinforced", { ascending: false })
        .limit(30);

      const { data: patterns } = await supabase
        .from("brain_patterns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("role_scope", ["shared", roleScope])
        .eq("is_active", true)
        .order("confidence", { ascending: false })
        .limit(15);

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

    // ── GET SUGGESTIONS: Generate adaptive suggestions from patterns ──
    if (action === "get-suggestions") {
      const { workspaceId, roleScope } = body;

      // Require minimum confidence & evidence for suggestions
      const MIN_CONFIDENCE = 0.55;
      const MIN_EVIDENCE = 2;

      // Fetch qualifying patterns
      const { data: patterns } = await supabase
        .from("brain_patterns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("role_scope", ["shared", roleScope])
        .eq("is_active", true)
        .gte("confidence", MIN_CONFIDENCE)
        .gte("evidence_count", MIN_EVIDENCE)
        .order("confidence", { ascending: false })
        .limit(10);

      // Fetch high-confidence memories
      const { data: memories } = await supabase
        .from("brain_memories")
        .select("*")
        .eq("workspace_id", workspaceId)
        .in("scope", ["shared", roleScope])
        .gte("confidence", MIN_CONFIDENCE)
        .gte("times_reinforced", MIN_EVIDENCE)
        .order("confidence", { ascending: false })
        .limit(10);

      if ((!patterns || patterns.length === 0) && (!memories || memories.length === 0)) {
        return new Response(JSON.stringify({ suggestions: [], reason: "Not enough learned patterns yet" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const patternSummary = (patterns || []).map(
        (p: any) => `[${p.pattern_type}] ${p.description} (confidence: ${Math.round(p.confidence * 100)}%, evidence: ${p.evidence_count}x)`
      ).join("\n");

      const memorySummary = (memories || []).map(
        (m: any) => `[${m.category}] ${m.memory_key}: ${m.memory_value} (confidence: ${Math.round(m.confidence * 100)}%, reinforced: ${m.times_reinforced}x)`
      ).join("\n");

      const rolePrompts: Record<string, string> = {
        "social-media-manager": "posting times, platforms, content types, caption styles, CTA patterns, content themes, approval patterns, scheduling choices",
        "customer-support": "reply tone, reply structures, resolution patterns, escalation rules, reply length, policy language, issue-response pairings",
        "email-marketer": "send times, campaign timing, subject line styles, CTA patterns, audience segments, campaign types by season, approval preferences",
        "virtual-assistant": "task priorities, follow-up cadence, next-step patterns, message style, admin workflows, request handling, approval tendencies",
      };

      const focusAreas = rolePrompts[roleScope] || "general behavioral preferences";

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          tools: [{
            type: "function",
            function: {
              name: "return_suggestions",
              description: "Return 1-5 smart adaptive suggestions based on learned patterns and memories.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique short ID for this suggestion (snake_case)" },
                        message: { type: "string", description: "Natural language suggestion message, phrased as a helpful question. Max 120 chars." },
                        category: { type: "string", enum: ["timing", "style", "platform", "workflow", "tone", "content", "priority"] },
                        confidence: { type: "number", description: "How confident this suggestion is (0.5-1.0)" },
                        source_pattern_type: { type: "string", description: "The pattern type that drives this suggestion" },
                        actionable_value: { type: "string", description: "The specific value being suggested (e.g. '5:00 PM', 'Instagram', 'concise tone')" },
                      },
                      required: ["id", "message", "category", "confidence", "source_pattern_type", "actionable_value"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_suggestions" } },
          messages: [
            {
              role: "system",
              content: `${INTELLIGENCE_ENGINE_PREAMBLE}

You analyze learned behavioral patterns and memories for a ${roleScope} AI Employee to generate smart, adaptive suggestions.

RULES:
- Only suggest things with strong pattern evidence (multiple occurrences)
- Phrase each suggestion as a friendly, helpful question that EXPLAINS WHY you're suggesting it (e.g. "You've approved posts at 5 PM three times in a row. Want to use that time again?")
- Reference the specific pattern or memory that drives each suggestion
- Focus on: ${focusAreas}
- Max 5 suggestions, only include genuinely useful ones
- Each suggestion should feel earned through repeated behavior, not assumed from a single action
- Confidence should reflect the strength of the underlying pattern`,
            },
            {
              role: "user",
              content: `Role: ${roleScope}\n\nLEARNED PATTERNS:\n${patternSummary || "None yet"}\n\nMEMORIES:\n${memorySummary || "None yet"}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          return new Response(JSON.stringify({ suggestions: [], reason: "Rate limited" }), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI suggestion generation failed");
      }

      const data = await response.json();
      let suggestions: any[] = [];
      
      // Parse tool call response
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          suggestions = parsed.suggestions || [];
        } catch {
          // fallback: try content
          const content = data.choices?.[0]?.message?.content || "{}";
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
            suggestions = parsed.suggestions || [];
          } catch { /* empty */ }
        }
      }

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── SUGGESTION FEEDBACK: Accept/Reject/Edit strengthens or weakens patterns ──
    if (action === "suggestion-feedback") {
      const { workspaceId, roleScope, suggestionId, feedback, patternType, editedValue } = body;
      // feedback: "accepted" | "rejected" | "edited" | "not_preferred"

      // Record the interaction
      await supabase.from("brain_interactions").insert({
        workspace_id: workspaceId,
        role_scope: roleScope,
        interaction_type: feedback === "accepted" ? "approval" : feedback === "rejected" ? "rejection" : "edit",
        action_taken: `Suggestion ${feedback}: ${suggestionId}`,
        original_content: suggestionId,
        edited_content: editedValue || null,
        metadata: { suggestion_feedback: true, pattern_type: patternType, feedback },
      });

      // Find matching patterns and adjust confidence
      if (patternType) {
        const { data: matchingPatterns } = await supabase
          .from("brain_patterns")
          .select("id, confidence, evidence_count")
          .eq("workspace_id", workspaceId)
          .in("role_scope", ["shared", roleScope])
          .eq("pattern_type", patternType)
          .eq("is_active", true);

        for (const pat of matchingPatterns || []) {
          let newConfidence = pat.confidence;
          if (feedback === "accepted") {
            newConfidence = Math.min(1, pat.confidence + 0.05);
          } else if (feedback === "rejected" || feedback === "not_preferred") {
            newConfidence = Math.max(0.1, pat.confidence - 0.1);
          } else if (feedback === "edited") {
            newConfidence = Math.min(1, pat.confidence + 0.02);
          }

          // Deactivate if confidence drops too low
          if (newConfidence < 0.3) {
            await supabase.from("brain_patterns").update({ is_active: false, confidence: newConfidence }).eq("id", pat.id);
          } else {
            await supabase.from("brain_patterns").update({ confidence: newConfidence, evidence_count: pat.evidence_count + 1 }).eq("id", pat.id);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LEARN: Analyze recent interactions and update memories/patterns ──
    if (action === "learn") {
      const { workspaceId, roleScope } = body;

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
              content: `${INTELLIGENCE_ENGINE_PREAMBLE}

You analyze user interaction patterns to extract useful preferences and behavioral patterns for VANTABRAIN's memory system. Return JSON (no markdown):
{
  "memories": [{"key": "short_key", "value": "what was learned", "category": "preference|style|timing|tone|workflow", "confidence": 0.5-1.0}],
  "patterns": [{"type": "approval_trend|edit_pattern|timing_preference|rejection_reason|style_preference|platform_preference|content_preference|priority_preference|follow_up_pattern|escalation_preference", "description": "pattern observed — be specific about what behavior was repeated", "confidence": 0.5-1.0}]
}
RULES:
- Only include genuinely useful insights from REPEATED behaviors
- Do not form strong preferences from single actions — require at least 2 consistent signals
- Each memory and pattern should be specific enough to inform future AI outputs
- Existing memory keys to avoid duplicating: ${existingKeys.join(", ") || "none"}`
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

      for (const mem of result.memories || []) {
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
