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

    const { brandProfile, campaign, count, workspaceId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const numDrafts = count || 1;

    // Fetch full brain intelligence server-side
    const brain = workspaceId
      ? await fetchBrainIntelligence(supabase, workspaceId, "email-marketer")
      : { fullPromptBlock: "" };

    // Fetch recent approved drafts for style matching
    let pastDraftContext = "";
    if (workspaceId) {
      const { data: recentDrafts } = await supabase
        .from("email_drafts")
        .select("subject_line, email_type, status")
        .eq("workspace_id", workspaceId)
        .in("status", ["approved", "sent"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentDrafts && recentDrafts.length > 0) {
        pastDraftContext = `\nPREVIOUSLY APPROVED EMAIL SUBJECTS (use as style reference):\n${recentDrafts.map((d: any) =>
          `[${d.email_type}] "${d.subject_line}"`
        ).join("\n")}`;
      }
    }

    const systemPrompt = `${INTELLIGENCE_ENGINE_PREAMBLE}

ROLE: You are the Email Marketer AI Employee.

YOUR TASK: Generate ${numDrafts} email draft(s). Each draft MUST include a "reasoning" field explaining WHY you chose this subject line, angle, and CTA — referencing specific patterns, past approved emails, or learned preferences.

Return a JSON object (no markdown, no code fences, just raw JSON):
{
  "drafts": [
    {
      "subjectLine": "compelling subject line",
      "previewText": "short preview text for inbox (max 90 chars)",
      "bodyCopy": "full email body copy with paragraphs",
      "callToAction": "clear CTA text",
      "emailType": "promotional" or "newsletter" or "welcome" or "follow-up" or "announcement",
      "suggestedSendTime": "recommended send day/time based on learned patterns or best practices",
      "reasoning": "plain English explanation of WHY this draft was structured this way — reference patterns, past approvals, or audience insights"
    }
  ]
}

INTELLIGENCE RULES:
- If the brain shows subject line style preferences, match them
- If the brain shows send timing patterns, suggest those times
- If the brain shows CTA preferences, use similar styles
- If past approved emails show a pattern, explain that reference
- Make subject lines compelling and specific (not generic)
- Each draft should take a distinctly different angle if generating multiple`;

    const userPrompt = `Business Overview: ${brandProfile?.business_overview || "Not provided"}
Audience: ${brandProfile?.audience_description || "Not provided"}
Brand Voice: ${brandProfile?.brand_voice || "Professional"}
Offers: ${brandProfile?.offer_summary || "Not provided"}
Campaign Goals: ${brandProfile?.campaign_goals || "Not provided"}
Preferred Style: ${brandProfile?.preferred_email_style || "Clean and scannable"}
Keywords: ${brandProfile?.keywords || ""}

--- CAMPAIGN DETAILS ---
Campaign Name: ${campaign?.name || "General Campaign"}
Campaign Type: ${campaign?.campaign_type || "promotional"}
Target Audience: ${campaign?.target_audience || "General subscribers"}
Objective: ${campaign?.objective || "Drive engagement"}
${pastDraftContext}

Generate ${numDrafts} distinct email draft(s) for this campaign.

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

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-email-draft error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
