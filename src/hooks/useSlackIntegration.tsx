import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type SlackSettings = Tables<"slack_workspace_settings">;

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
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const workspaceId = workspace?.id;

  const fetchSlackStatus = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
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
          .from("slack_workspace_settings")
          .select("*")
          .eq("workspace_id", workspaceId)
          .single();
        setSettings(slackSettings ?? null);
      } else {
        setSettings(null);
      }
    } catch {
      // Table may not exist yet or no data
      setIsConnected(false);
      setSettings(null);
    } finally {
      setLoading(false);
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

  const sendNotification = async (text: string, notificationType?: string, channel?: string): Promise<boolean> => {
    if (!workspaceId || !session?.access_token || !isConnected || !settings) return false;

    // Check if notifications are enabled globally
    if (!settings.notifications_enabled) return false;

    // Check if the specific notification type is enabled
    if (notificationType) {
      const toggleKey = `${notificationType}_enabled` as keyof SlackSettings;
      if (settings[toggleKey] === false) return false;
    }

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
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from("slack_workspace_settings")
        .update(updates)
        .eq("workspace_id", workspaceId);
      if (error) throw error;

      setSettings({ ...settings, ...updates } as SlackSettings);
      await supabase.from("activity_logs").insert({
        workspace_id: workspaceId,
        type: "slack_settings_updated",
        message: "Updated Slack notification settings",
      });
      toast({ title: "Slack settings saved" });
    } catch (err: any) {
      toast({ title: "Failed to save settings", description: err.message, variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const setDefaultChannel = async (channelId: string, channelName: string) => {
    await updateSettings({
      default_channel_id: channelId,
      default_channel_name: channelName,
    });
    await supabase.from("activity_logs").insert({
      workspace_id: workspaceId!,
      type: "slack_channel_changed",
      message: `Changed default Slack channel to ${channelName}`,
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
    savingSettings,
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
