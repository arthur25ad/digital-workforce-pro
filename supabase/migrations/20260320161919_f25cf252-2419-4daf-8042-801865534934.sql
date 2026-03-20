
-- Create demo_requests table for real Book Demo submissions
CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  business_name text DEFAULT '',
  business_type text DEFAULT '',
  help_with text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit a demo request"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admin can view (via staff portal edge function)
-- No SELECT policy for regular users — staff portal uses service role

-- Trigger for updated_at
CREATE TRIGGER update_demo_requests_updated_at
BEFORE UPDATE ON public.demo_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
