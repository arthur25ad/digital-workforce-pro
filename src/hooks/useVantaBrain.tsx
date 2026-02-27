import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BrainStats {
  totalMemories: number;
  totalPatterns: number;
  totalInteractions: number;
}

interface BrainMemory {
  id: string;
  scope: string;
  category: string;
  memory_key: string;
  memory_value: string;
  confidence: number;
  times_reinforced: number;
  created_at: string;
}

interface BrainPattern {
  id: string;
  role_scope: string;
  pattern_type: string;
  description: string;
  confidence: number;
  evidence_count: number;
  is_active: boolean;
  created_at: string;
}

export function useVantaBrainStats() {
  const { workspace } = useAuth();
  const [stats, setStats] = useState<BrainStats>({ totalMemories: 0, totalPatterns: 0, totalInteractions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.id) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("vantabrain", {
        body: { action: "get-stats", workspaceId: workspace.id },
      });
      if (!error && data) setStats(data);
      setLoading(false);
    };
    load();
  }, [workspace?.id]);

  return { stats, loading };
}

export function useVantaBrainMemories(roleScope?: string) {
  const { workspace } = useAuth();
  const [memories, setMemories] = useState<BrainMemory[]>([]);
  const [patterns, setPatterns] = useState<BrainPattern[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);

    const scopes = roleScope ? ["shared", roleScope] : ["shared"];

    const [memRes, patRes] = await Promise.all([
      supabase
        .from("brain_memories")
        .select("*")
        .eq("workspace_id", workspace.id)
        .in("scope", scopes)
        .order("times_reinforced", { ascending: false })
        .limit(50),
      supabase
        .from("brain_patterns")
        .select("*")
        .eq("workspace_id", workspace.id)
        .in("role_scope", scopes)
        .eq("is_active", true)
        .order("confidence", { ascending: false })
        .limit(20),
    ]);

    setMemories((memRes.data as any[]) || []);
    setPatterns((patRes.data as any[]) || []);
    setLoading(false);
  }, [workspace?.id, roleScope]);

  useEffect(() => { refresh(); }, [refresh]);

  return { memories, patterns, loading, refresh };
}

export function useVantaBrainActions() {
  const { workspace } = useAuth();

  const recordInteraction = useCallback(async (params: {
    roleScope: string;
    interactionType: "approval" | "edit" | "rejection" | "generation";
    actionTaken: string;
    originalContent?: string;
    editedContent?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!workspace?.id) return;
    await supabase.functions.invoke("vantabrain", {
      body: {
        action: "record-interaction",
        workspaceId: workspace.id,
        ...params,
      },
    });
  }, [workspace?.id]);

  const triggerLearn = useCallback(async (roleScope: string) => {
    if (!workspace?.id) return null;
    const { data, error } = await supabase.functions.invoke("vantabrain", {
      body: { action: "learn", workspaceId: workspace.id, roleScope },
    });
    if (error) return null;
    return data;
  }, [workspace?.id]);

  const getContext = useCallback(async (roleScope: string): Promise<string> => {
    if (!workspace?.id) return "";
    const { data, error } = await supabase.functions.invoke("vantabrain", {
      body: { action: "get-context", workspaceId: workspace.id, roleScope },
    });
    if (error || !data) return "";
    return data.context || "";
  }, [workspace?.id]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    await supabase.from("brain_memories").delete().eq("id", memoryId);
  }, []);

  const deletePattern = useCallback(async (patternId: string) => {
    await supabase.from("brain_patterns").update({ is_active: false }).eq("id", patternId);
  }, []);

  return { recordInteraction, triggerLearn, getContext, deleteMemory, deletePattern };
}
