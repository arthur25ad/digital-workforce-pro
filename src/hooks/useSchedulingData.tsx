import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Appointment {
  id: string;
  workspace_id: string;
  client_name: string;
  service_type: string | null;
  scheduled_date: string | null;
  duration_minutes: number | null;
  status: string;
  reminder_sent: boolean;
  recurring: boolean;
  recurrence_pattern: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  workspace_id: string;
  client_name: string;
  requested_service: string | null;
  requested_date: string | null;
  preferred_time_slot: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useSchedulingData = () => {
  const { workspace } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const workspaceId = workspace?.id;

  const fetchAppointments = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("scheduled_date", { ascending: true });
    if (data) setAppointments(data);
  }, [workspaceId]);

  const fetchBookingRequests = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setBookingRequests(data);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([fetchAppointments(), fetchBookingRequests()]).finally(() => setLoading(false));
  }, [workspaceId, fetchAppointments, fetchBookingRequests]);

  // Derived data
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => {
      if (!a.scheduled_date) return false;
      const d = new Date(a.scheduled_date);
      return d >= todayStart && d < todayEnd;
    }),
    [appointments, todayStart.getTime()]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => {
      if (!a.scheduled_date) return false;
      return new Date(a.scheduled_date) >= now && a.status !== "cancelled";
    }).slice(0, 10),
    [appointments]
  );

  const pendingRequests = useMemo(
    () => bookingRequests.filter((r) => r.status === "pending"),
    [bookingRequests]
  );

  const remindersDue = useMemo(
    () => todaysAppointments.filter((a) => !a.reminder_sent && a.status === "scheduled"),
    [todaysAppointments]
  );

  const followUpsDue = useMemo(
    () => appointments.filter((a) => {
      if (!a.scheduled_date) return false;
      return new Date(a.scheduled_date) < now && a.status === "completed" && !a.reminder_sent;
    }),
    [appointments]
  );

  const needsAttention = useMemo(() => {
    const items: { id: string; label: string; type: "request" | "reminder" | "followup" | "reschedule"; urgency: string }[] = [];
    pendingRequests.forEach((r) => items.push({ id: r.id, label: `Booking request from ${r.client_name || "Unknown"}`, type: "request", urgency: "medium" }));
    remindersDue.forEach((a) => items.push({ id: a.id, label: `Reminder due for ${a.client_name}`, type: "reminder", urgency: "high" }));
    followUpsDue.forEach((a) => items.push({ id: a.id, label: `Follow-up due for ${a.client_name}`, type: "followup", urgency: "low" }));
    return items;
  }, [pendingRequests, remindersDue, followUpsDue]);

  return {
    appointments,
    bookingRequests,
    todaysAppointments,
    upcomingAppointments,
    pendingRequests,
    remindersDue,
    followUpsDue,
    needsAttention,
    loading,
    refetch: () => Promise.all([fetchAppointments(), fetchBookingRequests()]),
  };
};
