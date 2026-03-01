import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface ShopifySettings {
  id: string;
  workspace_id: string;
  shop_domain: string;
  shop_name: string | null;
  currency: string | null;
  scopes: string | null;
  use_for_support_ai: boolean;
  use_for_email_marketing: boolean;
  use_for_social_content: boolean;
  enable_product_context: boolean;
  enable_collection_context: boolean;
  synced_products: any[] | null;
  synced_collections: any[] | null;
  store_metadata: any;
  last_synced_at: string | null;
  platform_connection_id: string | null;
}

export const useShopify = () => {
  const { workspace } = useAuth();
  const [settings, setSettings] = useState<ShopifySettings | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const workspaceId = workspace?.id;

  const fetchSettings = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    const { data } = await supabase
      .from("shopify_store_settings")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (data) {
      setSettings(data as ShopifySettings);
      // Check if actually connected via platform_connections
      const { data: conn } = await supabase
        .from("platform_connections")
        .select("connected")
        .eq("workspace_id", workspaceId)
        .eq("platform", "shopify")
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

  const startConnect = useCallback(async (shopDomain: string) => {
    if (!workspaceId) return;
    setConnecting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-oauth-start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shop_domain: shopDomain }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start Shopify OAuth");

      // Redirect user to Shopify
      window.location.href = data.auth_url;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect to Shopify",
        variant: "destructive",
      });
      setConnecting(false);
    }
  }, [workspaceId]);

  const syncStore = useCallback(async () => {
    if (!workspaceId) return;
    setSyncing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync-store`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      toast({
        title: "Store synced",
        description: `${data.products_count} products, ${data.collections_count} collections synced`,
      });
      await fetchSettings();
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Could not sync store",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }, [workspaceId, fetchSettings]);

  const disconnect = useCallback(async () => {
    if (!workspaceId) return;
    try {
      await supabase
        .from("platform_connections")
        .update({ connected: false, status: "disconnected", account_name: "" })
        .eq("workspace_id", workspaceId)
        .eq("platform", "shopify");

      await supabase
        .from("shopify_store_settings")
        .update({ access_token_encrypted: "" })
        .eq("workspace_id", workspaceId);

      setIsConnected(false);
      toast({ title: "Shopify disconnected" });
      await fetchSettings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Shopify",
        variant: "destructive",
      });
    }
  }, [workspaceId, fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<ShopifySettings>) => {
    if (!workspaceId || !settings) return;
    const { error } = await supabase
      .from("shopify_store_settings")
      .update(updates)
      .eq("workspace_id", workspaceId);

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
    syncing,
    connecting,
    startConnect,
    syncStore,
    disconnect,
    updateSettings,
    refetch: fetchSettings,
  };
};
