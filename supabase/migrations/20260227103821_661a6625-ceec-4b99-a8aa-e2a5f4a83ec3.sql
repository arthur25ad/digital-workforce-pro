
-- Brain settings table for persistent learning controls per workspace
CREATE TABLE public.brain_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  learn_from_approvals boolean NOT NULL DEFAULT true,
  learn_from_edits boolean NOT NULL DEFAULT true,
  learn_timing_suggestions boolean NOT NULL DEFAULT true,
  require_approval boolean NOT NULL DEFAULT true,
  learning_paused boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE public.brain_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own brain settings"
ON public.brain_settings FOR SELECT
USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own brain settings"
ON public.brain_settings FOR INSERT
WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own brain settings"
ON public.brain_settings FOR UPDATE
USING (is_workspace_owner(workspace_id));

-- Auto-create brain_settings for new users (update the handle_new_user function)
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
  INSERT INTO public.brain_settings (workspace_id) VALUES (new_workspace_id);
  
  RETURN NEW;
END;
$function$;

-- Timestamp trigger
CREATE TRIGGER update_brain_settings_updated_at
BEFORE UPDATE ON public.brain_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
