
CREATE OR REPLACE FUNCTION public.handle_owner_entitlement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 'arthur25.ad@gmail.com' THEN
    NEW.active_package := 'team';
    NEW.unlocked_roles := ARRAY['social-media-manager', 'customer-support', 'email-marketer', 'calendar-assistant'];
    NEW.subscription_status := 'active';
  END IF;
  RETURN NEW;
END;
$function$;
