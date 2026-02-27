import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface BrainIntelligence {
  sharedContext: string;
  roleContext: string;
  recentActivity: string;
  fullPromptBlock: string;
}

export async function fetchBrainIntelligence(
  supabase: ReturnType<typeof createClient>,
  workspaceId: string,
  roleScope: string
): Promise<BrainIntelligence> {
  // Fetch all context in parallel
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

  // Build shared workspace context
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

  // Build role-specific memory
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

  // Build recent activity
  const activityLines = activity.map((a: any) =>
    `[${new Date(a.created_at).toLocaleDateString()}] ${a.type}: ${a.message}`
  );
  const recentActivity = activityLines.length > 0
    ? `RECENT WORKSPACE ACTIVITY:\n${activityLines.join("\n")}`
    : "";

  // Full prompt block
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
9. If you lack context, say so honestly rather than guessing.`;
