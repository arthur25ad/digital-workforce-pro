import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVantaBrainMemories, useVantaBrainStats, useVantaBrainActions } from "@/hooks/useVantaBrain";
import { useBrainSettings } from "@/hooks/useBrainSettings";
import {
  Brain, Sparkles, Trash2, Eye, EyeOff, TrendingUp,
  Lightbulb, Clock, Shield, Database,
  Activity, Network, BarChart3, Layers, ArrowRight,
  Globe, Lock, Cpu, Mail, MessageSquare,
  Users, Plug, Settings, History, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import VantaBrainAssistant from "@/components/VantaBrainAssistant";

const PURPLE = "hsl(280 70% 65%)";

const categoryIcons: Record<string, any> = {
  preference: Lightbulb,
  style: Sparkles,
  timing: Clock,
  tone: Sparkles,
  workflow: TrendingUp,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════
   PUBLIC / MARKETING VIEW — Premium & Condensed
   ═══════════════════════════════════════════════ */
const PublicView = () => (
  <>
    {/* ── Hero ── */}
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-28 md:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 15%, hsl(280 70% 65% / 0.2), transparent)"
      }} />
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 35% 25% at 50% 5%, hsl(280 80% 75% / 0.12), transparent)"
      }} />

      <div className="mx-auto max-w-[1600px] relative text-center">
        {/* Brain Icon — large, on top */}
        <motion.div {...fadeUp} className="flex justify-center mb-8">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-border/50 bg-card" style={{
              boxShadow: `0 0 80px hsl(280 70% 65% / 0.3), 0 0 160px hsl(280 70% 65% / 0.12), inset 0 1px 0 hsl(0 0% 100% / 0.05)`
            }}>
              <Brain size={56} style={{ color: PURPLE }} />
            </div>
          </div>
        </motion.div>

        {/* Title — massive, below the brain */}
        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.06 }}
          className="font-display text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] leading-[0.85]"
          style={{
            backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 55%), hsl(0 0% 100% / 0.85), hsl(280 60% 50%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VANTABRAIN
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-lg md:text-xl lg:text-2xl leading-relaxed"
          style={{ color: "hsl(280 70% 75% / 0.7)" }}
        >
          The intelligence layer that makes your entire AI team smarter.{" "}
          <span className="text-foreground/60">It learns how your business works — and remembers everything.</span>
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.18 }} className="mt-10 flex justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: "white",
              color: "hsl(280 70% 50%)",
              boxShadow: "0 0 30px hsl(280 70% 65% / 0.2)",
            }}
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <a href="#how-vantabrain-works" className="btn-outline-glow inline-flex items-center gap-2 text-sm uppercase tracking-wide">
            How It Works
          </a>
        </motion.div>
      </div>
    </section>

    {/* ── How VantaBrain Works ── */}
    <section id="how-vantabrain-works" className="px-6 pb-20 md:px-12 lg:px-16 scroll-mt-24">
      <div className="mx-auto max-w-[1000px]">
        <motion.div {...fadeUp}>
          <h2 className="font-display text-center text-3xl font-bold text-foreground md:text-4xl mb-4">
            How <span style={{ color: PURPLE }}>VANTABRAIN</span> Works
          </h2>
          <p className="text-center text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-12">
            VANTABRAIN is the shared intelligence layer behind every AI Employee. Here's how it makes your entire team smarter over time.
          </p>
        </motion.div>

        <div className="space-y-6">
          {[
            {
              step: "1",
              title: "You Use Your AI Employees",
              desc: "Every time you approve a draft, edit a suggestion, or reject an output — VANTABRAIN is quietly watching. It tracks your preferences across Social Media, Email, Support, and your Virtual Assistant.",
              icon: Eye,
            },
            {
              step: "2",
              title: "It Learns Your Patterns",
              desc: "Over time, VANTABRAIN turns repeated behaviors into persistent memory. Your preferred tone, timing, formatting style, and priorities become part of its understanding of your business.",
              icon: Brain,
            },
            {
              step: "3",
              title: "Your AI Team Gets Smarter",
              desc: "Before generating any draft, reply, or suggestion, each AI Employee checks VANTABRAIN first. This means outputs feel more like you — without you having to repeat yourself.",
              icon: Sparkles,
            },
            {
              step: "4",
              title: "Knowledge Flows Across Roles",
              desc: "What your Email Marketer learns about your brand voice also helps your Social Media Manager. Shared context means every role benefits from every interaction.",
              icon: Network,
            },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              {...fadeUp}
              transition={{ delay: 0.06 * i }}
              className="flex gap-5 items-start rounded-2xl border border-border/40 bg-card p-5 md:p-6"
            >
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-border/40 bg-background" style={{
                boxShadow: `0 0 20px hsl(280 70% 65% / 0.1)`
              }}>
                <s.icon size={22} style={{ color: PURPLE }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(280 70% 65% / 0.5)" }}>Step {s.step}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-foreground md:text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── What it does (capabilities) ── */}
    <section className="px-6 pb-24 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        {/* 3-Step Process — compact horizontal */}
        <motion.div {...fadeUp} transition={{ delay: 0.08 }} className="mb-16">
          <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
            <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
              Three Steps. <span style={{ color: PURPLE }}>Infinite Intelligence.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Observe", desc: "Every approval, edit, and action is quietly tracked across all your AI Employees.", icon: Eye },
                { step: "02", title: "Learn", desc: "Repeated patterns become persistent memory — your voice, timing, style, and more.", icon: Brain },
                { step: "03", title: "Improve", desc: "Your AI team pulls from VANTABRAIN before every action, delivering outputs that feel like you.", icon: Sparkles },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <span className="font-display text-5xl font-black tracking-tighter" style={{ color: "hsl(280 70% 65% / 0.15)" }}>{s.step}</span>
                  <div className="flex justify-center mt-2 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background">
                      <s.icon size={18} style={{ color: PURPLE }} />
                    </div>
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Core capabilities — compact 2x3 grid */}
        <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Database, title: "Persistent Memory", desc: "Remembers your brand voice and preferences across every session." },
              { icon: Activity, title: "Pattern Recognition", desc: "Detects trends in how you approve, edit, and reject — then adapts." },
              { icon: Network, title: "Cross-Role Intelligence", desc: "What one AI Employee learns, all of them benefit from." },
              { icon: Shield, title: "Human-Controlled", desc: "Suggests — you decide. Every high-impact action still needs your approval." },
              { icon: Cpu, title: "Gets Smarter Over Time", desc: "The more you use Vantory, the better your entire AI team becomes." },
              { icon: Lock, title: "Private & Secure", desc: "Completely isolated per workspace. No data leaks across accounts — ever." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: 0.04 * i }}
                className="rounded-xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border/60"
              >
                <f.icon size={18} style={{ color: PURPLE }} className="mb-3" />
                <h3 className="font-display text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Bottom CTA ── */}
    <section className="px-6 pb-24 md:px-12 lg:px-16">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div {...fadeUp}>
          <Brain size={28} className="mx-auto mb-3" style={{ color: PURPLE }} />
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
            Ready to build your AI's memory?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Start using VANTORY and VANTABRAIN starts learning from day one.
          </p>
          <div className="mt-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: "white",
                color: "hsl(280 70% 50%)",
                boxShadow: "0 0 25px hsl(280 70% 65% / 0.15)",
              }}
            >
              Start Free <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </>
);

