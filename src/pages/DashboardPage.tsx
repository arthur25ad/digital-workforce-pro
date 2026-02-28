import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import { useVantaBrainStats } from "@/hooks/useVantaBrain";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { packageNeedsRoleSelection } from "@/lib/packages";
import {
  Share2, Headphones, Mail, CalendarCheck, Lock,
  ArrowRight, Sparkles, CheckCircle2, Brain,
  MessageSquare, Zap, Search, TrendingUp, BarChart3, Clock4,
} from "lucide-react";

const roleColors = {
  "social-media-manager": { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
  "email-marketer": { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
  "customer-support": { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
  "calendar-assistant": { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
};

const roleConfig = [
  { icon: Share2, label: "Social Media", fullLabel: "Social Media Manager", slug: "social-media-manager" as const },
  { icon: Mail, label: "Email Marketing", fullLabel: "Email Marketer", slug: "email-marketer" as const },
  { icon: Headphones, label: "Customer Support", fullLabel: "Customer Support", slug: "customer-support" as const },
  { icon: CalendarCheck, label: "Calendar Assistant", fullLabel: "AI Calendar Assistant", slug: "calendar-assistant" as const },
];

function useRoleSummary() {
  const { drafts } = useWorkspaceData();
  const { tickets: supportTickets } = useCustomerSupportData();
  const { campaigns: emailCampaigns, drafts: emailDrafts } = useEmailMarketingData();
  const { tasks: vaTasks, requests: vaRequests } = useVirtualAssistantData();

  return {
    "social-media-manager": { count: drafts.length, unit: "drafts", trend: drafts.length > 0 ? "+24%" : null },
    "email-marketer": { count: emailCampaigns.length + emailDrafts.length, unit: "items", trend: emailCampaigns.length > 0 ? "+15%" : null },
    "customer-support": { count: supportTickets.length, unit: "tickets", trend: supportTickets.length > 0 ? "+32%" : null },
    "calendar-assistant": { count: vaTasks.length + vaRequests.length, unit: "tasks", trend: vaTasks.length > 0 ? "+18%" : null },
  };
}

function useMergedActivity() {
  const { activities: a1 } = useWorkspaceData();
  const { activities: a2 } = useCustomerSupportData();
  const { activities: a3 } = useEmailMarketingData();
  const { activities: a4 } = useVirtualAssistantData();

  return [...a1, ...a2, ...a3, ...a4]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);
}

function getActivityRole(type: string) {
  if (type.includes("social") || type.includes("draft")) return "social-media-manager";
  if (type.includes("email") || type.includes("campaign")) return "email-marketer";
  if (type.includes("support") || type.includes("ticket")) return "customer-support";
  return "calendar-assistant";
}

function getActivityIcon(type: string) {
  if (type.includes("social") || type.includes("draft")) return Share2;
  if (type.includes("email") || type.includes("campaign")) return Mail;
  if (type.includes("support") || type.includes("ticket")) return Headphones;
  return CalendarCheck;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const DashboardPage = () => {
  const { profile, workspace, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const unlockedRoles = profile?.unlocked_roles ?? [];
  const summaries = useRoleSummary();
  const recentActivity = useMergedActivity();
  const { stats: brainStats } = useVantaBrainStats();
  const { syncSubscription } = useSubscriptionSync();
  const [askInput, setAskInput] = useState("");
  const [checkoutSyncing, setCheckoutSyncing] = useState(() => searchParams.get("checkout") === "success");

  // Sync subscription after checkout or on first load
  useEffect(() => {
    const isCheckoutSuccess = searchParams.get("checkout") === "success";
    
    const doSync = async () => {
      // For post-checkout, use retries since Stripe may take a moment
      const result = await syncSubscription(
        isCheckoutSuccess ? { retries: 5, delayMs: 2500 } : undefined
      );
      await refreshProfile();
      
      if (isCheckoutSuccess) {
        // Clear the query params
        setSearchParams({}, { replace: true });
        setCheckoutSyncing(false);

        if (result.subscribed && result.packageKey) {
          if (packageNeedsRoleSelection(result.packageKey)) {
            toast({ title: "Payment successful!", description: "Now choose your AI Employees." });
            navigate("/choose-roles", { replace: true });
          } else {
            toast({ title: "Payment successful!", description: "All AI Employees unlocked!" });
          }
        } else {
          // Subscription not found after retries — tell user to wait
          toast({
            title: "Payment processing",
            description: "Your payment is being confirmed. Please refresh in a moment.",
          });
        }
      }
    };
    
    if (profile) {
      doSync();
    }
  }, [profile?.id]);

  // Show a syncing overlay while verifying checkout
  if (checkoutSyncing) {
    return (
      <PageLayout>
        <section className="flex min-h-[60vh] items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles size={32} className="animate-pulse text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Confirming your purchase…
            </h2>
            <p className="mt-2 text-muted-foreground">
              Verifying your payment with Stripe. This takes just a moment.
            </p>
            <div className="mt-6 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </motion.div>
        </section>
      </PageLayout>
    );
  }

  const packageLabel = profile?.active_package
    ? profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)
    : "Free";

  const totalTasks = Object.values(summaries).reduce((acc, s) => acc + s.count, 0);


  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-[1400px]">

          {/* ── Welcome header ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-4xl">
              {workspace?.business_name
                ? `Welcome back, ${workspace.business_name}`
                : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              <span className="text-foreground font-medium uppercase">{packageLabel}</span> PLAN · {unlockedRoles.length} AI EMPLOYEE{unlockedRoles.length !== 1 ? "S" : ""} ACTIVE
            </p>
          </motion.div>

          {/* ── Role stat cards (like the landing page preview) ── */}
          <div className="mb-6 md:mb-8 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 md:gap-5">
            {roleConfig.map((role, i) => {
              const unlocked = unlockedRoles.includes(role.slug);
              const colors = roleColors[role.slug];
              const summary = summaries[role.slug];
              const Icon = role.icon;

              return (
                <motion.div
                  key={role.slug}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  {unlocked ? (
                    <Link
                      to={`/ai-employees/${role.slug}`}
                      className={`group relative block overflow-hidden rounded-xl md:rounded-2xl border ${colors.border} p-4 md:p-5 transition-all duration-500 hover:scale-[1.02]`}
                      style={{ background: `linear-gradient(160deg, ${colors.glow}, transparent 60%)` }}
                    >
                      <div
                        className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                        style={{ background: colors.accent }}
                      />
                      <div className="relative">
                        <div className={`mb-3 md:mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform duration-300 group-hover:scale-110`}>
                          <Icon size={18} />
                        </div>
                        <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{role.label}</p>
                        <div className="mt-2 flex items-end gap-2">
                          <span className="font-display text-2xl md:text-3xl font-bold text-foreground">{summary.count}</span>
                          <span className="mb-1 text-xs text-muted-foreground">{summary.unit}</span>
                        </div>
                        {summary.trend && (
                          <div className="mt-2 flex items-center gap-1">
                            <TrendingUp size={12} className={colors.text} />
                            <span className={`text-[11px] font-semibold ${colors.text}`}>{summary.trend}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/30 p-5 opacity-60">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground mb-4">
                        <Icon size={22} />
                      </div>
                      <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">{role.label}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Lock size={14} className="text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground/50">Locked</span>
                      </div>
                      <Link to="/pricing" className="mt-3 inline-block text-xs text-primary hover:underline">
                        Upgrade →
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── Main content: Activity Feed + Sidebar ── */}
          <div className="grid gap-4 md:gap-5 lg:grid-cols-[1fr_340px] mb-8 md:mb-12">
            {/* Activity feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Zap size={16} className="text-primary" />
                  </div>
                  <span className="font-display text-sm font-semibold text-foreground">Live Activity Feed</span>
                </div>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  {unlockedRoles.length} AI employee{unlockedRoles.length !== 1 ? "s" : ""} active
                </span>
              </div>

              <div className="divide-y divide-border/20 px-3 py-2">
                {recentActivity.length > 0 ? recentActivity.map((activity, i) => {
                  const role = getActivityRole(activity.type);
                  const colors = roleColors[role];
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                      className="group/row flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-secondary/40 md:gap-4"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition-transform duration-200 group-hover/row:scale-110`}>
                        <ActivityIcon size={15} />
                      </div>
                      <span className="flex-1 text-sm text-foreground/90 truncate">{activity.message}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground/40">{timeAgo(activity.created_at)}</span>
                    </motion.div>
                  );
                }) : (
                  <div className="px-3 py-12 text-center">
                    <Clock4 size={24} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/50">No activity yet — start using your AI employees</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">
              {/* Weekly performance */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  <span className="font-display text-sm font-semibold text-foreground">Weekly Performance</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Tasks Completed", value: Math.min(totalTasks * 10, 100), color: "bg-primary" },
                    { label: "Approval Rate", value: totalTasks > 0 ? 94 : 0, color: "bg-emerald-500" },
                    { label: "Response Time", value: totalTasks > 0 ? 87 : 0, color: "bg-violet-500" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                        <span className="text-xs font-semibold text-foreground">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${metric.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Time saved */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="relative overflow-hidden rounded-2xl border border-primary/20 p-5"
                style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.08), hsl(262 60% 58% / 0.06))" }}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: "hsl(217 91% 60%)" }} />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Time Saved This Week</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">{Math.max(totalTasks * 2, 0)}</span>
                  <span className="mb-1.5 text-lg font-semibold text-muted-foreground">hours</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Equivalent to 2 full-time employees
                </p>
              </motion.div>

              {/* Tasks summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-background/40 px-4 py-3"
              >
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalTasks} tasks</span> managed this week
                </span>
              </motion.div>
            </div>
          </div>

          {/* ── Ask VANTABRAIN ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div
              className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
              style={{
                borderColor: "hsl(280 70% 65% / 0.25)",
                background: "linear-gradient(135deg, hsl(280 70% 65% / 0.08) 0%, hsl(280 50% 40% / 0.04) 50%, transparent 100%)",
              }}
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full" style={{
                background: "radial-gradient(circle, hsl(280 70% 65% / 0.12), transparent 70%)"
              }} />

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-card" style={{
                      boxShadow: "0 0 30px hsl(280 70% 65% / 0.15)"
                    }}>
                      <Brain size={24} style={{ color: "hsl(280 70% 65%)" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-foreground">Ask VANTABRAIN</h2>
                        <Zap size={14} style={{ color: "hsl(280 70% 65%)" }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your AI-powered workspace intelligence
                      </p>
                    </div>
                  </div>
                  {(brainStats.totalMemories > 0 || brainStats.totalPatterns > 0) && (
                    <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground/60 shrink-0 mt-1">
                      <span>{brainStats.totalMemories} memories</span>
                      <span className="h-3 w-px bg-border/40" />
                      <span>{brainStats.totalPatterns} patterns</span>
                    </div>
                  )}
                </div>

                <form
                  className="mb-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (askInput.trim()) {
                      navigate(`/vantabrain?ask=${encodeURIComponent(askInput.trim())}`);
                    } else {
                      navigate("/vantabrain");
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                      <input
                        type="text"
                        value={askInput}
                        onChange={(e) => setAskInput(e.target.value)}
                        placeholder="Ask anything about your workspace…"
                        className="w-full rounded-xl border border-border/50 bg-background/80 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(280_70%_65%/0.4)] transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: "linear-gradient(135deg, hsl(280 70% 60%), hsl(280 60% 50%))",
                        color: "white",
                        boxShadow: "0 0 20px hsl(280 70% 65% / 0.2)",
                      }}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-2">
                  {[
                    "What has VANTABRAIN learned?",
                    "What should I do next?",
                    "What patterns were detected?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => navigate(`/vantabrain?ask=${encodeURIComponent(prompt)}`)}
                      className="rounded-lg border border-border/40 bg-background/60 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                  <Link
                    to="/vantabrain"
                    className="rounded-lg border border-border/40 bg-background/60 px-3 py-1.5 text-[11px] transition-all inline-flex items-center gap-1"
                    style={{ color: "hsl(280 70% 65%)" }}
                  >
                    Open Intelligence Center <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>


        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
