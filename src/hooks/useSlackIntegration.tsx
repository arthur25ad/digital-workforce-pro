import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface SlackSettings {
  id: string;
  workspace_id: string;
  slack_team_id: string | null;
  slack_team_name: string | null;
  slack_bot_user_id: string | null;
  slack_workspace_name: string | null;
  default_channel_id: string | null;
  default_channel_name: string | null;
  notifications_enabled: boolean;
  daily_summary_enabled: boolean;
  weekly_summary_enabled: boolean;
  support_alerts_enabled: boolean;
  content_approvals_enabled: boolean;
  marketing_updates_enabled: boolean;
  scheduling_alerts_enabled: boolean;
  billing_alerts_enabled: boolean;
  access_alerts_enabled: boolean;
  last_test_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_member: boolean;
  num_members: number;
}

export const useSlackIntegration = () => {
  const { workspace, session } = useAuth();
  const [settings, setSettings] = useState<SlackSettings | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const workspaceId = workspace?.id;

  const fetchSlackStatus = useCallback(async () => {
    if (!workspaceId) return;
    // Check platform_connections for Slack
    const { data: conn } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("platform", "Slack")
      .single();

    const connected = conn?.connected === true;
    setIsConnected(connected);

    if (connected) {
      const { data: slackSettings } = await supabase
        .from("slack_workspace_settings" as any)
        .select("*")
        .eq("workspace_id", workspaceId)
        .single();
      if (slackSettings) setSettings(slackSettings as unknown as SlackSettings);
    } else {
      setSettings(null);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchSlackStatus();
  }, [fetchSlackStatus]);

  const connectSlack = async () => {
    if (!workspaceId || !session?.access_token) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("slack-send", {
        body: { action: "connect", workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Slack connected!", description: `Connected to ${data.team_name}` });
      await fetchSlackStatus();
    } catch (err: any) {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const disconnectSlack = async () => {
    if (!workspaceId || !session?.access_token) return;
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("slack-send", {
        body: { action: "disconnect", workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIsConnected(false);
      setSettings(null);
      setChannels([]);
      toast({ title: "Slack disconnected" });
    } catch (err: any) {
      toast({ title: "Disconnect failed", description: err.message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const sendTestMessage = async (channel?: string) => {
    if (!workspaceId || !session?.access_token) return;
    setTestingSend(true);
    try {
      const { data, error } = await supabase.functions.invoke("slack-send", {
        body: { action: "test_message", workspaceId, channel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Test message sent!", description: "Check your Slack channel" });
      await fetchSlackStatus();
    } catch (err: any) {
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally {
      setTestingSend(false);
    }
  };

  const sendNotification = async (text: string, channel?: string) => {
    if (!workspaceId || !session?.access_token || !isConnected) return false;
    try {
      const { data, error } = await supabase.functions.invoke("slack-send", {
        body: { action: "send_message", workspaceId, text, channel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return true;
    } catch {
      return false;
    }
  };

  const fetchChannels = async () => {
    if (!workspaceId || !session?.access_token) return;
    setLoadingChannels(true);
    try {
      const { data, error } = await supabase.functions.invoke("slack-send", {
        body: { action: "list_channels", workspaceId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setChannels(data.channels || []);
    } catch (err: any) {
      toast({ title: "Failed to load channels", description: err.message, variant: "destructive" });
    } finally {
      setLoadingChannels(false);
    }
  };

  const updateSettings = async (updates: Partial<SlackSettings>) => {
    if (!workspaceId || !settings) return;
    const { error } = await supabase
      .from("slack_workspace_settings" as any)
      .update(updates as any)
      .eq("workspace_id", workspaceId);
    if (!error) {
      setSettings({ ...settings, ...updates } as SlackSettings);
      // Log activity
      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_settings_updated",
        message: "Updated Slack notification settings",
      });
      toast({ title: "Slack settings saved" });
    }
  };

  const setDefaultChannel = async (channelId: string, channelName: string) => {
    await updateSettings({
      default_channel_id: channelId,
      default_channel_name: channelName,
    });
  };

  return {
    settings,
    channels,
    isConnected,
    loading,
    connecting,
    testingSend,
    loadingChannels,
    connectSlack,
    disconnectSlack,
    sendTestMessage,
    sendNotification,
    fetchChannels,
    updateSettings,
    setDefaultChannel,
    fetchSlackStatus,
  };
};
