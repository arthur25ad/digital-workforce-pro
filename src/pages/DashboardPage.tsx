import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import { useVantaBrainStats } from "@/hooks/useVantaBrain";
import {
  Share2, Headphones, Mail, CalendarCheck, Lock,
  ArrowRight, Sparkles, CheckCircle2, Brain,
} from "lucide-react";

const roleConfig = [
  { icon: Share2, label: "Social Media Manager", slug: "social-media-manager", color: "text-blue-400" },
  { icon: Headphones, label: "Customer Support", slug: "customer-support", color: "text-violet-400" },
  { icon: Mail, label: "Email Marketer", slug: "email-marketer", color: "text-teal-400" },
  { icon: CalendarCheck, label: "Virtual Assistant", slug: "virtual-assistant", color: "text-amber-400" },
];

function useRoleSummary() {
  const { drafts } = useWorkspaceData();
  const { tickets: supportTickets } = useCustomerSupportData();
  const { campaigns: emailCampaigns, drafts: emailDrafts } = useEmailMarketingData();
  const { tasks: vaTasks, requests: vaRequests } = useVirtualAssistantData();

  return {
    "social-media-manager": drafts.filter(d => d.status === "draft" || d.status === "pending").length
      ? `${drafts.filter(d => d.status === "draft" || d.status === "pending").length} drafts waiting for review`
      : drafts.length > 0 ? `${drafts.length} total drafts` : null,
    "customer-support": supportTickets.filter(t => t.status === "new").length
      ? `${supportTickets.filter(t => t.status === "new").length} open tickets`
      : supportTickets.length > 0 ? `${supportTickets.length} tickets managed` : null,
    "email-marketer": emailDrafts.filter(d => d.status === "draft").length
      ? `${emailDrafts.filter(d => d.status === "draft").length} email drafts pending`
      : emailCampaigns.length > 0 ? `${emailCampaigns.length} campaigns` : null,
    "virtual-assistant": vaTasks.filter(t => ["new", "in_progress", "pending"].includes(t.status)).length
      ? `${vaTasks.filter(t => ["new", "in_progress", "pending"].includes(t.status)).length} active tasks`
      : vaRequests.length > 0 ? `${vaRequests.length} requests tracked` : null,
  };
}

function useNextActions(unlockedRoles: string[]) {
  const { drafts, connections } = useWorkspaceData();
  const { tickets: supportTickets } = useCustomerSupportData();
  const { campaigns } = useEmailMarketingData();
  const { tasks: vaTasks } = useVirtualAssistantData();

  const actions: { label: string; href: string }[] = [];

  if (unlockedRoles.includes("social-media-manager")) {
    if (connections.filter(c => c.connected).length === 0)
      actions.push({ label: "Connect your first social platform", href: "/ai-employees/social-media-manager" });
    else if (drafts.length === 0)
      actions.push({ label: "Create your first social post draft", href: "/ai-employees/social-media-manager" });
  }
  if (unlockedRoles.includes("customer-support")) {
    if (supportTickets.length === 0)
      actions.push({ label: "Set up your support knowledge base", href: "/ai-employees/customer-support" });
  }
  if (unlockedRoles.includes("email-marketer")) {
    if (campaigns.length === 0)
      actions.push({ label: "Create your first email campaign", href: "/ai-employees/email-marketer" });
  }
  if (unlockedRoles.includes("virtual-assistant")) {
    if (vaTasks.length === 0)
      actions.push({ label: "Add your first task or request", href: "/ai-employees/virtual-assistant" });
  }

  return actions.slice(0, 3);
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

const DashboardPage = () => {
  const { profile, workspace } = useAuth();
  const unlockedRoles = profile?.unlocked_roles ?? [];
  const summaries = useRoleSummary();
  const nextActions = useNextActions(unlockedRoles);
  const recentActivity = useMergedActivity();
  const { stats: brainStats } = useVantaBrainStats();

  const packageLabel = profile?.active_package
    ? profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)
    : "Free";

  return (
    <PageLayout>
      <section className="px-4 pt-28 pb-20 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* ── Welcome header ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {workspace?.business_name
                ? `Welcome back, ${workspace.business_name}`
                : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              <span className="text-foreground font-medium">{packageLabel}</span> plan · {unlockedRoles.length} AI Employee{unlockedRoles.length !== 1 ? "s" : ""} active
            </p>
          </motion.div>

          {/* ── AI Employee cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            {roleConfig.map((role, i) => {
              const unlocked = unlockedRoles.includes(role.slug);
              const Icon = role.icon;
              const summary = summaries[role.slug as keyof typeof summaries];

              return (
                <motion.div
                  key={role.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  {unlocked ? (
                    <Link
                      to={`/ai-employees/${role.slug}`}
                      className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/80"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 ${role.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-foreground">{role.label}</h3>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Active</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {summary || "Ready to use — no activity yet"}
                        </p>
                      </div>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4 rounded-2xl border border-border/30 bg-card/50 p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/30 text-muted-foreground">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-muted-foreground">{role.label}</h3>
                          <Lock size={12} className="text-muted-foreground" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground/70">Not included in your current plan</p>
                        <Link to="/pricing" className="mt-2 inline-block text-xs text-primary hover:underline">
                          Upgrade to unlock →
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── VantaBrain card ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Link
              to="/vantabrain"
              className="group flex items-center gap-4 rounded-2xl border p-5 transition-all duration-300 hover:border-[hsl(280_70%_65%)/0.4]"
              style={{ borderColor: "hsl(280 70% 65% / 0.2)", backgroundImage: "linear-gradient(to right, hsl(280 70% 65% / 0.05), transparent)" }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "hsl(280 70% 65% / 0.1)", color: "hsl(280 70% 65%)" }}>
                <Brain size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold" style={{ color: "hsl(280 70% 65%)" }}>VANTABRAIN</h3>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "hsl(280 70% 65% / 0.1)", color: "hsl(280 70% 65%)" }}>Intelligence</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {brainStats.totalMemories > 0
                    ? `${brainStats.totalMemories} memories · ${brainStats.totalPatterns} patterns · ${brainStats.totalInteractions} interactions tracked`
                    : "Your AI is learning — memories and patterns will appear as you use the platform"}
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </motion.div>

          {/* ── Next actions ── */}
          {nextActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-primary" />
                <h2 className="font-display text-sm font-semibold text-foreground">Suggested Next Steps</h2>
              </div>
              <div className="space-y-2">
                {nextActions.map((a) => (
                  <Link
                    key={a.label}
                    to={a.href}
                    className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-3 transition-all hover:border-primary/30"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Recent activity ── */}
          {recentActivity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-primary" />
                <h2 className="font-display text-sm font-semibold text-foreground">Recent Activity</h2>
              </div>
              <div className="space-y-1.5">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg px-4 py-2.5">
                    <div className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                    <p className="flex-1 text-sm text-muted-foreground truncate">{a.message}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground/50">
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
