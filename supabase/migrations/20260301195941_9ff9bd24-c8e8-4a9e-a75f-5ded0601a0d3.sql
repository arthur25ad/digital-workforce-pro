
-- Table to store Notion connection info per workspace
CREATE TABLE public.notion_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  access_token_encrypted TEXT NOT NULL,
  notion_workspace_name TEXT,
  notion_workspace_id TEXT,
  bot_id TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Table to store synced Notion pages/content
CREATE TABLE public.notion_synced_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  notion_page_id TEXT NOT NULL,
  title TEXT,
  content_plain TEXT,
  page_url TEXT,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, notion_page_id)
);

-- Enable RLS
ALTER TABLE public.notion_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_synced_pages ENABLE ROW LEVEL SECURITY;

-- RLS policies for notion_connections
CREATE POLICY "Users can view own workspace notion connections"
  ON public.notion_connections FOR SELECT
  USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can insert own workspace notion connections"
  ON public.notion_connections FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own workspace notion connections"
  ON public.notion_connections FOR UPDATE
  USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own workspace notion connections"
  ON public.notion_connections FOR DELETE
  USING (public.is_workspace_owner(workspace_id));

-- RLS policies for notion_synced_pages
CREATE POLICY "Users can view own workspace notion pages"
  ON public.notion_synced_pages FOR SELECT
  USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can insert own workspace notion pages"
  ON public.notion_synced_pages FOR INSERT
  WITH CHECK (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own workspace notion pages"
  ON public.notion_synced_pages FOR UPDATE
  USING (public.is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own workspace notion pages"
  ON public.notion_synced_pages FOR DELETE
  USING (public.is_workspace_owner(workspace_id));

-- Triggers for updated_at
CREATE TRIGGER update_notion_connections_updated_at
  BEFORE UPDATE ON public.notion_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notion_synced_pages_updated_at
  BEFORE UPDATE ON public.notion_synced_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
