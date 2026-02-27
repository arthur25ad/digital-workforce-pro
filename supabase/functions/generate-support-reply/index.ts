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

    const { ticket, knowledgeBase, knowledgeItems, brainContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a customer support AI assistant. Given a customer message and business context, generate a structured support response. Return a JSON object (no markdown, no code fences, just raw JSON) with this exact schema:
{
  "issueSummary": "brief 1-sentence summary of the issue",
  "suggestedReply": "a complete, professional, empathetic reply ready to send to the customer (3-5 sentences)",
  "confidenceLevel": "high" or "medium" or "low",
  "escalationFlag": true or false,
  "referencedPolicy": "relevant policy snippet or empty string if none applies",
  "recommendedAction": "brief next step recommendation"
}

Guidelines:
- Match the brand tone provided
- Reference specific policies when relevant
- Flag for escalation if the issue is complex, involves refunds over policy limits, or requires manager approval
- Set confidence to "low" if you lack enough context to draft a good reply
- Keep the reply warm, professional, and specific to the customer's issue`;

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
Message: ${ticket.customerMessage}${brainContext ? `\n\n--- VANTABRAIN CONTEXT ---\n${brainContext}` : ""}`;

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
