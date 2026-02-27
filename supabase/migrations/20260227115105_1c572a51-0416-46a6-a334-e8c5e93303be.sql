
-- Create appointments table for the AI Calendar Assistant
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  service_type text DEFAULT '',
  scheduled_date timestamp with time zone,
  duration_minutes integer DEFAULT 60,
  status text NOT NULL DEFAULT 'scheduled',
  notes text DEFAULT '',
  reminder_sent boolean NOT NULL DEFAULT false,
  recurring boolean NOT NULL DEFAULT false,
  recurrence_pattern text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  requested_date timestamp with time zone,
  requested_service text DEFAULT '',
  preferred_time_slot text DEFAULT '',
  source text DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create scheduling_insights table for calendar intelligence
CREATE TABLE public.scheduling_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  insight_type text NOT NULL DEFAULT 'pattern',
  description text NOT NULL DEFAULT '',
  client_name text DEFAULT '',
  confidence numeric NOT NULL DEFAULT 0.5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduling_insights ENABLE ROW LEVEL SECURITY;

-- Appointments RLS policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own appointments" ON public.appointments FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own appointments" ON public.appointments FOR DELETE USING (is_workspace_owner(workspace_id));

-- Booking requests RLS policies
CREATE POLICY "Users can view own booking requests" ON public.booking_requests FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own booking requests" ON public.booking_requests FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own booking requests" ON public.booking_requests FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own booking requests" ON public.booking_requests FOR DELETE USING (is_workspace_owner(workspace_id));

-- Scheduling insights RLS policies
CREATE POLICY "Users can view own scheduling insights" ON public.scheduling_insights FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own scheduling insights" ON public.scheduling_insights FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own scheduling insights" ON public.scheduling_insights FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own scheduling insights" ON public.scheduling_insights FOR DELETE USING (is_workspace_owner(workspace_id));

-- Triggers for updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduling_insights_updated_at BEFORE UPDATE ON public.scheduling_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
