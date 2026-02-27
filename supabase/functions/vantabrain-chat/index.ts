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

    const body = await req.json();
    const { messages, workspaceId, conversationId } = body;

    if (!workspaceId || !messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch full brain context across all roles for the assistant
    const brainContext = await fetchBrainIntelligence(supabase, workspaceId, "shared");

    // Also fetch role-specific stats
    const [profileRes, memoriesCountRes, patternsCountRes, interactionsCountRes, draftsRes, ticketsRes, tasksRes] = await Promise.all([
      supabase.from("profiles").select("active_package, unlocked_roles, subscription_status").eq("id", user.id).maybeSingle(),
      supabase.from("brain_memories").select("scope", { count: "exact" }).eq("workspace_id", workspaceId),
      supabase.from("brain_patterns").select("role_scope", { count: "exact" }).eq("workspace_id", workspaceId).eq("is_active", true),
      supabase.from("brain_interactions").select("role_scope", { count: "exact" }).eq("workspace_id", workspaceId),
      supabase.from("social_drafts").select("status", { count: "exact" }).eq("workspace_id", workspaceId).eq("status", "draft"),
      supabase.from("support_tickets").select("status", { count: "exact" }).eq("workspace_id", workspaceId).eq("status", "new"),
      supabase.from("assistant_tasks").select("status", { count: "exact" }).eq("workspace_id", workspaceId).in("status", ["new", "in_progress"]),
    ]);

    const profile = profileRes.data;
    const unlockedRoles = profile?.unlocked_roles || [];

    const roleNames: Record<string, string> = {
      "social-media-manager": "Social Media Manager",
      "customer-support": "Customer Support",
      "email-marketer": "Email Marketer",
      "virtual-assistant": "Virtual Assistant",
    };

    const accountContext = [
      `USER ACCOUNT STATE:`,
      `Plan: ${profile?.active_package || "starter"}`,
      `Subscription: ${profile?.subscription_status || "unknown"}`,
      `Unlocked AI Employees: ${unlockedRoles.map((r: string) => roleNames[r] || r).join(", ") || "None"}`,
      `Total Memories: ${memoriesCountRes.count || 0}`,
      `Total Active Patterns: ${patternsCountRes.count || 0}`,
      `Total Interactions Tracked: ${interactionsCountRes.count || 0}`,
      `Pending Social Drafts: ${draftsRes.count || 0}`,
      `Open Support Tickets: ${ticketsRes.count || 0}`,
      `Active Tasks: ${tasksRes.count || 0}`,
    ].join("\n");

    const systemPrompt = `${INTELLIGENCE_ENGINE_PREAMBLE}

You are the VANTABRAIN Assistant — the interactive intelligence guide inside the Vantory platform.

YOUR ROLE:
- Answer questions about the user's workspace, business context, learned preferences, and platform state.
- Explain what each AI Employee does (Social Media Manager, Customer Support, Email Marketer, Virtual Assistant).
- Surface what VANTABRAIN has learned about this business and user.
- Suggest helpful next steps based on their current account state.
- Be warm, clear, and helpful — like a smart business advisor who knows their account.

WHAT YOU KNOW:
${brainContext.fullPromptBlock || "No brain context available yet — the user is likely new."}

${accountContext}

AI EMPLOYEE DESCRIPTIONS:
- Social Media Manager: Generates social media content ideas, captions, hooks, and CTAs based on brand profile and learned posting preferences.
- Customer Support: Drafts support replies for customer tickets using knowledge base, tone patterns, and escalation rules.
- Email Marketer: Creates email campaign drafts with subject lines, body copy, and CTAs based on brand voice and campaign goals.
- Virtual Assistant: Manages tasks, drafts responses to requests, and helps prioritize workload based on learned patterns.

RULES:
- Always answer in plain English. Be conversational, not robotic.
- When referencing learned data, explain WHERE the insight comes from (e.g. "Based on your 3 approved posts at 5 PM...").
- If you don't have data on something, say so honestly.
- Do NOT make up information about the user's account.
- Do NOT perform actions — only answer, explain, summarize, and recommend.
- Keep answers concise but helpful. Use bullet points for lists.
- If the user seems new, help them understand what to do first.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("vantabrain-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
