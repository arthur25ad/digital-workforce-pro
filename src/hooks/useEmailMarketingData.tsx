import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface EmailBrandProfile {
  id: string;
  workspace_id: string;
  business_overview: string | null;
  audience_description: string | null;
  brand_voice: string | null;
  offer_summary: string | null;
  campaign_goals: string | null;
  preferred_email_style: string | null;
  frequency_preference: string | null;
  keywords: string | null;
  approval_required: boolean;
}

export interface EmailCampaign {
  id: string;
  workspace_id: string;
  name: string;
  campaign_type: string;
  target_audience: string | null;
  objective: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmailDraft {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  subject_line: string | null;
  preview_text: string | null;
  body_copy: string | null;
  call_to_action: string | null;
  email_type: string | null;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAudienceList {
  id: string;
  workspace_id: string;
  list_name: string;
  audience_type: string | null;
  estimated_size: number | null;
  status: string;
  created_at: string;
}

export const useEmailMarketingData = () => {
  const { workspace } = useAuth();
  const [brandProfile, setBrandProfile] = useState<EmailBrandProfile | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [audienceLists, setAudienceLists] = useState<EmailAudienceList[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const workspaceId = workspace?.id;

  const fetchBrandProfile = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("email_brand_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();
    if (data) setBrandProfile(data as unknown as EmailBrandProfile);
  }, [workspaceId]);

  const fetchCampaigns = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setCampaigns(data as unknown as EmailCampaign[]);
  }, [workspaceId]);

