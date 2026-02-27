import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface SocialDraft {
  id: string;
  workspace_id: string;
  platform: string;
  idea_title: string;
  hook: string | null;
  caption: string | null;
  cta: string | null;
  format: string | null;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformConnection {
  id: string;
  workspace_id: string;
  platform: string;
  account_name: string | null;
  connected: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  status: string;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  type: string;
  message: string;
  created_at: string;
}

export const useWorkspaceData = () => {
  const { workspace } = useAuth();
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  const workspaceId = workspace?.id;

  const fetchDrafts = useCallback(async () => {
    if (!workspaceId) return;
    setLoadingDrafts(true);
    const { data } = await supabase
      .from("social_drafts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setDrafts(data as SocialDraft[]);
    setLoadingDrafts(false);
  }, [workspaceId]);

  const fetchConnections = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (data) setConnections(data as PlatformConnection[]);
  }, [workspaceId]);

  const fetchActivities = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setActivities(data as ActivityLog[]);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      fetchDrafts();
      fetchConnections();
      fetchActivities();
    }
  }, [workspaceId, fetchDrafts, fetchConnections, fetchActivities]);

  const addDraft = async (draft: Omit<SocialDraft, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("social_drafts").insert(draft).select().single();
    if (error) {
      toast({ title: "Error", description: "Failed to create draft", variant: "destructive" });
      return null;
    }
    setDrafts((prev) => [data as SocialDraft, ...prev]);
    await logActivity("draft_created", `Created draft: ${draft.idea_title}`);
    return data as SocialDraft;
  };

  const updateDraftStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("social_drafts").update({ status }).eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      await logActivity("draft_updated", `Draft ${status}`);
    }
  };

  const updateDraftSchedule = async (id: string, scheduledDate: string) => {
    const { error } = await supabase.from("social_drafts").update({ scheduled_date: scheduledDate, status: "scheduled" }).eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, scheduled_date: scheduledDate, status: "scheduled" } : d)));
      await logActivity("draft_scheduled", `Draft scheduled`);
    }
  };

  const connectPlatform = async (platform: string, accountName: string) => {
    if (!workspaceId) return;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("platform_connections")
      .upsert({
        workspace_id: workspaceId,
        platform,
        account_name: accountName,
        connected: true,
        connected_at: now,
        status: "connected",
      }, { onConflict: "workspace_id,platform" })
      .select()
      .single();
    if (!error && data) {
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.platform !== platform);
        return [...filtered, data as PlatformConnection];
      });
      await logActivity("platform_connected", `Connected ${platform}`);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    if (!workspaceId) return;
    const { error } = await supabase
      .from("platform_connections")
      .update({ connected: false, status: "disconnected", account_name: "" })
      .eq("workspace_id", workspaceId)
      .eq("platform", platform);
    if (!error) {
      setConnections((prev) => prev.map((c) => c.platform === platform ? { ...c, connected: false, status: "disconnected", account_name: "" } : c));
      await logActivity("platform_disconnected", `Disconnected ${platform}`);
    }
  };

  const isConnected = (platform: string) => connections.some((c) => c.platform === platform && c.connected);
  const getConnection = (platform: string) => connections.find((c) => c.platform === platform);

  const logActivity = async (type: string, message: string) => {
    if (!workspaceId) return;
    const { data } = await supabase.from("activity_logs").insert({ workspace_id: workspaceId, type, message }).select().single();
    if (data) setActivities((prev) => [data as ActivityLog, ...prev.slice(0, 19)]);
  };

  return {
    drafts, connections, activities, loadingDrafts,
    fetchDrafts, fetchConnections, fetchActivities,
    addDraft, updateDraftStatus, updateDraftSchedule,
    connectPlatform, disconnectPlatform, isConnected, getConnection,
    logActivity,
  };
};
