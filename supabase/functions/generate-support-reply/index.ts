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

    const { ticket, knowledgeBase, knowledgeItems, workspaceId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch full brain intelligence server-side
    const brain = workspaceId
      ? await fetchBrainIntelligence(supabase, workspaceId, "customer-support")
      : { fullPromptBlock: "" };

    // Also fetch recent similar tickets for similarity matching
    let similarTicketContext = "";
    if (workspaceId && ticket.customerMessage) {
      const { data: recentDrafts } = await supabase
        .from("support_drafts")
        .select("issue_summary, suggested_reply, status, confidence_level")
        .eq("workspace_id", workspaceId)
        .in("status", ["approved", "sent"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentDrafts && recentDrafts.length > 0) {
        similarTicketContext = `\nPREVIOUSLY APPROVED RESPONSES (use as reference for tone and structure):\n${recentDrafts.map((d: any) =>
          `Issue: ${d.issue_summary || "N/A"} → Reply style: ${(d.suggested_reply || "").slice(0, 150)}... [${d.confidence_level}]`
        ).join("\n")}`;
      }
    }

    const systemPrompt = `${INTELLIGENCE_ENGINE_PREAMBLE}

ROLE: You are the Customer Support AI Employee.

YOUR TASK: Generate a structured support response. You MUST include a "reasoning" field that explains WHY you drafted the reply this way — referencing specific patterns, similar past tickets, or learned preferences.

Return a JSON object (no markdown, no code fences, just raw JSON):
{
  "issueSummary": "brief 1-sentence summary of the issue",
  "suggestedReply": "a complete, professional, empathetic reply ready to send (3-5 sentences)",
  "confidenceLevel": "high" or "medium" or "low",
  "escalationFlag": true or false,
  "referencedPolicy": "relevant policy snippet or empty string",
  "recommendedAction": "brief next step recommendation",
  "reasoning": "plain English explanation of WHY this reply was structured this way — reference patterns, similar past cases, or learned preferences"
}

INTELLIGENCE RULES:
- If the brain shows the user prefers a certain reply tone, match it
- If the brain shows patterns about escalation preferences, follow them
- If similar past tickets were resolved a certain way, reference that
- If the brain shows reply length preferences, respect them
- Flag for escalation if the issue is complex, involves refunds over policy limits, or matches learned escalation patterns
- Set confidence to "low" if you lack enough context
- Keep the reply warm, professional, and specific`;

    const policyContext = [
      knowledgeBase?.refund_policy ? `Refund Policy: ${knowledgeBase.refund_policy}` : "",
      knowledgeBase?.shipping_policy ? `Shipping Policy: ${knowledgeBase.shipping_policy}` : "",
      knowledgeBase?.custom_policies ? `Other Policies: ${knowledgeBase.custom_policies}` : "",
      knowledgeBase?.example_responses ? `Example Responses: ${knowledgeBase.example_responses}` : "",
      knowledgeBase?.sop_notes ? `SOPs: ${knowledgeBase.sop_notes}` : "",
    ].filter(Boolean).join("\n");

    const kbItems = (knowledgeItems || []).map((i: any) => `${i.title}: ${i.content || ""}`).join("\n");

    const userPrompt = `Business Overview: ${knowledgeBase?.business_overview || "Not provided"}
Products/Services: ${knowledgeBase?.products_services || "Not provided"}
Support Principles: ${knowledgeBase?.support_principles || "Fast, accurate, empathetic"}
Brand Tone: ${knowledgeBase?.brand_tone || "Professional"}
Support Hours: ${knowledgeBase?.support_hours || "Not specified"}
Escalation Rules: ${knowledgeBase?.escalation_rules || "Escalate complex issues"}

${policyContext ? `Policies & Knowledge:\n${policyContext}` : ""}
${kbItems ? `Knowledge Base Items:\n${kbItems}` : ""}

--- INCOMING TICKET ---
Customer: ${ticket.customerName || "Customer"}
Channel: ${ticket.channel || "email"}
Urgency: ${ticket.urgency || "medium"}
Issue Type: ${ticket.issueType || "General inquiry"}
Message: ${ticket.customerMessage}
${similarTicketContext}

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

    return new Response(JSON.stringify({ reply: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-support-reply error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
