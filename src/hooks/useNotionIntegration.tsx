import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NotionConnection {
  id: string;
  workspace_id: string;
  notion_workspace_name: string | null;
  connected_at: string;
  last_synced_at: string | null;
  status: string;
}

interface NotionSyncedPage {
  id: string;
  title: string | null;
  notion_page_id: string;
  page_url: string | null;
  last_synced_at: string;
}

export function useNotionIntegration(workspaceId: string | null) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<NotionConnection | null>(null);
  const [pages, setPages] = useState<NotionSyncedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const fetchConnection = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notion_connections")
        .select("id, workspace_id, notion_workspace_name, connected_at, last_synced_at, status")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      
      if (!error && data) {
        setConnection(data);
        // Also fetch synced pages
        const { data: pagesData } = await supabase
          .from("notion_synced_pages")
          .select("id, title, notion_page_id, page_url, last_synced_at")
          .eq("workspace_id", workspaceId)
          .order("last_synced_at", { ascending: false });
        setPages(pagesData || []);
      } else {
        setConnection(null);
        setPages([]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const startConnect = useCallback(async () => {
    if (!workspaceId || !user) return;
    setConnecting(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const redirectUri = `${window.location.origin}/notion-callback`;
      
      const { data, error } = await supabase.functions.invoke("notion-oauth-start", {
        body: { workspace_id: workspaceId, redirect_uri: redirectUri },
      });

      if (error || !data?.url) {
        toast.error("Could not start Notion connection. Please try again.");
        return;
      }

      // Open Notion OAuth in a popup
      const popup = window.open(data.url, "notion-auth", "width=600,height=700,scrollbars=yes");
      
      // Listen for the callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "notion-oauth-success") {
          window.removeEventListener("message", handleMessage);
          toast.success("Notion connected! Syncing your business notes...");
          fetchConnection();
          syncPages();
        } else if (event.data?.type === "notion-oauth-error") {
          window.removeEventListener("message", handleMessage);
          toast.error("Could not connect to Notion. Please try again.");
        }
      };
      window.addEventListener("message", handleMessage);

      // Fallback: check periodically if popup closed
      const checkInterval = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkInterval);
          window.removeEventListener("message", handleMessage);
          // Check if connection was made
          setTimeout(() => fetchConnection(), 1500);
        }
      }, 1000);

    } catch (err) {
      console.error("Error starting Notion connection:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setConnecting(false);
    }
  }, [workspaceId, user, fetchConnection]);

  const syncPages = useCallback(async () => {
    if (!workspaceId) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("notion-sync-pages", {
        body: { workspace_id: workspaceId },
      });

      if (error) {
        toast.error("Could not sync Notion pages.");
        return;
      }

      toast.success(`Synced ${data.synced_pages} business notes from Notion`);
      await fetchConnection();
    } catch {
      toast.error("Something went wrong while syncing.");
    } finally {
      setSyncing(false);
    }
  }, [workspaceId, fetchConnection]);

  const disconnect = useCallback(async () => {
    if (!workspaceId) return;
    try {
      await supabase.from("notion_synced_pages").delete().eq("workspace_id", workspaceId);
      await supabase.from("notion_connections").delete().eq("workspace_id", workspaceId);
      await supabase.from("platform_connections").delete().eq("workspace_id", workspaceId).eq("platform", "notion");
      setConnection(null);
      setPages([]);
      toast.success("Notion disconnected");
    } catch {
      toast.error("Could not disconnect Notion.");
    }
  }, [workspaceId]);

  return {
    connection,
    pages,
    loading,
    syncing,
    connecting,
    startConnect,
    syncPages,
    disconnect,
    refresh: fetchConnection,
  };
}
