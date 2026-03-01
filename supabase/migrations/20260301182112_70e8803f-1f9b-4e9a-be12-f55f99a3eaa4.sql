
-- Create shopify_store_settings table for Shopify-specific data
CREATE TABLE public.shopify_store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform_connection_id uuid REFERENCES public.platform_connections(id) ON DELETE SET NULL,
  shop_domain text NOT NULL DEFAULT '',
  shop_name text DEFAULT '',
  currency text DEFAULT 'USD',
  scopes text DEFAULT '',
  access_token_encrypted text DEFAULT '',
  use_for_support_ai boolean NOT NULL DEFAULT true,
  use_for_email_marketing boolean NOT NULL DEFAULT true,
  use_for_social_content boolean NOT NULL DEFAULT true,
  enable_product_context boolean NOT NULL DEFAULT true,
  enable_collection_context boolean NOT NULL DEFAULT true,
  synced_products jsonb DEFAULT '[]'::jsonb,
  synced_collections jsonb DEFAULT '[]'::jsonb,
  store_metadata jsonb DEFAULT '{}'::jsonb,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE public.shopify_store_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own shopify settings"
  ON public.shopify_store_settings FOR SELECT
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own shopify settings"
  ON public.shopify_store_settings FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own shopify settings"
  ON public.shopify_store_settings FOR UPDATE
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own shopify settings"
  ON public.shopify_store_settings FOR DELETE
  USING (is_workspace_owner(workspace_id));

-- Trigger for updated_at
CREATE TRIGGER update_shopify_store_settings_updated_at
  BEFORE UPDATE ON public.shopify_store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Also create a temporary oauth state table for secure state verification
CREATE TABLE public.shopify_oauth_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state text NOT NULL UNIQUE,
  workspace_id uuid NOT NULL,
  shop_domain text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- RLS - only service role should access this, but enable RLS for safety
ALTER TABLE public.shopify_oauth_states ENABLE ROW LEVEL SECURITY;

-- No public policies - only accessed via service role in edge functions