/* ═══════════════════════════════════════════════
   AUTHENTICATED — Full Intelligence Center
   ═══════════════════════════════════════════════ */

const ROLES = [
  { key: "social_media", label: "Social Media Manager", icon: Globe, color: "hsl(217 91% 60%)" },
  { key: "customer_support", label: "Customer Support", icon: MessageSquare, color: "hsl(150 60% 50%)" },
  { key: "email_marketing", label: "Email Marketer", icon: Mail, color: "hsl(35 90% 55%)" },
  { key: "virtual_assistant", label: "Virtual Assistant", icon: Users, color: "hsl(280 70% 65%)" },
];

const CONNECTED_TOOLS = [
  { name: "Google Account", status: "Ready to connect", icon: Globe, context: "Calendar, contacts, business profile" },
  { name: "Gmail", status: "Ready to connect", icon: Mail, context: "Email patterns, response style" },
  { name: "Social Accounts", status: "Ready to connect", icon: Globe, context: "Posting patterns, engagement data" },
  { name: "Support Inbox", status: "Ready to connect", icon: MessageSquare, context: "Ticket history, resolution patterns" },
];

const RECENT_ACTIVITY_PLACEHOLDER = [
  { text: "Learned preferred posting time pattern", role: "social_media", time: "Activity appears as you use the platform" },
  { text: "Updated support reply tone preference", role: "customer_support", time: "" },
  { text: "Strengthened newsletter timing preference", role: "email_marketing", time: "" },
  { text: "Added task prioritization pattern", role: "virtual_assistant", time: "" },
];

