import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchBrainIntelligence, INTELLIGENCE_ENGINE_PREAMBLE } from "../_shared/brain-context.ts";

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

    const { request, profile, workspaceId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch full brain intelligence server-side
    const brain = workspaceId
      ? await fetchBrainIntelligence(supabase, workspaceId, "calendar-assistant")
      : { fullPromptBlock: "" };

    // Fetch recent tasks for priority pattern matching
    let taskContext = "";
    if (workspaceId) {
      const { data: recentTasks } = await supabase
        .from("assistant_tasks")
        .select("title, priority, status, category")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (recentTasks && recentTasks.length > 0) {
        taskContext = `\nRECENT TASKS (for priority & workflow context):\n${recentTasks.map((t: any) =>
          `[${t.priority}/${t.status}] ${t.title} (${t.category})`
        ).join("\n")}`;
      }
    }

    const systemPrompt = `${INTELLIGENCE_ENGINE_PREAMBLE}

ROLE: You are the AI Calendar Assistant Employee.

YOUR TASK: Generate a structured action plan for an incoming request. You MUST include a "reasoning" field explaining WHY you prioritized this way, chose this draft type, and recommended this action — referencing specific patterns, recent tasks, or learned preferences.

Return a JSON object (no markdown, no code fences, just raw JSON):
{
  "requestSummary": "1-sentence summary of what was requested",
  "recommendedAction": "clear, specific recommended next step (1-2 sentences)",
  "suggestedPriority": "high" or "medium" or "low",
  "draftResponse": "a ready-to-use draft message, email, or reply if applicable (3-5 sentences). If no response is needed, provide a short action note.",
  "nextStep": "what should happen after this action is taken",
  "approvalNeeded": true or false,
  "draftType": "response" or "follow-up" or "internal-note" or "task-plan",
  "reasoning": "plain English explanation of WHY this priority was set, this action was recommended, and this draft type was chosen — reference patterns, recent tasks, or learned preferences"
}

INTELLIGENCE RULES:
- If the brain shows the user usually marks similar requests as high priority, do the same and explain why
- If the brain shows a pattern of follow-up cadence, suggest aligned timing
- If the brain shows approval preferences, respect them
- If recent tasks show a workload pattern, factor that into priority
- Flag for approval if the profile says approval is required or if external-facing
- Make the draft specific and ready to use, not generic`;

    const contextParts = [
      profile?.business_overview ? `Business: ${profile.business_overview}` : "",
      profile?.main_responsibilities ? `Assistant Responsibilities: ${profile.main_responsibilities}` : "",
      profile?.preferred_tone ? `Tone: ${profile.preferred_tone}` : "",
      profile?.priority_rules ? `Priority Rules: ${profile.priority_rules}` : "",
      profile?.recurring_tasks ? `Recurring Tasks: ${profile.recurring_tasks}` : "",
      profile?.communication_preferences ? `Communication Preferences: ${profile.communication_preferences}` : "",
      profile?.important_notes ? `Important Notes: ${profile.important_notes}` : "",
    ].filter(Boolean).join("\n");

    const userPrompt = `${contextParts ? `Business Context:\n${contextParts}\n\n` : ""}${taskContext}

--- INCOMING REQUEST ---
Source: ${request.source || "manual"}
Requester: ${request.requesterName || "Not specified"}
Urgency: ${request.urgency || "medium"}
Summary: ${request.requestSummary || ""}
Details: ${request.requestDetails || "No additional details"}

${brain.fullPromptBlock ? `\n--- VANTABRAIN INTELLIGENCE ---\n${brain.fullPromptBlock}` : ""}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ draft: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-assistant-draft error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
