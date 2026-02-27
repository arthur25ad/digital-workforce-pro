
-- Promo codes table for staff portal
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  max_uses integer NULL,
  expires_at timestamp with time zone NULL,
  description text NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS - only accessible via service role (edge functions)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- No public RLS policies - only service role can access this table
-- This ensures normal users cannot read or manipulate promo codes

-- Trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Public support submissions table (separate from workspace-tied support_tickets)
CREATE TABLE public.public_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  user_email text NOT NULL DEFAULT '',
  user_name text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  admin_notes text NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.public_support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can submit their own tickets
CREATE POLICY "Authenticated users can submit support tickets"
  ON public.public_support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own support tickets"
  ON public.public_support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_public_support_tickets_updated_at
  BEFORE UPDATE ON public.public_support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
