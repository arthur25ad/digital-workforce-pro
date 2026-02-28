
-- Drop the old overly permissive policy
DROP POLICY IF EXISTS "Anyone can read active public promo codes" ON public.promo_codes;

-- New policy: only expose promos that are active, not private, and visible somewhere
CREATE POLICY "Public can read visible active promos"
ON public.promo_codes
FOR SELECT
USING (
  is_active = true
  AND (is_private IS NOT TRUE)
  AND (is_visible_on_homepage = true OR is_visible_on_pricing = true)
);
