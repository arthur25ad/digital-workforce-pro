
-- Assistant Profiles
CREATE TABLE public.assistant_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_overview text DEFAULT '',
  main_responsibilities text DEFAULT '',
  preferred_tone text DEFAULT '',
  priority_rules text DEFAULT '',
  recurring_tasks text DEFAULT '',
  communication_preferences text DEFAULT '',
  important_notes text DEFAULT '',
  approval_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant profiles" ON public.assistant_profiles FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own assistant profiles" ON public.assistant_profiles FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own assistant profiles" ON public.assistant_profiles FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own assistant profiles" ON public.assistant_profiles FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_assistant_profiles_updated_at BEFORE UPDATE ON public.assistant_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assistant Tasks
CREATE TABLE public.assistant_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text DEFAULT 'general',
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  status text NOT NULL DEFAULT 'new',
  assigned_type text DEFAULT 'ai',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant tasks" ON public.assistant_tasks FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own assistant tasks" ON public.assistant_tasks FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own assistant tasks" ON public.assistant_tasks FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own assistant tasks" ON public.assistant_tasks FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_assistant_tasks_updated_at BEFORE UPDATE ON public.assistant_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assistant Requests
CREATE TABLE public.assistant_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  source text DEFAULT 'manual',
  requester_name text DEFAULT '',
  request_summary text DEFAULT '',
  request_details text DEFAULT '',
  urgency text NOT NULL DEFAULT 'medium',
  recommended_action text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant requests" ON public.assistant_requests FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own assistant requests" ON public.assistant_requests FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own assistant requests" ON public.assistant_requests FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own assistant requests" ON public.assistant_requests FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_assistant_requests_updated_at BEFORE UPDATE ON public.assistant_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assistant Drafts
CREATE TABLE public.assistant_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.assistant_requests(id) ON DELETE SET NULL,
  draft_type text DEFAULT 'response',
  subject text DEFAULT '',
  draft_content text DEFAULT '',
  next_step text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant drafts" ON public.assistant_drafts FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own assistant drafts" ON public.assistant_drafts FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own assistant drafts" ON public.assistant_drafts FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own assistant drafts" ON public.assistant_drafts FOR DELETE USING (public.is_workspace_owner(workspace_id));

CREATE TRIGGER update_assistant_drafts_updated_at BEFORE UPDATE ON public.assistant_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create assistant profile for new workspaces
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  INSERT INTO public.email_brand_profiles (workspace_id) VALUES (new_workspace_id);
  INSERT INTO public.assistant_profiles (workspace_id) VALUES (new_workspace_id);
  
  RETURN NEW;
END;
$function$;
