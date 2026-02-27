
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  active_package text NOT NULL DEFAULT 'starter',
  unlocked_roles text[] NOT NULL DEFAULT ARRAY['social-media-manager']::text[],
  subscription_status text NOT NULL DEFAULT 'active',
  purchase_date timestamptz DEFAULT now(),
  renewal_date timestamptz,
  active_workspace_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workspaces table
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT '',
  website text DEFAULT '',
  industry text DEFAULT '',
  audience text DEFAULT '',
  brand_tone text DEFAULT '',
  goals text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces" ON public.workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = user_id);

-- Helper function to check workspace ownership (after workspaces table exists)
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND user_id = auth.uid()
  )
$$;

-- Brand profiles table
CREATE TABLE public.brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  business_summary text DEFAULT '',
  offer_type text DEFAULT '',
  target_audience text DEFAULT '',
  brand_voice text DEFAULT '',
  content_goals text DEFAULT '',
  preferred_platforms text[] DEFAULT ARRAY[]::text[],
  posting_frequency text DEFAULT '',
  content_themes text[] DEFAULT ARRAY[]::text[],
  hashtags text[] DEFAULT ARRAY[]::text[],
  approval_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand profiles" ON public.brand_profiles FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own brand profiles" ON public.brand_profiles FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own brand profiles" ON public.brand_profiles FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own brand profiles" ON public.brand_profiles FOR DELETE USING (public.is_workspace_owner(workspace_id));

-- Social drafts table
CREATE TABLE public.social_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT '',
  idea_title text NOT NULL DEFAULT '',
  hook text DEFAULT '',
  caption text DEFAULT '',
  cta text DEFAULT '',
  format text DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  scheduled_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.social_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts" ON public.social_drafts FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own drafts" ON public.social_drafts FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own drafts" ON public.social_drafts FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own drafts" ON public.social_drafts FOR DELETE USING (public.is_workspace_owner(workspace_id));

-- Platform connections table
CREATE TABLE public.platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_name text DEFAULT '',
  connected boolean NOT NULL DEFAULT false,
  connected_at timestamptz,
  last_synced_at timestamptz,
  status text NOT NULL DEFAULT 'disconnected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, platform)
);
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections" ON public.platform_connections FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own connections" ON public.platform_connections FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own connections" ON public.platform_connections FOR UPDATE USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own connections" ON public.platform_connections FOR DELETE USING (public.is_workspace_owner(workspace_id));

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (public.is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own activity" ON public.activity_logs FOR INSERT WITH CHECK (public.is_workspace_owner(workspace_id));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_drafts_updated_at BEFORE UPDATE ON public.social_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON public.platform_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and workspace on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
