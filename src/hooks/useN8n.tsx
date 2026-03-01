import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface N8nSettings {
  id: string;
  workspace_id: string;
  instance_url: string;
  webhook_secret: string;
  enable_lead_automations: boolean;
  enable_support_automations: boolean;
  enable_form_automations: boolean;
  enable_task_automations: boolean;
  webhook_url_leads: string;
  webhook_url_support: string;
  webhook_url_forms: string;
  webhook_url_tasks: string;
  webhook_url_general: string;
  last_triggered_at: string | null;
  total_triggers: number;
  platform_connection_id: string | null;
}

export const useN8n = () => {
  const { workspace } = useAuth();
  const [settings, setSettings] = useState<N8nSettings | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const workspaceId = workspace?.id;

  const fetchSettings = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);

    const { data } = await (supabase
      .from("n8n_workspace_settings" as any)
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle() as any);

    if (data) {
      setSettings(data as N8nSettings);
      // Check platform_connections for connected state
      const { data: conn } = await supabase
        .from("platform_connections")
        .select("connected")
        .eq("workspace_id", workspaceId)
        .eq("platform", "n8n")
        .maybeSingle();
      setIsConnected(conn?.connected === true);
    } else {
      setSettings(null);
      setIsConnected(false);
    }
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const connect = useCallback(async (webhookUrl: string) => {
    if (!workspaceId) return;
    try {
      // Test the webhook first
      const testRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "vantory",
          event_type: "connection_test",
          timestamp: new Date().toISOString(),
          data: { message: "Testing connection from VANTORY" },
        }),
      });

      if (!testRes.ok) {
        throw new Error(`Webhook responded with status ${testRes.status}. Please check your URL.`);
      }

      // Create or update platform_connections
      const { data: existingConn } = await supabase
        .from("platform_connections")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("platform", "n8n")
        .maybeSingle();

      let connectionId: string;

      if (existingConn) {
        await supabase
          .from("platform_connections")
          .update({
            connected: true,
            status: "active",
            connected_at: new Date().toISOString(),
            account_name: "Automation Engine",
          })
          .eq("id", existingConn.id);
        connectionId = existingConn.id;
      } else {
        const { data: newConn } = await supabase
          .from("platform_connections")
          .insert({
            workspace_id: workspaceId,
            platform: "n8n",
            connected: true,
            status: "active",
            connected_at: new Date().toISOString(),
            account_name: "Automation Engine",
          })
          .select("id")
          .single();
        connectionId = newConn!.id;
      }

      // Create or update n8n settings
      const { data: existingSettings } = await (supabase
        .from("n8n_workspace_settings" as any)
        .select("id")
        .eq("workspace_id", workspaceId)
        .maybeSingle() as any);

      if (existingSettings) {
        await (supabase
          .from("n8n_workspace_settings" as any)
          .update({
            webhook_url_general: webhookUrl,
            platform_connection_id: connectionId,
          })
          .eq("workspace_id", workspaceId) as any);
      } else {
        await (supabase
          .from("n8n_workspace_settings" as any)
          .insert({
            workspace_id: workspaceId,
            webhook_url_general: webhookUrl,
            platform_connection_id: connectionId,
          }) as any);
      }

      setIsConnected(true);
      toast({ title: "Automation connected", description: "Your workflow engine is now active." });
      await fetchSettings();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect to your automation engine",
        variant: "destructive",
      });
    }
  }, [workspaceId, fetchSettings]);

  const disconnect = useCallback(async () => {
    if (!workspaceId) return;
    try {
      await supabase
        .from("platform_connections")
        .update({ connected: false, status: "disconnected", account_name: "" })
        .eq("workspace_id", workspaceId)
        .eq("platform", "n8n");

      setIsConnected(false);
      toast({ title: "Automation disconnected" });
      await fetchSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  }, [workspaceId, fetchSettings]);

  const testWebhook = useCallback(async () => {
    if (!settings?.webhook_url_general) return;
    setTesting(true);
    try {
      const res = await fetch(settings.webhook_url_general, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "vantory",
          event_type: "test",
          timestamp: new Date().toISOString(),
          data: { message: "Test automation from VANTORY" },
        }),
      });

      if (res.ok) {
        toast({ title: "Test successful", description: "Your automation engine responded." });
      } else {
        toast({ title: "Test failed", description: `Webhook responded with status ${res.status}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Test failed", description: "Could not reach the webhook URL", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<N8nSettings>) => {
    if (!workspaceId || !settings) return;
    const { error } = await (supabase
      .from("n8n_workspace_settings" as any)
      .update(updates)
      .eq("workspace_id", workspaceId) as any);

    if (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    } else {
      setSettings((prev) => prev ? { ...prev, ...updates } : prev);
      toast({ title: "Settings updated" });
    }
  }, [workspaceId, settings]);

  return {
    settings,
    isConnected,
    loading,
    testing,
    connect,
    disconnect,
    testWebhook,
    updateSettings,
    refetch: fetchSettings,
  };
};
