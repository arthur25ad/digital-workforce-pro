
-- Email Brand Profiles
CREATE TABLE public.email_brand_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_overview text DEFAULT '',
  audience_description text DEFAULT '',
  brand_voice text DEFAULT '',
  offer_summary text DEFAULT '',
  campaign_goals text DEFAULT '',
  preferred_email_style text DEFAULT '',
  frequency_preference text DEFAULT '',
  keywords text DEFAULT '',
  approval_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own email brand profiles" ON public.email_brand_profiles FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own email brand profiles" ON public.email_brand_profiles FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own email brand profiles" ON public.email_brand_profiles FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own email brand profiles" ON public.email_brand_profiles FOR DELETE USING (is_workspace_owner(workspace_id));
CREATE TRIGGER update_email_brand_profiles_updated_at BEFORE UPDATE ON public.email_brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Campaigns
CREATE TABLE public.email_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  campaign_type text NOT NULL DEFAULT 'newsletter',
  target_audience text DEFAULT '',
  objective text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own email campaigns" ON public.email_campaigns FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own email campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own email campaigns" ON public.email_campaigns FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own email campaigns" ON public.email_campaigns FOR DELETE USING (is_workspace_owner(workspace_id));
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Drafts
CREATE TABLE public.email_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  subject_line text DEFAULT '',
  preview_text text DEFAULT '',
  body_copy text DEFAULT '',
  call_to_action text DEFAULT '',
  email_type text DEFAULT 'promotional',
  status text NOT NULL DEFAULT 'draft',
  scheduled_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own email drafts" ON public.email_drafts FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own email drafts" ON public.email_drafts FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own email drafts" ON public.email_drafts FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own email drafts" ON public.email_drafts FOR DELETE USING (is_workspace_owner(workspace_id));
CREATE TRIGGER update_email_drafts_updated_at BEFORE UPDATE ON public.email_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email Audience Lists
CREATE TABLE public.email_audience_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  list_name text NOT NULL DEFAULT '',
  audience_type text DEFAULT 'general',
  estimated_size integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.email_audience_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audience lists" ON public.email_audience_lists FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own audience lists" ON public.email_audience_lists FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own audience lists" ON public.email_audience_lists FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own audience lists" ON public.email_audience_lists FOR DELETE USING (is_workspace_owner(workspace_id));
CREATE TRIGGER update_email_audience_lists_updated_at BEFORE UPDATE ON public.email_audience_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create email brand profile on new user signup
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
  INSERT INTO public.email_brand_profiles (workspace_id) VALUES (new_workspace_id);
  
  RETURN NEW;
END;
$$;
