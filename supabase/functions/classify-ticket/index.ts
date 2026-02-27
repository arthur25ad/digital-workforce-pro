import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData.user) throw new Error("Invalid token");

    const { subject, message } = await req.json();
    if (!subject || !message) throw new Error("Subject and message required");

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", userData.user.id)
      .single();

    // Use AI to classify priority
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a support ticket priority classifier for a SaaS platform called Vantory. Classify the ticket priority as exactly one of: "low", "medium", or "high".

Rules:
- "high": Account access issues, billing/payment problems, data loss, service outages, security concerns, anything blocking the user from using the product.
- "medium": Feature not working as expected, bugs that have workarounds, integration issues, performance problems.
- "low": Feature requests, general questions, feedback, cosmetic issues, how-to questions.

Respond with ONLY a JSON object: {"priority": "low|medium|high", "reason": "brief 1-sentence explanation"}`,
          },
          {
            role: "user",
            content: `Subject: ${subject}\n\nMessage: ${message}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_priority",
              description: "Classify the support ticket priority",
              parameters: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  reason: { type: "string" },
                },
                required: ["priority", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_priority" } },
      }),
    });

    let priority = "medium";
    let aiReason = "";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          priority = args.priority || "medium";
          aiReason = args.reason || "";
        }
      } catch {
        // fallback to medium
      }
    }

    // Insert ticket with AI-classified priority
    const { data: ticket, error: insertError } = await supabaseAdmin
      .from("public_support_tickets")
      .insert({
        user_id: userData.user.id,
        user_email: profile?.email || userData.user.email || "",
        user_name: profile?.full_name || "",
        subject,
        message,
        priority,
        admin_notes: aiReason ? `[AI Priority: ${priority}] ${aiReason}` : "",
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return new Response(JSON.stringify({ success: true, ticket_id: ticket.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: msg.includes("authenticated") ? 401 : 500,
    });
  }
});
