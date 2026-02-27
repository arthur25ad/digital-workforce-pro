import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface AssistantProfile {
  id: string;
  workspace_id: string;
  business_overview: string | null;
  main_responsibilities: string | null;
  preferred_tone: string | null;
  priority_rules: string | null;
  recurring_tasks: string | null;
  communication_preferences: string | null;
  important_notes: string | null;
  approval_required: boolean;
}

export interface AssistantTask {
  id: string;
  workspace_id: string;
  title: string;
  category: string;
  description: string;
  priority: string;
  due_date: string | null;
  status: string;
  assigned_type: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantRequest {
  id: string;
  workspace_id: string;
  source: string;
  requester_name: string;
  request_summary: string;
  request_details: string;
  urgency: string;
  recommended_action: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantDraft {
  id: string;
  workspace_id: string;
  request_id: string | null;
  draft_type: string;
  subject: string;
  draft_content: string;
  next_step: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useVirtualAssistantData = () => {
  const { workspace } = useAuth();
  const [profile, setProfile] = useState<AssistantProfile | null>(null);
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [requests, setRequests] = useState<AssistantRequest[]>([]);
  const [drafts, setDrafts] = useState<AssistantDraft[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const workspaceId = workspace?.id;

  const fetchProfile = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("assistant_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();
    if (data) setProfile(data as unknown as AssistantProfile);
  }, [workspaceId]);

  const fetchTasks = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("assistant_tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as unknown as AssistantTask[]);
  }, [workspaceId]);

  const fetchRequests = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("assistant_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setRequests(data as unknown as AssistantRequest[]);
  }, [workspaceId]);

  const fetchDrafts = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("assistant_drafts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setDrafts(data as unknown as AssistantDraft[]);
  }, [workspaceId]);

  const fetchConnections = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (data) setConnections(data);
  }, [workspaceId]);

  const fetchActivities = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setActivities(data);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      setLoading(true);
      Promise.all([fetchProfile(), fetchTasks(), fetchRequests(), fetchDrafts(), fetchConnections(), fetchActivities()])
        .finally(() => setLoading(false));
    }
  }, [workspaceId, fetchProfile, fetchTasks, fetchRequests, fetchDrafts, fetchConnections, fetchActivities]);

  const logActivity = async (type: string, message: string) => {
    if (!workspaceId) return;
    await supabase.from("activity_logs").insert({ workspace_id: workspaceId, type, message });
    fetchActivities();
  };

  const updateProfile = async (updates: Partial<AssistantProfile>) => {
    if (!profile) return;
    const { error } = await supabase
      .from("assistant_profiles")
      .update(updates as any)
      .eq("id", profile.id);
    if (!error) setProfile({ ...profile, ...updates });
  };

  const addRequest = async (req: { source: string; requester_name: string; request_summary: string; request_details: string; urgency: string }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("assistant_requests")
      .insert({ workspace_id: workspaceId, ...req } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to add request", variant: "destructive" }); return null; }
    const r = data as unknown as AssistantRequest;
    setRequests(prev => [r, ...prev]);
    await logActivity("request_added", `New request: ${req.request_summary}`);
    return r;
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("assistant_requests").update({ status } as any).eq("id", id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await logActivity("request_updated", `Request ${status}`);
    }
  };

  const addTask = async (task: { title: string; category?: string; description?: string; priority?: string; due_date?: string }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("assistant_tasks")
      .insert({ workspace_id: workspaceId, ...task } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to create task", variant: "destructive" }); return null; }
    const t = data as unknown as AssistantTask;
    setTasks(prev => [t, ...prev]);
    await logActivity("task_created", `Task: ${task.title}`);
    return t;
  };

  const updateTaskStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("assistant_tasks").update({ status } as any).eq("id", id);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      await logActivity("task_updated", `Task ${status}`);
    }
  };

  const addDraft = async (draft: { request_id?: string; draft_type: string; subject: string; draft_content: string; next_step: string }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("assistant_drafts")
      .insert({ workspace_id: workspaceId, ...draft } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to create draft", variant: "destructive" }); return null; }
    const d = data as unknown as AssistantDraft;
    setDrafts(prev => [d, ...prev]);
    await logActivity("draft_created", `Draft: ${draft.subject}`);
    return d;
  };

  const updateDraftStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("assistant_drafts").update({ status } as any).eq("id", id);
    if (!error) {
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      await logActivity("draft_updated", `Draft ${status}`);
    }
  };

  const updateDraftContent = async (id: string, content: string) => {
    const { error } = await supabase.from("assistant_drafts").update({ draft_content: content, status: "edited" } as any).eq("id", id);
    if (!error) {
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, draft_content: content, status: "edited" } : d));
    }
  };

  const connectTool = async (platform: string, accountName: string) => {
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
      setConnections(prev => {
        const filtered = prev.filter(c => c.platform !== platform);
        return [...filtered, data];
      });
      await logActivity("tool_connected", `Connected ${platform}`);
    }
  };

  const disconnectTool = async (platform: string) => {
    if (!workspaceId) return;
    const { error } = await supabase
      .from("platform_connections")
      .update({ connected: false, status: "disconnected", account_name: "" })
      .eq("workspace_id", workspaceId)
      .eq("platform", platform);
    if (!error) {
      setConnections(prev => prev.map(c => c.platform === platform ? { ...c, connected: false, status: "disconnected", account_name: "" } : c));
      await logActivity("tool_disconnected", `Disconnected ${platform}`);
    }
  };

  const isToolConnected = (platform: string) => connections.some(c => c.platform === platform && c.connected);
  const getToolConnection = (platform: string) => connections.find(c => c.platform === platform);

  return {
    profile, tasks, requests, drafts, connections, activities, loading,
    updateProfile, addRequest, updateRequestStatus,
    addTask, updateTaskStatus, addDraft, updateDraftStatus, updateDraftContent,
    connectTool, disconnectTool, isToolConnected, getToolConnection,
    logActivity, fetchActivities, fetchTasks, fetchRequests, fetchDrafts,
  };
};
