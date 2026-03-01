import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Handles the Notion OAuth callback redirect.
 * Extracts the code + state from URL, sends to the callback edge function,
 * then redirects back to the Intelligence Center.
 */
const NotionCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Notion connection was cancelled or denied.");
        // Try to tell opener
        if (window.opener) {
          window.opener.postMessage({ type: "notion-oauth-error" }, "*");
          window.close();
        } else {
          navigate("/vantabrain");
        }
        return;
      }

      if (!code || !state) {
        toast.error("Invalid callback. Please try again.");
        navigate("/vantabrain");
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/notion-callback`;
        
        const { data, error: fnError } = await supabase.functions.invoke("notion-oauth-callback", {
          body: { code, state, redirect_uri: redirectUri },
        });

        if (fnError || !data?.success) {
          toast.error("Could not complete Notion connection.");
          if (window.opener) {
            window.opener.postMessage({ type: "notion-oauth-error" }, "*");
            window.close();
          } else {
            navigate("/vantabrain");
          }
          return;
        }

        toast.success(`Connected to Notion${data.workspace_name ? `: ${data.workspace_name}` : ""}!`);

        if (window.opener) {
          window.opener.postMessage({ type: "notion-oauth-success" }, "*");
          window.close();
        } else {
          navigate("/vantabrain");
        }
      } catch (err) {
        console.error("Notion callback error:", err);
        toast.error("Something went wrong. Please try again.");
        navigate("/vantabrain");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Connecting your Notion...</p>
      </div>
    </div>
  );
};

export default NotionCallbackPage;
