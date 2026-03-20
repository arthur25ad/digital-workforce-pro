import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
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
} from "lucide-react";

// Hook to summarize role data
function useRoleSummary() {
  const { drafts } = useWorkspaceData();
  const { tickets: supportTickets } = useCustomerSupportData();
  const { campaigns: emailCampaigns, drafts: emailDrafts } = useEmailMarketingData();
  const { tasks: vaTasks, requests: vaRequests } = useVirtualAssistantData();

  return {
    "social-media-manager": { count: drafts.length, unit: "drafts" },
    "email-marketer": { count: emailCampaigns.length + emailDrafts.length, unit: "items" },
    "customer-support": { count: supportTickets.length, unit: "tickets" },
    "calendar-assistant": { count: vaTasks.length + vaRequests.length, unit: "tasks" },
  };
}

function useMergedActivity() {
  const { activities: a1 } = useWorkspaceData();
  const { activities: a2 } = useCustomerSupportData();
  const { activities: a3 } = useEmailMarketingData();
  const { activities: a4 } = useVirtualAssistantData();
  return [...a1, ...a2, ...a3, ...a4]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
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
  const { syncSubscription } = useSubscriptionSync();
  const { isConnected: slackConnected } = useSlackIntegration();
  const { isConnected: shopifyConnected } = useShopify();
  const [showIntegrations, setShowIntegrations] = useState(false);

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

  const packageLabel = profile?.active_package
    ? profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)
    : "Free";

  const totalTasks = Object.values(summaries).reduce((acc, s) => acc + s.count, 0);
  const hasActivity = recentActivity.length > 0;
  const isFirstRun = totalTasks === 0 && !hasActivity && unlockedRoles.length === 0;

  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-[1200px]">

          {/* ── Welcome ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {workspace?.business_name ? `Welcome back, ${workspace.business_name}` : "Welcome to VANTORY"}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-foreground font-medium uppercase text-xs">{packageLabel} Plan</span>
              {unlockedRoles.length > 0 && (
                <>
                  <span className="h-3 w-px bg-border/50" />
                  <span className="text-xs">{unlockedRoles.length} role{unlockedRoles.length !== 1 ? "s" : ""} active</span>
                </>
              )}
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

          {/* ── First-Run Empty State ── */}
          {isFirstRun && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mb-8 rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 md:p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles size={22} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Let's get you set up</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Complete these steps to start using your scheduling assistant.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: UserCog, label: "Choose your AI roles", desc: "Pick the roles that match your business", href: "/choose-roles" },
                  { icon: Settings, label: "Complete your profile", desc: "Add your business name, industry & preferences", href: "/get-started" },
                  { icon: Plug, label: "Connect your tools", desc: "Link Slack, Shopify, or other platforms", action: () => setShowIntegrations(true) },
                  { icon: Calendar, label: "Open scheduling assistant", desc: "Start capturing bookings and follow-ups", href: "/ai-employees/calendar-assistant" },
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
            </motion.div>
          )}

          {/* ── AI Team (compact) ── */}
          {unlockedRoles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mb-6 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <span className="font-display text-xs font-semibold text-foreground">Your Roles</span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/20">
                {ROLES.map((role) => {
                  const unlocked = unlockedRoles.includes(role.slug);
                  const summary = summaries[role.slug];
                  const Icon = role.icon;
                  const colors = role.color;

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
          )}

          {/* ── Activity Feed ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-primary" />
                <span className="font-display text-xs font-semibold text-foreground">Recent Activity</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{recentActivity.length} recent</span>
            </div>
            <div className="divide-y divide-border/20 px-2">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => {
                const role = getActivityRole(activity.type);
                const roleConfig = getRoleBySlug(role);
                const colors = roleConfig?.color ?? { bg: "bg-muted/20", text: "text-muted-foreground" };
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
                  <p className="text-xs text-muted-foreground/50">No activity yet — complete setup above to get started</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Integrations (collapsed) ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-6">
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

        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
