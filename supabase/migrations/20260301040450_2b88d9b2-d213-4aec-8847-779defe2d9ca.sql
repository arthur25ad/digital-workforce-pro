
-- Create slack_workspace_settings table
CREATE TABLE public.slack_workspace_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform_connection_id UUID REFERENCES public.platform_connections(id) ON DELETE SET NULL,
  slack_team_id TEXT,
  slack_team_name TEXT,
  slack_bot_user_id TEXT,
  slack_workspace_name TEXT,
  default_channel_id TEXT,
  default_channel_name TEXT DEFAULT '#general',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_summary_enabled BOOLEAN NOT NULL DEFAULT false,
  weekly_summary_enabled BOOLEAN NOT NULL DEFAULT false,
  support_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  content_approvals_enabled BOOLEAN NOT NULL DEFAULT true,
  marketing_updates_enabled BOOLEAN NOT NULL DEFAULT false,
  scheduling_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  billing_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  access_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  installed_by_user_id UUID,
  last_test_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on workspace_id (one Slack config per workspace)
ALTER TABLE public.slack_workspace_settings ADD CONSTRAINT slack_workspace_settings_workspace_id_key UNIQUE (workspace_id);

-- Enable RLS
ALTER TABLE public.slack_workspace_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own slack settings"
  ON public.slack_workspace_settings FOR SELECT
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own slack settings"
  ON public.slack_workspace_settings FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own slack settings"
  ON public.slack_workspace_settings FOR UPDATE
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own slack settings"
  ON public.slack_workspace_settings FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- Update trigger
CREATE TRIGGER update_slack_workspace_settings_updated_at
  BEFORE UPDATE ON public.slack_workspace_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
