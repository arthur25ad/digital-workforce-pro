
-- Add new columns to promo_codes for the enhanced promo system
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS label text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_visible_on_homepage boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible_on_pricing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS starter_discount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS growth_discount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_discount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_billing_cycle_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS start_date timestamp with time zone DEFAULT null,
  ADD COLUMN IF NOT EXISTS end_date timestamp with time zone DEFAULT null;

-- Create a public read policy so the frontend can fetch active public promos
CREATE POLICY "Anyone can read active public promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true);
