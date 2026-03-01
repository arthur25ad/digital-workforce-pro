
-- n8n workspace settings for automation webhooks
CREATE TABLE public.n8n_workspace_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform_connection_id UUID REFERENCES public.platform_connections(id),
  instance_url TEXT NOT NULL DEFAULT '',
  webhook_secret TEXT DEFAULT '',
  -- Automation toggles
  enable_lead_automations BOOLEAN NOT NULL DEFAULT true,
  enable_support_automations BOOLEAN NOT NULL DEFAULT true,
  enable_form_automations BOOLEAN NOT NULL DEFAULT true,
  enable_task_automations BOOLEAN NOT NULL DEFAULT true,
  -- Webhook URLs for specific event types
  webhook_url_leads TEXT DEFAULT '',
  webhook_url_support TEXT DEFAULT '',
  webhook_url_forms TEXT DEFAULT '',
  webhook_url_tasks TEXT DEFAULT '',
  webhook_url_general TEXT DEFAULT '',
  -- Status
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_triggers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.n8n_workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own n8n settings"
  ON public.n8n_workspace_settings FOR SELECT
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own n8n settings"
  ON public.n8n_workspace_settings FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own n8n settings"
  ON public.n8n_workspace_settings FOR UPDATE
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own n8n settings"
  ON public.n8n_workspace_settings FOR DELETE
  USING (is_workspace_owner(workspace_id));

CREATE TRIGGER update_n8n_settings_updated_at
  BEFORE UPDATE ON public.n8n_workspace_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
