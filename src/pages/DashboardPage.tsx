import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import { useSchedulingData } from "@/hooks/useSchedulingData";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import { useShopify } from "@/hooks/useShopify";
import SlackSettingsPanel from "@/components/workspace/SlackSettingsPanel";
import ShopifySettingsPanel from "@/components/workspace/ShopifySettingsPanel";
import { ROLES, getRoleBySlug } from "@/config/roles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { packageNeedsRoleSelection } from "@/lib/packages";
import {
  Share2, Headphones, Mail, CalendarCheck, Lock,
  ArrowRight, Sparkles, CheckCircle2,
  Zap, Clock4, Slack, ShoppingBag,
  ChevronDown, Settings, Plug, UserCog, Calendar,
  Bell, ClipboardList, Users, AlertCircle,
  CalendarDays, Inbox, MailCheck, RefreshCw,
} from "lucide-react";

/* ─── helpers ─── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function useMergedActivity() {
  const { activities: a1 } = useWorkspaceData();
  const { activities: a2 } = useCustomerSupportData();
  const { activities: a3 } = useEmailMarketingData();
  const { activities: a4 } = useVirtualAssistantData();
  return [...a1, ...a2, ...a3, ...a4]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
}

function getActivityIcon(type: string) {
  if (type.includes("social") || type.includes("draft")) return Share2;
  if (type.includes("email") || type.includes("campaign")) return Mail;
  if (type.includes("support") || type.includes("ticket")) return Headphones;
  if (type.includes("booking") || type.includes("appointment")) return CalendarDays;
  if (type.includes("reminder")) return Bell;
  return CalendarCheck;
}

function getActivityRole(type: string) {
  if (type.includes("social") || type.includes("draft")) return "social-media-manager";
  if (type.includes("email") || type.includes("campaign")) return "email-marketer";
  if (type.includes("support") || type.includes("ticket")) return "customer-support";
  return "calendar-assistant";
}

/* ─── section animation wrapper ─── */
const Section = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string | number }) => (
  <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-primary" />
      <span className="font-display text-xs font-semibold tracking-wide text-foreground">{title}</span>
    </div>
    {badge !== undefined && (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{badge}</span>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */

const DashboardPage = () => {
  const { profile, workspace, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const unlockedRoles = profile?.unlocked_roles ?? [];

  const scheduling = useSchedulingData();
  const recentActivity = useMergedActivity();
  const { syncSubscription } = useSubscriptionSync();
  const { isConnected: slackConnected } = useSlackIntegration();
  const { isConnected: shopifyConnected } = useShopify();
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  // Role summaries for the collapsed role section
  const { drafts } = useWorkspaceData();
  const { tickets: supportTickets } = useCustomerSupportData();
  const { campaigns: emailCampaigns, drafts: emailDrafts } = useEmailMarketingData();
  const { tasks: vaTasks, requests: vaRequests } = useVirtualAssistantData();
  const summaries: Record<string, { count: number; unit: string }> = {
    "social-media-manager": { count: drafts.length, unit: "drafts" },
    "email-marketer": { count: emailCampaigns.length + emailDrafts.length, unit: "items" },
    "customer-support": { count: supportTickets.length, unit: "tickets" },
    "calendar-assistant": { count: vaTasks.length + vaRequests.length, unit: "tasks" },
  };

  /* ── checkout sync ── */
  const [checkoutSyncing, setCheckoutSyncing] = useState(() => searchParams.get("checkout") === "success");

  useEffect(() => {
    const isCheckoutSuccess = searchParams.get("checkout") === "success";
    const doSync = async () => {
      const result = await syncSubscription(isCheckoutSuccess ? { retries: 5, delayMs: 2500 } : undefined);
      await refreshProfile();
      if (isCheckoutSuccess) {
        setSearchParams({}, { replace: true });
        setCheckoutSyncing(false);
        if (result.subscribed && result.packageKey) {
          if (packageNeedsRoleSelection(result.packageKey)) {
            toast({ title: "Payment successful!", description: "Now choose your AI roles." });
            navigate("/choose-roles", { replace: true });
          } else {
            toast({ title: "Payment successful!", description: "All roles unlocked!" });
          }
        } else {
          toast({ title: "Payment processing", description: "Your payment is being confirmed. Please refresh in a moment." });
        }
      }
    };
    if (profile) doSync();
  }, [profile?.id]);

  if (checkoutSyncing) {
    return (
      <PageLayout>
        <section className="flex min-h-[60vh] items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles size={32} className="animate-pulse text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Confirming your purchase…</h2>
            <p className="mt-2 text-muted-foreground">Verifying your payment. This takes just a moment.</p>
            <div className="mt-6 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </motion.div>
        </section>
      </PageLayout>
    );
  }

  const totalTasks = Object.values(summaries).reduce((acc, s) => acc + s.count, 0);
  const hasActivity = recentActivity.length > 0;
  const hasSchedulingData = scheduling.appointments.length > 0 || scheduling.bookingRequests.length > 0;
  const isFirstRun = totalTasks === 0 && !hasActivity && !hasSchedulingData && unlockedRoles.length === 0;

  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-[1200px] space-y-5">

          {/* ═══ 1. WELCOME + TODAY SUMMARY ═══ */}
          <Section delay={0}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  {workspace?.business_name ? `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${workspace.business_name}` : "Your Scheduling Dashboard"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scheduling.todaysAppointments.length > 0
                    ? `You have ${scheduling.todaysAppointments.length} appointment${scheduling.todaysAppointments.length !== 1 ? "s" : ""} today`
                    : "No appointments scheduled for today"}
                  {scheduling.pendingRequests.length > 0 && ` · ${scheduling.pendingRequests.length} pending request${scheduling.pendingRequests.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Link
                to="/ai-employees/calendar-assistant"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:brightness-110 active:scale-[0.97] shrink-0"
              >
                <Calendar size={16} />
                Open Scheduling Assistant
              </Link>
            </div>
          </Section>

          {/* ═══ 2. TODAY OVERVIEW CARDS ═══ */}
          <Section delay={0.05}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "New Requests", value: scheduling.pendingRequests.length, icon: Inbox, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Today's Appointments", value: scheduling.todaysAppointments.length, icon: CalendarDays, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Reminders Due", value: scheduling.remindersDue.length, icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Follow-Ups Pending", value: scheduling.followUpsDue.length, icon: RefreshCw, color: "text-violet-400", bg: "bg-violet-500/10" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm px-4 py-4 transition-colors hover:border-border/60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                      <card.icon size={14} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ FIRST-RUN SETUP GUIDE ═══ */}
          {isFirstRun && (
            <Section delay={0.08}>
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles size={22} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Let's get your scheduling set up</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Complete these steps so your assistant can start capturing bookings and sending reminders.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Settings, label: "Complete business profile", desc: "Add your name, industry & preferences", href: "/get-started" },
                    { icon: UserCog, label: "Choose your assistant roles", desc: "Pick the tools that match your needs", href: "/choose-roles" },
                    { icon: Plug, label: "Connect your tools", desc: "Link Slack, Shopify, or other platforms", action: () => setShowIntegrations(true) },
                    { icon: Calendar, label: "Review scheduling preferences", desc: "Set reminders, follow-up timing, and availability", href: "/ai-employees/calendar-assistant" },
                  ].map((item) => (
                    item.href ? (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/40"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto mt-1 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </Link>
                    ) : (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card/60 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/40 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <item.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto mt-1 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </button>
                    )
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* ═══ 3. NEEDS ATTENTION ═══ */}
          <Section delay={0.1}>
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
              <SectionHeader icon={AlertCircle} title="Needs Attention" badge={scheduling.needsAttention.length || undefined} />
              <div className="px-5 py-4">
                {scheduling.needsAttention.length > 0 ? (
                  <div className="space-y-2">
                    {scheduling.needsAttention.slice(0, 6).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/20 bg-secondary/20 px-4 py-3">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${
                          item.urgency === "high" ? "bg-red-400" : item.urgency === "medium" ? "bg-amber-400" : "bg-blue-400"
                        }`} />
                        <span className="flex-1 text-sm text-foreground">{item.label}</span>
                        <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground capitalize">{item.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 px-4 py-4">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Everything is handled for now</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No pending approvals, requests, or overdue items.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ═══ 4. UPCOMING APPOINTMENTS ═══ */}
          <Section delay={0.13}>
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
              <SectionHeader icon={CalendarDays} title="Upcoming Appointments" badge={scheduling.upcomingAppointments.length || undefined} />
              <div className="px-3 py-2">
                {scheduling.upcomingAppointments.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {scheduling.upcomingAppointments.slice(0, 6).map((appt) => (
                      <div key={appt.id} className="flex items-center gap-3 px-2 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Users size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{appt.client_name || "Unnamed client"}</p>
                          <p className="text-xs text-muted-foreground truncate">{appt.service_type || "General appointment"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-foreground">{formatDate(appt.scheduled_date)}</p>
                          <p className="text-[10px] text-muted-foreground">{formatTime(appt.scheduled_date)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {appt.reminder_sent ? (
                            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400">Reminded</span>
                          ) : (
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-400">No reminder</span>
                          )}
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] capitalize ${
                            appt.status === "scheduled" ? "bg-blue-500/10 text-blue-400"
                              : appt.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted/30 text-muted-foreground"
                          }`}>{appt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-8 text-center">
                    <CalendarDays size={24} className="mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/60">No upcoming appointments</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">Bookings will appear here once clients schedule with you.</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ═══ 5. BOOKING REQUESTS ═══ */}
          <Section delay={0.15}>
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
              <SectionHeader icon={ClipboardList} title="Incoming Booking Requests" badge={scheduling.pendingRequests.length || undefined} />
              <div className="px-3 py-2">
                {scheduling.bookingRequests.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {scheduling.bookingRequests.slice(0, 6).map((req) => (
                      <div key={req.id} className="flex items-center gap-3 px-2 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <Inbox size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{req.client_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.requested_service || "No service specified"} · {req.preferred_time_slot || "Flexible"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{formatDate(req.requested_date)}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize shrink-0 ${
                          req.status === "pending" ? "bg-amber-500/10 text-amber-400"
                            : req.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400"
                            : req.status === "declined" ? "bg-red-500/10 text-red-400"
                            : "bg-muted/30 text-muted-foreground"
                        }`}>{req.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-8 text-center">
                    <Inbox size={24} className="mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/60">No booking requests yet</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">When clients request bookings, they'll show up here for review.</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ═══ 6. REMINDERS & FOLLOW-UPS ═══ */}
          <Section delay={0.17}>
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
              <SectionHeader icon={Bell} title="Reminders & Follow-Ups" badge={
                (scheduling.remindersDue.length + scheduling.followUpsDue.length) || undefined
              } />
              <div className="px-5 py-4">
                {(scheduling.remindersDue.length > 0 || scheduling.followUpsDue.length > 0) ? (
                  <div className="space-y-2">
                    {scheduling.remindersDue.map((a) => (
                      <div key={`rem-${a.id}`} className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-4 py-3">
                        <Bell size={14} className="text-amber-400 shrink-0" />
                        <span className="flex-1 text-sm text-foreground">Reminder due for <strong>{a.client_name}</strong> — {formatTime(a.scheduled_date)} today</span>
                        <span className="text-[10px] text-amber-400 font-medium">Pending</span>
                      </div>
                    ))}
                    {scheduling.followUpsDue.map((a) => (
                      <div key={`fu-${a.id}`} className="flex items-center gap-3 rounded-lg border border-violet-500/10 bg-violet-500/[0.03] px-4 py-3">
                        <RefreshCw size={14} className="text-violet-400 shrink-0" />
                        <span className="flex-1 text-sm text-foreground">Follow-up due for <strong>{a.client_name}</strong></span>
                        <span className="text-[10px] text-violet-400 font-medium">Due</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/20 px-4 py-4">
                    <MailCheck size={18} className="text-muted-foreground/40 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground/60">No reminders or follow-ups due</p>
                      <p className="text-xs text-muted-foreground/40 mt-0.5">Your assistant will flag items here as appointments approach or are completed.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ═══ 7. ASSISTANT ACTIVITY ═══ */}
          <Section delay={0.19}>
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
              <SectionHeader icon={Zap} title="Assistant Activity" badge={recentActivity.length || undefined} />
              <div className="divide-y divide-border/20 px-2">
                {recentActivity.length > 0 ? recentActivity.map((activity, i) => {
                  const role = getActivityRole(activity.type);
                  const roleConfig = getRoleBySlug(role);
                  const colors = roleConfig?.color ?? { bg: "bg-muted/20", text: "text-muted-foreground" };
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-2.5 px-2 py-2.5"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                        <ActivityIcon size={13} />
                      </div>
                      <span className="flex-1 text-xs text-foreground/90 truncate">{activity.message}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground/40">{timeAgo(activity.created_at)}</span>
                    </motion.div>
                  );
                }) : (
                  <div className="px-3 py-8 text-center">
                    <Clock4 size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground/50">No activity yet — your assistant's actions will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ═══ 8. YOUR TOOLS (roles — collapsed) ═══ */}
          {unlockedRoles.length > 0 && (
            <Section delay={0.22}>
              <button
                onClick={() => setShowRoles(!showRoles)}
                className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-card/40 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
              >
                <div className="flex items-center gap-2">
                  <UserCog size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">Your Assistant Roles</span>
                  <span className="text-[10px] text-muted-foreground">{unlockedRoles.length} active</span>
                </div>
                <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${showRoles ? "rotate-180" : ""}`} />
              </button>
              {showRoles && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ROLES.map((role) => {
                    const unlocked = unlockedRoles.includes(role.slug);
                    const summary = summaries[role.slug];
                    const Icon = role.icon;
                    const colors = role.color;

                    return unlocked ? (
                      <Link
                        key={role.slug}
                        to={`/ai-employees/${role.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-border/30 bg-card/40 px-4 py-3 transition-colors hover:border-primary/20 hover:bg-secondary/30"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-muted-foreground/70 truncate">{role.label}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display text-lg font-bold text-foreground">{summary.count}</span>
                            <span className="text-[10px] text-muted-foreground">{summary.unit}</span>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div key={role.slug} className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/20 px-4 py-3 opacity-40">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground">
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground/50">{role.label}</p>
                          <div className="flex items-center gap-1">
                            <Lock size={10} className="text-muted-foreground/50" />
                            <span className="text-[10px] text-muted-foreground/50">Locked</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* ═══ 9. INTEGRATIONS (collapsed) ═══ */}
          <Section delay={0.24}>
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-card/40 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2">
                <Plug size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Integrations</span>
                <div className="flex items-center gap-1.5">
                  {slackConnected && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400">
                      <Slack size={8} /> Slack
                    </span>
                  )}
                  {shopifyConnected && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400">
                      <ShoppingBag size={8} /> Shopify
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-200 ${showIntegrations ? "rotate-180" : ""}`} />
            </button>
            {showIntegrations && (
              <div className="mt-2 space-y-3 rounded-xl border border-border/30 bg-card/40 p-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Slack size={14} className={slackConnected ? "text-[#E01E5A]" : "text-muted-foreground"} />
                    <span className="text-xs font-semibold text-foreground">Slack</span>
                  </div>
                  <SlackSettingsPanel />
                </div>
                <div className="border-t border-border/20 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={14} className={shopifyConnected ? "text-[#96bf48]" : "text-muted-foreground"} />
                    <span className="text-xs font-semibold text-foreground">Shopify</span>
                  </div>
                  <ShopifySettingsPanel />
                </div>
              </div>
            )}
          </Section>

        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
