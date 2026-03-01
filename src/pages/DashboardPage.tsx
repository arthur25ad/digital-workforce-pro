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
import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import { useShopify } from "@/hooks/useShopify";
import SlackSettingsPanel from "@/components/workspace/SlackSettingsPanel";
import ShopifySettingsPanel from "@/components/workspace/ShopifySettingsPanel";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { packageNeedsRoleSelection } from "@/lib/packages";
import {
  Share2, Headphones, Mail, CalendarCheck, Lock,
  ArrowRight, Sparkles, CheckCircle2, Brain,
  MessageSquare, Zap, Search, TrendingUp, BarChart3, Clock4, Slack, ShoppingBag,
  ChevronDown,
} from "lucide-react";

// Define role colors
const roleColors = {
  "social-media-manager": { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
  "email-marketer": { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
  "customer-support": { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
  "calendar-assistant": { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
};

// Define role configuration
const roleConfig = [
  { icon: Share2, label: "Social Media", fullLabel: "Social Media Manager", slug: "social-media-manager" as const },
  { icon: Mail, label: "Email Marketing", fullLabel: "Email Marketer", slug: "email-marketer" as const },
  { icon: Headphones, label: "Customer Support", fullLabel: "Customer Support", slug: "customer-support" as const },
  { icon: CalendarCheck, label: "Calendar Assistant", fullLabel: "AI Calendar Assistant", slug: "calendar-assistant" as const },
];

// Hook to summarize role data
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

// Hook to merge and sort activity data
function useMergedActivity() {
  const { activities: a1 } = useWorkspaceData();
  const { activities: a2 } = useCustomerSupportData();
  const { activities: a3 } = useEmailMarketingData();
  const { activities: a4 } = useVirtualAssistantData();
  return [...a1, ...a2, ...a3, ...a4]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
}

// Function to determine activity role
function getActivityRole(type: string) {
  if (type.includes("social") || type.includes("draft")) return "social-media-manager";
  if (type.includes("email") || type.includes("campaign")) return "email-marketer";
  if (type.includes("support") || type.includes("ticket")) return "customer-support";
  return "calendar-assistant";
}

// Function to determine activity icon
function getActivityIcon(type: string) {
  if (type.includes("social") || type.includes("draft")) return Share2;
  if (type.includes("email") || type.includes("campaign")) return Mail;
  if (type.includes("support") || type.includes("ticket")) return Headphones;
  return CalendarCheck;
}

// Function to format time ago
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
  const { isConnected: slackConnected } = useSlackIntegration();
  const { isConnected: shopifyConnected } = useShopify();
  const [askInput, setAskInput] = useState("");
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

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
            toast({ title: "Payment successful!", description: "Now choose your AI Employees." });
            navigate("/choose-roles", { replace: true });
          } else {
            toast({ title: "Payment successful!", description: "All AI Employees unlocked!" });
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

  const packageLabel = profile?.active_package
    ? profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)
    : "Free";

  const totalTasks = Object.values(summaries).reduce((acc, s) => acc + s.count, 0);

  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-[1200px]">

          {/* ── Layer 1: Clean welcome ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {workspace?.business_name ? `Welcome back, ${workspace.business_name}` : "Welcome back"}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-foreground font-medium uppercase text-xs">{packageLabel} Plan</span>
              <span className="h-3 w-px bg-border/50" />
              <span className="text-xs">{unlockedRoles.length} AI Employee{unlockedRoles.length !== 1 ? "s" : ""} active</span>
              {totalTasks > 0 && (
                <>
                  <span className="h-3 w-px bg-border/50" />
                  <span className="text-xs flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    {totalTasks} tasks this week
                  </span>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Layer 2: AI Team — compact grouped module ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-6 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
              <span className="font-display text-xs font-semibold text-foreground">Your AI Team</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
              {roleConfig.map((role) => {
                const unlocked = unlockedRoles.includes(role.slug);
                const colors = roleColors[role.slug];
                const summary = summaries[role.slug];
                const Icon = role.icon;

                return unlocked ? (
                  <Link
                    key={role.slug}
                    to={`/ai-employees/${role.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
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
                  <div key={role.slug} className="flex items-center gap-3 px-4 py-3 opacity-40">
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
          </motion.div>

          {/* ── Layer 2: Activity Feed — primary ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-primary" />
                <span className="font-display text-xs font-semibold text-foreground">Live Activity</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{recentActivity.length} recent</span>
            </div>

            <div className="divide-y divide-border/20 px-2">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => {
                const role = getActivityRole(activity.type);
                const colors = roleColors[role];
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
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
                  <p className="text-xs text-muted-foreground/50">No activity yet — start using your AI employees</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Layer 3: Secondary — collapsible sections ── */}

          {/* Performance — collapsed by default */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-4">
            <button
              onClick={() => setShowPerformance(!showPerformance)}
              className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-card/40 px-4 py-3 text-left transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={13} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Weekly Performance</span>
                {totalTasks > 0 && (
                  <span className="text-[10px] text-muted-foreground">· {Math.max(totalTasks * 2, 0)}h saved</span>
                )}
              </div>
              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${showPerformance ? "rotate-180" : ""}`} />
            </button>
            {showPerformance && (
              <div className="mt-2 rounded-xl border border-border/30 bg-card/40 p-4 space-y-3">
                {[
                  { label: "Tasks Completed", value: Math.min(totalTasks * 10, 100), color: "bg-primary" },
                  { label: "Approval Rate", value: totalTasks > 0 ? 94 : 0, color: "bg-emerald-500" },
                  { label: "Response Time", value: totalTasks > 0 ? 87 : 0, color: "bg-violet-500" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between">
                      <span className="text-[11px] text-muted-foreground">{m.label}</span>
                      <span className="text-[11px] font-semibold text-foreground">{m.value}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                        transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${m.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Integrations — collapsed by default */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-card/40 px-4 py-3 text-left transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2">
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
              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${showIntegrations ? "rotate-180" : ""}`} />
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
          </motion.div>

          {/* ── Ask VANTABRAIN — compact ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-xl border p-4"
            style={{ borderColor: "hsl(280 70% 65% / 0.2)", background: "linear-gradient(135deg, hsl(280 70% 65% / 0.05), transparent)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} style={{ color: "hsl(280 70% 65%)" }} />
              <span className="font-display text-xs font-semibold text-foreground">Ask VANTABRAIN</span>
              <Link to="/vantabrain" className="ml-auto text-[10px] inline-flex items-center gap-1" style={{ color: "hsl(280 70% 65%)" }}>
                Intelligence Center <ArrowRight size={9} />
              </Link>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); navigate(askInput.trim() ? `/vantabrain?ask=${encodeURIComponent(askInput.trim())}` : "/vantabrain"); }}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  <input type="text" value={askInput} onChange={(e) => setAskInput(e.target.value)}
                    placeholder="Ask anything about your workspace…"
                    className="w-full rounded-lg border border-border/40 bg-background/80 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[hsl(280_70%_65%/0.4)]" />
                </div>
                <button type="submit" className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                  style={{ background: "linear-gradient(135deg, hsl(280 70% 60%), hsl(280 60% 50%))", color: "white" }}>
                  <MessageSquare size={14} />
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