  const fetchDrafts = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("email_drafts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setDrafts(data as unknown as EmailDraft[]);
  }, [workspaceId]);

  const fetchAudienceLists = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("email_audience_lists")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setAudienceLists(data as unknown as EmailAudienceList[]);
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
      Promise.all([
        fetchBrandProfile(), fetchCampaigns(), fetchDrafts(),
        fetchAudienceLists(), fetchConnections(), fetchActivities(),
      ]).finally(() => setLoading(false));
    }
  }, [workspaceId, fetchBrandProfile, fetchCampaigns, fetchDrafts, fetchAudienceLists, fetchConnections, fetchActivities]);

  const logActivity = async (type: string, message: string) => {
    if (!workspaceId) return;
    await supabase.from("activity_logs").insert({ workspace_id: workspaceId, type, message });
    fetchActivities();
  };

  const updateBrandProfile = async (updates: Partial<EmailBrandProfile>) => {
    if (!brandProfile) return;
    const { error } = await supabase
      .from("email_brand_profiles")
      .update(updates as any)
      .eq("id", brandProfile.id);
    if (!error) setBrandProfile({ ...brandProfile, ...updates });
  };

  // Campaigns
  const addCampaign = async (campaign: { name: string; campaign_type: string; target_audience?: string; objective?: string }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("email_campaigns")
      .insert({ workspace_id: workspaceId, ...campaign } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" }); return null; }
    const c = data as unknown as EmailCampaign;
    setCampaigns((prev) => [c, ...prev]);
    await logActivity("campaign_created", `Created campaign: ${campaign.name}`);
    return c;
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("email_campaigns").update({ status } as any).eq("id", id);
    if (!error) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      await logActivity("campaign_updated", `Campaign ${status}`);
    }
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
    if (!error) setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  // Drafts
  const addDraft = async (draft: { campaign_id?: string; subject_line: string; preview_text?: string; body_copy?: string; call_to_action?: string; email_type?: string }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("email_drafts")
      .insert({ workspace_id: workspaceId, ...draft } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to save draft", variant: "destructive" }); return null; }
    const d = data as unknown as EmailDraft;
    setDrafts((prev) => [d, ...prev]);
    await logActivity("draft_created", `Saved draft: ${draft.subject_line}`);
    return d;
  };

  const updateDraftStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("email_drafts").update({ status } as any).eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      await logActivity("draft_updated", `Email draft ${status}`);
    }
  };

  const updateDraft = async (id: string, updates: Partial<EmailDraft>) => {
    const { error } = await supabase.from("email_drafts").update(updates as any).eq("id", id);
    if (!error) setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const duplicateDraft = async (id: string) => {
    const original = drafts.find((d) => d.id === id);
    if (!original || !workspaceId) return;
    const { data, error } = await supabase
      .from("email_drafts")
      .insert({
        workspace_id: workspaceId,
        campaign_id: original.campaign_id,
        subject_line: original.subject_line,
        preview_text: original.preview_text,
        body_copy: original.body_copy,
        call_to_action: original.call_to_action,
        email_type: original.email_type,
        status: "draft",
      } as any)
      .select()
      .single();
    if (!error && data) {
      setDrafts((prev) => [data as unknown as EmailDraft, ...prev]);
      await logActivity("draft_duplicated", `Duplicated: ${original.subject_line}`);
    }
  };

  const scheduleDraft = async (id: string, date: string) => {
    const { error } = await supabase
      .from("email_drafts")
      .update({ status: "scheduled", scheduled_date: date } as any)
      .eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "scheduled", scheduled_date: date } : d)));
      await logActivity("email_scheduled", `Email scheduled for ${new Date(date).toLocaleDateString()}`);
    }
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from("email_drafts").delete().eq("id", id);
    if (!error) setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  // Audience Lists
  const addAudienceList = async (list: { list_name: string; audience_type?: string; estimated_size?: number }) => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("email_audience_lists")
      .insert({ workspace_id: workspaceId, ...list } as any)
      .select()
      .single();
    if (error) { toast({ title: "Error", description: "Failed to create audience list", variant: "destructive" }); return null; }
    const l = data as unknown as EmailAudienceList;
    setAudienceLists((prev) => [l, ...prev]);
    await logActivity("audience_created", `Created audience: ${list.list_name}`);
    return l;
  };

  const deleteAudienceList = async (id: string) => {
    const { error } = await supabase.from("email_audience_lists").delete().eq("id", id);
    if (!error) setAudienceLists((prev) => prev.filter((l) => l.id !== id));
  };

  // Sender connections - reuse platform_connections
  const connectSender = async (platform: string, accountName: string) => {
    if (!workspaceId) return;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("platform_connections")
      .upsert({ workspace_id: workspaceId, platform, account_name: accountName, connected: true, connected_at: now, status: "connected" }, { onConflict: "workspace_id,platform" })
      .select()
      .single();
    if (!error && data) {
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.platform !== platform);
        return [...filtered, data];
      });
      await logActivity("sender_connected", `Connected ${platform}`);
    }
  };

  const disconnectSender = async (platform: string) => {
    if (!workspaceId) return;
    const { error } = await supabase
      .from("platform_connections")
      .update({ connected: false, status: "disconnected", account_name: "" })
      .eq("workspace_id", workspaceId)
      .eq("platform", platform);
    if (!error) {
      setConnections((prev) => prev.map((c) => c.platform === platform ? { ...c, connected: false, status: "disconnected", account_name: "" } : c));
      await logActivity("sender_disconnected", `Disconnected ${platform}`);
    }
  };

  const isSenderConnected = (platform: string) => connections.some((c) => c.platform === platform && c.connected);
  const getSenderConnection = (platform: string) => connections.find((c) => c.platform === platform);

  return {
    brandProfile, campaigns, drafts, audienceLists, connections, activities, loading,
    updateBrandProfile,
    addCampaign, updateCampaignStatus, deleteCampaign,
    addDraft, updateDraftStatus, updateDraft, duplicateDraft, scheduleDraft, deleteDraft,
    addAudienceList, deleteAudienceList,
    connectSender, disconnectSender, isSenderConnected, getSenderConnection,
    logActivity, fetchCampaigns, fetchDrafts, fetchActivities,
  };
};
