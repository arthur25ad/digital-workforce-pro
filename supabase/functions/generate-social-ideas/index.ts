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

    const { brandProfile, workspaceId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch full brain intelligence server-side
    const brain = workspaceId
      ? await fetchBrainIntelligence(supabase, workspaceId, "social-media-manager")
      : { fullPromptBlock: "" };

    const systemPrompt = `${INTELLIGENCE_ENGINE_PREAMBLE}

ROLE: You are the Social Media Manager AI Employee.

YOUR TASK: Generate exactly 3 unique post ideas. For EACH idea, you MUST include a "reasoning" field that explains WHY you chose this specific angle, platform, timing, or format — referencing specific memories, patterns, or business context when available.

Return a JSON array (no markdown, no code fences, just raw JSON):
[
  {
    "ideaTitle": "short title",
    "platform": "Instagram" or "LinkedIn" or "Facebook" or "TikTok" or "X / Twitter",
    "contentAngle": "what the post is about",
    "hook": "attention-grabbing opening line",
    "caption": "full caption draft (2-3 sentences)",
    "cta": "call to action",
    "format": "carousel" or "single image" or "story" or "short post" or "video",
    "suggestedTime": "best time to post based on learned patterns or general best practice",
    "reasoning": "plain English explanation of WHY this idea was chosen — reference specific patterns, memories, or business context"
  }
]

INTELLIGENCE RULES:
- If the brain shows a timing preference pattern, use it and mention it in reasoning
- If the brain shows preferred platforms, prioritize those
- If the brain shows content style preferences (from past approvals/edits), match them
- If the brain shows approval patterns for certain formats, favor those
- Make each idea distinctly different in angle, platform, and format
- Be specific to the business context provided`;

    const userPrompt = `Business: ${brandProfile.businessName || "My Business"}
What they sell: ${brandProfile.offerType || "Professional services"}
Who they serve: ${brandProfile.targetAudience || "Small business owners"}
Brand voice: ${brandProfile.brandVoice || "Professional yet approachable"}
Content goals: ${brandProfile.contentGoals || "Increase engagement and awareness"}
Content themes: ${(brandProfile.contentThemes || []).join(", ") || "Tips, updates, stories"}
Preferred platforms: ${(brandProfile.preferredPlatforms || []).join(", ") || "Instagram, LinkedIn"}

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
    const content = data.choices?.[0]?.message?.content || "[]";

    let ideas;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      ideas = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-social-ideas error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
