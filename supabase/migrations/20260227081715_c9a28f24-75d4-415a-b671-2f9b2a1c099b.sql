
-- Secure backend trigger: auto-grant Team access for owner account
CREATE OR REPLACE FUNCTION public.handle_owner_entitlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email = 'arthur25.ad@gmail.com' THEN
    NEW.active_package := 'team';
    NEW.unlocked_roles := ARRAY['social-media-manager', 'customer-support', 'email-marketer', 'virtual-assistant'];
    NEW.subscription_status := 'active';
  END IF;
  RETURN NEW;
END;
$$;

-- Fire on INSERT and UPDATE so it always enforces
CREATE TRIGGER enforce_owner_entitlement
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_owner_entitlement();
