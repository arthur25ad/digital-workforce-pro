
-- Add promo billing control columns
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS remove_trial boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS billing_delay_days integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_duration_months integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurring_discount boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS new_customers_only boolean DEFAULT false;
