import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface BrainIntelligence {
  sharedContext: string;
  roleContext: string;
  recentActivity: string;
  fullPromptBlock: string;
}

export interface BrainSettings {
  learn_from_approvals: boolean;
  learn_from_edits: boolean;
  learn_timing_suggestions: boolean;
  require_approval: boolean;
  learning_paused: boolean;
}

export const DEFAULT_SETTINGS: BrainSettings = {
  learn_from_approvals: true,
  learn_from_edits: true,
  learn_timing_suggestions: true,
  require_approval: true,
  learning_paused: false,
};

export async function fetchBrainSettings(
  supabase: ReturnType<typeof createClient>,
  workspaceId: string
): Promise<BrainSettings> {
  const { data } = await supabase
    .from("brain_settings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return {
    learn_from_approvals: data.learn_from_approvals,
    learn_from_edits: data.learn_from_edits,
    learn_timing_suggestions: data.learn_timing_suggestions,
    require_approval: data.require_approval,
    learning_paused: data.learning_paused,
  };
}

export async function fetchBrainIntelligence(
  supabase: ReturnType<typeof createClient>,
  workspaceId: string,
  roleScope: string
): Promise<BrainIntelligence> {
  const [
    workspaceRes,
    memoriesRes,
    patternsRes,
    activityRes,
    connectionsRes,
  ] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", workspaceId).maybeSingle(),
    supabase
      .from("brain_memories")
      .select("*")
      .eq("workspace_id", workspaceId)
      .in("scope", ["shared", roleScope])
      .order("times_reinforced", { ascending: false })
      .limit(40),
    supabase
      .from("brain_patterns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .in("role_scope", ["shared", roleScope])
      .eq("is_active", true)
      .order("confidence", { ascending: false })
      .limit(20),
    supabase
      .from("activity_logs")
      .select("type, message, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("platform_connections")
      .select("platform, connected, status")
      .eq("workspace_id", workspaceId)
      .eq("connected", true),
  ]);

  const ws = workspaceRes.data;
  const memories = memoriesRes.data || [];
  const patterns = patternsRes.data || [];
  const activity = activityRes.data || [];
  const connections = connectionsRes.data || [];

  const sharedParts = [
    ws?.business_name ? `Business Name: ${ws.business_name}` : "",
    ws?.industry ? `Industry: ${ws.industry}` : "",
    ws?.audience ? `Target Audience: ${ws.audience}` : "",
    ws?.brand_tone ? `Brand Tone: ${ws.brand_tone}` : "",
    ws?.goals ? `Business Goals: ${ws.goals}` : "",
    ws?.website ? `Website: ${ws.website}` : "",
    connections.length > 0 ? `Connected Tools: ${connections.map((c: any) => c.platform).join(", ")}` : "",
  ].filter(Boolean);
  const sharedContext = sharedParts.length > 0
    ? `WORKSPACE IDENTITY:\n${sharedParts.join("\n")}`
    : "";

  const roleMemories = memories.filter((m: any) => m.scope === roleScope);
  const sharedMemories = memories.filter((m: any) => m.scope === "shared");

  const memoryLines = [
    ...sharedMemories.map((m: any) =>
      `[shared/${m.category}] ${m.memory_key}: ${m.memory_value} (confidence: ${Math.round(m.confidence * 100)}%, reinforced: ${m.times_reinforced}x)`
    ),
    ...roleMemories.map((m: any) =>
      `[${roleScope}/${m.category}] ${m.memory_key}: ${m.memory_value} (confidence: ${Math.round(m.confidence * 100)}%, reinforced: ${m.times_reinforced}x)`
    ),
  ];

  const patternLines = patterns.map((p: any) =>
    `[${p.pattern_type}] ${p.description} (confidence: ${Math.round(p.confidence * 100)}%, observed: ${p.evidence_count}x)`
  );

  const roleContext = [
    memoryLines.length > 0 ? `LEARNED PREFERENCES & MEMORY:\n${memoryLines.join("\n")}` : "",
    patternLines.length > 0 ? `BEHAVIORAL PATTERNS (from past approvals, edits, and rejections):\n${patternLines.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");

  const activityLines = activity.map((a: any) =>
    `[${new Date(a.created_at).toLocaleDateString()}] ${a.type}: ${a.message}`
  );
  const recentActivity = activityLines.length > 0
    ? `RECENT WORKSPACE ACTIVITY:\n${activityLines.join("\n")}`
    : "";

  const fullPromptBlock = [sharedContext, roleContext, recentActivity].filter(Boolean).join("\n\n");

  return { sharedContext, roleContext, recentActivity, fullPromptBlock };
}

export const INTELLIGENCE_ENGINE_PREAMBLE = `You are powered by VANTABRAIN — an adaptive intelligence engine that learns from this business over time.

INTELLIGENCE PRINCIPLES:
1. You have access to the business's shared brain: identity, goals, audience, tone, and connected tools.
2. You have access to role-specific memory: learned preferences from past approvals, edits, and rejections.
3. You have access to behavioral patterns: recurring choices the user has made that indicate preferences.
4. You MUST use this context to make your outputs smarter, more personalized, and more consistent with past behavior.
5. When you make a recommendation, ALWAYS explain WHY in plain English — reference specific memories or patterns.
6. You are NOT a generic text generator. You are an intelligence engine that knows this business and acts accordingly.
7. Human approval is still required for sensitive actions. Flag when something needs review.
8. If you see a pattern that suggests a specific approach, mention it: e.g. "Based on your pattern of posting at 5 PM, I'm suggesting that time again."
9. If you lack context, say so honestly rather than guessing.

TRUST & SAFETY RULES:
1. NEVER silently automate high-impact business actions (public posts, live campaign sends, important support responses, sensitive task decisions). Always flag these for human review.
2. ALWAYS explain your reasoning in plain English. Use phrases like "Based on repeated approvals...", "Based on your usual posting time...", "Based on similar past support cases..."
3. Learning must be GRADUAL — never form strong preferences from a single action. Require at least 2-3 consistent signals before suggesting a pattern.
4. Confidence scoring must be transparent — always show how confident you are and why.
5. Users can reject, edit, or reset any learned preference. Respect their control absolutely.
6. If learning is paused by the user, do NOT update memories or patterns — only use existing context for generation.
7. When a suggestion is uncertain (confidence < 60%), present it as a gentle question rather than a strong recommendation.
8. Never share data or patterns across workspaces — each business brain is completely isolated.
9. If you detect conflicting patterns (e.g., user approved at 5 PM but also at 9 AM), mention the conflict rather than picking one silently.`;
