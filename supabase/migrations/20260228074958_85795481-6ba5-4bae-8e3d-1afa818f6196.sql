-- Drop the restrictive RLS policy that blocks direct promo code lookups
DROP POLICY IF EXISTS "Public can read visible active promos" ON public.promo_codes;

-- Create two separate policies:
-- 1. Public display: show active, non-private codes marked visible on homepage/pricing
CREATE POLICY "Public can read visible active promos"
ON public.promo_codes FOR SELECT
USING (
  is_active = true 
  AND is_private IS NOT TRUE 
  AND (is_visible_on_homepage = true OR is_visible_on_pricing = true)
);

-- 2. Direct code lookup: any active code can be validated when entered manually
-- This allows redemption of codes that aren't displayed publicly
CREATE POLICY "Anyone can validate active promo by code"
ON public.promo_codes FOR SELECT
USING (is_active = true);