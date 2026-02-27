
-- Fix defaults so new users start with no package, no roles, inactive status
ALTER TABLE public.profiles ALTER COLUMN active_package SET DEFAULT 'free';
ALTER TABLE public.profiles ALTER COLUMN unlocked_roles SET DEFAULT ARRAY[]::text[];
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'inactive';
ALTER TABLE public.profiles ALTER COLUMN purchase_date SET DEFAULT NULL;
