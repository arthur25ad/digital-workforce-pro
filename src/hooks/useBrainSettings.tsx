import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface BrainSettings {
  id: string;
  workspace_id: string;
  learn_from_approvals: boolean;
  learn_from_edits: boolean;
  learn_timing_suggestions: boolean;
  require_approval: boolean;
  learning_paused: boolean;
}

const DEFAULTS: Omit<BrainSettings, "id" | "workspace_id"> = {
  learn_from_approvals: true,
  learn_from_edits: true,
  learn_timing_suggestions: true,
  require_approval: true,
  learning_paused: false,
};

export function useBrainSettings() {
  const { workspace } = useAuth();
  const [settings, setSettings] = useState<BrainSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("brain_settings")
      .select("*")
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (data) setSettings(data as BrainSettings);
    setLoading(false);
  }, [workspace?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (partial: Partial<Omit<BrainSettings, "id" | "workspace_id">>) => {
    if (!settings) return;
    const updated = { ...settings, ...partial };
    setSettings(updated);
    const { error } = await supabase
      .from("brain_settings")
      .update(partial)
      .eq("id", settings.id);
    if (error) {
      toast.error("Failed to save learning settings");
      fetch(); // revert
    }
  }, [settings, fetch]);

  const clearRoleMemory = useCallback(async (roleScope: string) => {
    if (!workspace?.id) return;
    const { error: memErr } = await supabase
      .from("brain_memories")
      .delete()
      .eq("workspace_id", workspace.id)
      .eq("scope", roleScope);
    const { error: patErr } = await supabase
      .from("brain_patterns")
      .update({ is_active: false })
      .eq("workspace_id", workspace.id)
      .eq("role_scope", roleScope);
    if (memErr || patErr) {
      toast.error("Failed to clear some memory");
    } else {
      toast.success(`Cleared all ${roleScope} memory and patterns`);
    }
  }, [workspace?.id]);

  const clearAllMemory = useCallback(async () => {
    if (!workspace?.id) return;
    await supabase.from("brain_memories").delete().eq("workspace_id", workspace.id);
    await supabase.from("brain_patterns").update({ is_active: false }).eq("workspace_id", workspace.id);
    toast.success("All learned preferences have been reset");
  }, [workspace?.id]);

  return {
    settings: settings || { ...DEFAULTS, id: "", workspace_id: "" } as BrainSettings,
    loading,
    update,
    clearRoleMemory,
    clearAllMemory,
    refresh: fetch,
  };
}
