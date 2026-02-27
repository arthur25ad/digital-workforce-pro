import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import { useVantaBrainStats } from "@/hooks/useVantaBrain";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2, Headphones, Mail, CalendarCheck, Lock,
  ArrowRight, Sparkles, CheckCircle2, Brain,
  MessageSquare, Zap, Search,
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
  const navigate = useNavigate();
  const unlockedRoles = profile?.unlocked_roles ?? [];
  const summaries = useRoleSummary();
  const nextActions = useNextActions(unlockedRoles);
  const recentActivity = useMergedActivity();
  const { stats: brainStats } = useVantaBrainStats();
  const [askInput, setAskInput] = useState("");

  const packageLabel = profile?.active_package
    ? profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)
    : "Free";

  return (
    <PageLayout>
      <section className="px-4 pt-28 pb-20 md:px-8">
        <div className="mx-auto max-w-[1400px]">

          {/* ── Welcome header ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {workspace?.business_name
                ? `Welcome back, ${workspace.business_name}`
                : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              <span className="text-foreground font-medium uppercase">{packageLabel}</span> PLAN · {unlockedRoles.length} AI EMPLOYEE{unlockedRoles.length !== 1 ? "S" : ""} ACTIVE
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

          {/* ── Ask VANTABRAIN — Hero Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div
              className="relative overflow-hidden rounded-2xl border p-6 md:p-8"
              style={{
                borderColor: "hsl(280 70% 65% / 0.25)",
                background: "linear-gradient(135deg, hsl(280 70% 65% / 0.08) 0%, hsl(280 50% 40% / 0.04) 50%, transparent 100%)",
              }}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full" style={{
                background: "radial-gradient(circle, hsl(280 70% 65% / 0.12), transparent 70%)"
              }} />

              <div className="relative">
                {/* Header row */}
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
                        Your AI-powered workspace intelligence — knows your business, preferences, and activity
                      </p>
                    </div>
                  </div>
                  {(brainStats.totalMemories > 0 || brainStats.totalPatterns > 0) && (
                    <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground/60 shrink-0 mt-1">
                      <span>{brainStats.totalMemories} memories</span>
                      <span className="h-3 w-px bg-border/40" />
                      <span>{brainStats.totalPatterns} patterns</span>
                      <span className="h-3 w-px bg-border/40" />
                      <span>{brainStats.totalInteractions} interactions</span>
                    </div>
                  )}
                </div>

                {/* Search-style input */}
                <form
                  className="mb-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (askInput.trim()) {
                      // Navigate to VANTABRAIN with the question as a query param
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
                        placeholder="Ask anything about your workspace, preferences, or AI Employees…"
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

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "What has VANTABRAIN learned?",
                    "What should I do next?",
                    "Which AI Employees are active?",
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
