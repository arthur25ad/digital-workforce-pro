
-- Support Knowledge Base
CREATE TABLE public.support_knowledge_bases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_overview text DEFAULT '',
  products_services text DEFAULT '',
  support_principles text DEFAULT '',
  brand_tone text DEFAULT '',
  refund_policy text DEFAULT '',
  shipping_policy text DEFAULT '',
  custom_policies text DEFAULT '',
  example_responses text DEFAULT '',
  sop_notes text DEFAULT '',
  support_hours text DEFAULT '',
  escalation_rules text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_knowledge_bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support kb" ON public.support_knowledge_bases FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own support kb" ON public.support_knowledge_bases FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own support kb" ON public.support_knowledge_bases FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own support kb" ON public.support_knowledge_bases FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_support_kb_updated_at BEFORE UPDATE ON public.support_knowledge_bases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support Knowledge Items (uploaded docs, policies, etc.)
CREATE TABLE public.support_knowledge_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  item_type text NOT NULL DEFAULT 'document',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_knowledge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kb items" ON public.support_knowledge_items FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own kb items" ON public.support_knowledge_items FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own kb items" ON public.support_knowledge_items FOR DELETE USING (public.is_workspace_owner(workspace_id));

-- Support Tickets
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email',
  customer_name text NOT NULL DEFAULT '',
  customer_message text NOT NULL DEFAULT '',
  issue_type text DEFAULT '',
  urgency text NOT NULL DEFAULT 'medium',
  sentiment text DEFAULT 'neutral',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own tickets" ON public.support_tickets FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support Drafts
CREATE TABLE public.support_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  issue_summary text DEFAULT '',
  suggested_reply text DEFAULT '',
  confidence_level text DEFAULT 'medium',
  escalation_flag boolean NOT NULL DEFAULT false,
  referenced_policy text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support drafts" ON public.support_drafts FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own support drafts" ON public.support_drafts FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own support drafts" ON public.support_drafts FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own support drafts" ON public.support_drafts FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_support_drafts_updated_at BEFORE UPDATE ON public.support_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create support knowledge base when workspace is created (update handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_workspace_id uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.workspaces (id, user_id, business_name)
  VALUES (gen_random_uuid(), NEW.id, '')
  RETURNING id INTO new_workspace_id;
  
  UPDATE public.profiles SET active_workspace_id = new_workspace_id WHERE id = NEW.id;
  
  INSERT INTO public.brand_profiles (workspace_id) VALUES (new_workspace_id);
  INSERT INTO public.support_knowledge_bases (workspace_id) VALUES (new_workspace_id);
  
  RETURN NEW;
END;
$$;