const AuthenticatedView = ({ initialQuestion }: { initialQuestion?: string }) => {
  const { stats, loading: statsLoading } = useVantaBrainStats();
  const { memories, patterns, loading, refresh } = useVantaBrainMemories();
  const { deleteMemory, deletePattern } = useVantaBrainActions();
  const { settings, update: updateSettings, clearRoleMemory, clearAllMemory, refresh: refreshSettings } = useBrainSettings();
  const [showPatterns, setShowPatterns] = useState(true);
  const [activeRoleTab, setActiveRoleTab] = useState<string | null>(null);

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
    toast.success("Memory removed");
    refresh();
  };

  const handleDismissPattern = async (id: string) => {
    await deletePattern(id);
    toast.success("Pattern dismissed");
    refresh();
  };

  // Filter memories/patterns by role
  const roleMemories = activeRoleTab
    ? memories.filter(m => m.scope === activeRoleTab)
    : memories;
  const rolePatterns = activeRoleTab
    ? patterns.filter(p => p.role_scope === activeRoleTab)
    : patterns;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-2 md:pt-28 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 45% at 50% 10%, hsl(280 70% 65% / 0.14), transparent)"
        }} />

        <div className="mx-auto max-w-[1600px] relative text-center">
          <motion.h1
            {...fadeUp}
            className="font-display text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 60%), hsl(0 0% 100% / 0.9), hsl(280 60% 55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VANTABRAIN
            <span className="block text-2xl md:text-4xl lg:text-5xl mt-1 tracking-wide" style={{
              backgroundImage: "linear-gradient(135deg, hsl(280 70% 75% / 0.7), hsl(0 0% 100% / 0.5))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              INTELLIGENCE CENTER
            </span>
          </motion.h1>

          <motion.p {...fadeUp} transition={{ delay: 0.06 }} className="mx-auto mt-3 max-w-lg text-muted-foreground text-sm md:text-base">
            Your workspace intelligence center — see what your AI team has learned and manage how it gets smarter.
          </motion.p>
        </div>
      </section>

      {/* ── Ask VANTABRAIN — Flagship Section ── */}
      <section className="px-6 pt-6 pb-4 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <VantaBrainAssistant initialQuestion={initialQuestion} variant="flagship" />
          </motion.div>
        </div>
      </section>

      {/* ── Dashboard ── */}
      <section className="px-6 pb-20 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1400px]">

          {/* Stats Row */}
          <motion.div {...fadeUp} transition={{ delay: 0.14 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 mt-4">
            {[
              { label: "Memories", value: stats.totalMemories, icon: Database, desc: "Learned preferences" },
              { label: "Patterns", value: stats.totalPatterns, icon: Activity, desc: "Behavioral insights" },
              { label: "Interactions", value: stats.totalInteractions, icon: BarChart3, desc: "Actions tracked" },
              { label: "AI Roles", value: 4, icon: Network, desc: "Connected employees" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-4 transition-all duration-300 hover:border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card border border-border/40">
                    <s.icon size={14} style={{ color: PURPLE }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{statsLoading ? "–" : s.value}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Bottom row: Connected Context + Learning Controls + Recent Activity ── */}
          <div className="grid md:grid-cols-3 gap-4">

            {/* Connected Context */}
            <motion.div {...fadeUp} transition={{ delay: 0.22 }}>
              <div className="rounded-2xl border border-border/40 bg-card p-5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Plug size={14} style={{ color: PURPLE }} />
                  <h2 className="font-display text-sm font-semibold text-foreground">Connected Context</h2>
                </div>
                <div className="space-y-2.5">
                  {CONNECTED_TOOLS.map((t) => (
                    <div key={t.name} className="flex items-start gap-3 rounded-xl border border-border/30 bg-background/50 p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-card">
                        <t.icon size={12} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.context}</p>
                        <span className="inline-block mt-1 text-[10px] text-muted-foreground/50 rounded-full border border-border/20 px-1.5 py-0.5">
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Learning Controls */}
            <motion.div {...fadeUp} transition={{ delay: 0.26 }}>
              <div className="rounded-2xl border border-border/40 bg-card p-5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={14} style={{ color: PURPLE }} />
                  <h2 className="font-display text-sm font-semibold text-foreground">Learning Controls</h2>
                </div>

                {/* Pause Learning — prominent toggle */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/30 bg-background/50 p-3 mb-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">Pause All Learning</p>
                    <p className="text-[10px] text-muted-foreground">Temporarily stop VANTABRAIN from learning new preferences</p>
                  </div>
                  <Switch
                    checked={settings.learning_paused}
                    onCheckedChange={(v) => updateSettings({ learning_paused: v })}
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { key: "learn_from_approvals" as const, label: "Learn from approvals", desc: "Track what you approve to learn preferences" },
                    { key: "learn_from_edits" as const, label: "Learn from edits", desc: "Use your edits to refine future outputs" },
                    { key: "learn_timing_suggestions" as const, label: "Timing suggestions", desc: "Suggest posting and send times" },
                    { key: "require_approval" as const, label: "Require approval", desc: "Always ask before applying learned preferences" },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{c.label}</p>
                        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                      </div>
                      <Switch
                        checked={settings[c.key]}
                        onCheckedChange={(v) => updateSettings({ [c.key]: v })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-border/30 space-y-2">
                  {activeRoleTab ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        await clearRoleMemory(activeRoleTab);
                        refresh();
                      }}
                    >
                      <AlertCircle size={12} className="mr-1.5" />
                      Clear {ROLES.find(r => r.key === activeRoleTab)?.label} Memory
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        await clearAllMemory();
                        refresh();
                      }}
                    >
                      <AlertCircle size={12} className="mr-1.5" />
                      Reset All Learned Preferences
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
              <div className="rounded-2xl border border-border/40 bg-card p-5 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <History size={14} style={{ color: PURPLE }} />
                  <h2 className="font-display text-sm font-semibold text-foreground">Recent Brain Activity</h2>
                </div>
                <div className="space-y-3">
                  {(stats.totalInteractions > 0 ? RECENT_ACTIVITY_PLACEHOLDER : []).length > 0 ? (
                    RECENT_ACTIVITY_PLACEHOLDER.map((a, i) => {
                      const role = ROLES.find(r => r.key === a.role);
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/30 bg-card mt-0.5">
                            {role ? <role.icon size={10} style={{ color: role.color }} /> : <Brain size={10} style={{ color: PURPLE }} />}
                          </div>
                          <div>
                            <p className="text-xs text-foreground">{a.text}</p>
                            {a.time && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{a.time}</p>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/30 p-6 text-center">
                      <History size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">No activity yet</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">Brain activity will appear as you use your AI Employees.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </section>
    </>
  );
};

/* ═══════════════════════════════════════════════
   PAGE WRAPPER
   ═══════════════════════════════════════════════ */
const VantaBrainPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const askParam = searchParams.get("ask") || undefined;

  return (
    <PageLayout>
      {user ? <AuthenticatedView initialQuestion={askParam} /> : <PublicView />}
    </PageLayout>
  );
};

export default VantaBrainPage;
