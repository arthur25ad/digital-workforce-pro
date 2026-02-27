import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface SupportKnowledgeBase {
  id: string;
  workspace_id: string;
  business_overview: string | null;
  products_services: string | null;
  support_principles: string | null;
  brand_tone: string | null;
  refund_policy: string | null;
  shipping_policy: string | null;
  custom_policies: string | null;
  example_responses: string | null;
  sop_notes: string | null;
  support_hours: string | null;
  escalation_rules: string | null;
}

export interface SupportKnowledgeItem {
  id: string;
  workspace_id: string;
  title: string;
  content: string | null;
  item_type: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  workspace_id: string;
  channel: string;
  customer_name: string;
  customer_message: string;
  issue_type: string | null;
  urgency: string;
  sentiment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportDraft {
  id: string;
  workspace_id: string;
  ticket_id: string | null;
  issue_summary: string | null;
  suggested_reply: string | null;
  confidence_level: string | null;
  escalation_flag: boolean;
  referenced_policy: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useCustomerSupportData = () => {
  const { workspace } = useAuth();
  const [knowledgeBase, setKnowledgeBase] = useState<SupportKnowledgeBase | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<SupportKnowledgeItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [drafts, setDrafts] = useState<SupportDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const workspaceId = workspace?.id;

  const fetchKnowledgeBase = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("support_knowledge_bases")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single();
    if (data) setKnowledgeBase(data as unknown as SupportKnowledgeBase);
  }, [workspaceId]);

  const fetchKnowledgeItems = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("support_knowledge_items")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setKnowledgeItems(data as unknown as SupportKnowledgeItem[]);
  }, [workspaceId]);

  const fetchTickets = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setTickets(data as unknown as SupportTicket[]);
  }, [workspaceId]);

  const fetchDrafts = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("support_drafts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setDrafts(data as unknown as SupportDraft[]);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      setLoading(true);
      Promise.all([fetchKnowledgeBase(), fetchKnowledgeItems(), fetchTickets(), fetchDrafts()])
        .finally(() => setLoading(false));
    }
  }, [workspaceId, fetchKnowledgeBase, fetchKnowledgeItems, fetchTickets, fetchDrafts]);

  const updateKnowledgeBase = async (updates: Partial<SupportKnowledgeBase>) => {
    if (!knowledgeBase) return;
    const { error } = await supabase
      .from("support_knowledge_bases")
      .update(updates as any)
      .eq("id", knowledgeBase.id);
    if (!error) setKnowledgeBase({ ...knowledgeBase, ...updates });
  };

  const addKnowledgeItem = async (title: string, content: string = "", itemType: string = "document") => {
    if (!workspaceId) return null;
    const { data, error } = await supabase
      .from("support_knowledge_items")
      .insert({ workspace_id: workspaceId, title, content, item_type: itemType } as any)
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to add knowledge item", variant: "destructive" });
      return null;
    }
    const item = data as unknown as SupportKnowledgeItem;
    setKnowledgeItems((prev) => [item, ...prev]);
    await logSupportActivity("knowledge_added", `Added: ${title}`);
    return item;
  };

  const removeKnowledgeItem = async (id: string) => {
    const { error } = await supabase.from("support_knowledge_items").delete().eq("id", id);
    if (!error) setKnowledgeItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addTicket = async (ticket: Omit<SupportTicket, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("support_tickets")
      .insert(ticket as any)
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
      return null;
    }
    const t = data as unknown as SupportTicket;
    setTickets((prev) => [t, ...prev]);
    await logSupportActivity("ticket_created", `New ticket from ${ticket.customer_name}`);
    return t;
  };

  const updateTicketStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("support_tickets").update({ status } as any).eq("id", id);
    if (!error) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      await logSupportActivity("ticket_updated", `Ticket ${status}`);
    }
  };

  const addSupportDraft = async (draft: Omit<SupportDraft, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("support_drafts")
      .insert(draft as any)
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create draft", variant: "destructive" });
      return null;
    }
    const d = data as unknown as SupportDraft;
    setDrafts((prev) => [d, ...prev]);
    return d;
  };

  const updateDraftStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("support_drafts").update({ status } as any).eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      await logSupportActivity("draft_updated", `Support draft ${status}`);
    }
  };

  const updateDraftReply = async (id: string, suggestedReply: string) => {
    const { error } = await supabase.from("support_drafts").update({ suggested_reply: suggestedReply, status: "edited" } as any).eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, suggested_reply: suggestedReply, status: "edited" } : d)));
    }
  };

  const logSupportActivity = async (type: string, message: string) => {
    if (!workspaceId) return;
    await supabase.from("activity_logs").insert({ workspace_id: workspaceId, type, message });
  };

  // Platform connections reuse the shared platform_connections table
  const [connections, setConnections] = useState<any[]>([]);

  const fetchConnections = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("workspace_id", workspaceId);
    if (data) setConnections(data);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) fetchConnections();
  }, [workspaceId, fetchConnections]);

  const connectChannel = async (platform: string, accountName: string) => {
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
        return [...filtered, data];
      });
      await logSupportActivity("channel_connected", `Connected ${platform}`);
    }
  };

  const disconnectChannel = async (platform: string) => {
    if (!workspaceId) return;
    const { error } = await supabase
      .from("platform_connections")
      .update({ connected: false, status: "disconnected", account_name: "" })
      .eq("workspace_id", workspaceId)
      .eq("platform", platform);
    if (!error) {
      setConnections((prev) => prev.map((c) => c.platform === platform ? { ...c, connected: false, status: "disconnected", account_name: "" } : c));
      await logSupportActivity("channel_disconnected", `Disconnected ${platform}`);
    }
  };

  const isChannelConnected = (platform: string) => connections.some((c) => c.platform === platform && c.connected);
  const getChannelConnection = (platform: string) => connections.find((c) => c.platform === platform);

  // Activity logs
  const [activities, setActivities] = useState<any[]>([]);

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
    if (workspaceId) fetchActivities();
  }, [workspaceId, fetchActivities]);

  return {
    knowledgeBase, knowledgeItems, tickets, drafts, connections, activities, loading,
    updateKnowledgeBase, addKnowledgeItem, removeKnowledgeItem,
    addTicket, updateTicketStatus,
    addSupportDraft, updateDraftStatus, updateDraftReply,
    connectChannel, disconnectChannel, isChannelConnected, getChannelConnection,
    logSupportActivity, fetchActivities, fetchTickets, fetchDrafts,
  };
};
