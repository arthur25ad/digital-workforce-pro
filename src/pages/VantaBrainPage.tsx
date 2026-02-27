import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVantaBrainMemories, useVantaBrainStats, useVantaBrainActions } from "@/hooks/useVantaBrain";
import {
  Brain, Sparkles, Trash2, Eye, EyeOff, TrendingUp,
  Lightbulb, Clock, Shield, Zap, Database,
  Activity, Network, BarChart3, Layers, ArrowRight,
  CheckCircle2, Globe, Lock, Cpu, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

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
   PUBLIC / MARKETING VIEW
   ═══════════════════════════════════════════════ */
const PublicView = () => (
  <>
    {/* ── Massive Hero ── */}
    <section className="relative overflow-hidden px-4 pt-32 pb-24 md:pt-40 md:pb-32 md:px-8">
      {/* Multi-layer ambient glow */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 45% at 50% 10%, hsl(280 70% 65% / 0.18), transparent)"
      }} />
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 40% 30% at 50% 5%, hsl(280 80% 75% / 0.1), transparent)"
      }} />

      <div className="mx-auto max-w-5xl relative text-center">
        {/* Brain Icon */}
        <motion.div {...fadeUp} className="flex justify-center mb-10">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-border/50 bg-card md:h-32 md:w-32" style={{
              boxShadow: "0 0 80px hsl(280 70% 65% / 0.25), 0 0 160px hsl(280 70% 65% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.05)"
            }}>
              <Brain size={52} style={{ color: "hsl(280 70% 65%)" }} className="md:hidden" />
              <Brain size={60} style={{ color: "hsl(280 70% 65%)" }} className="hidden md:block" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card" style={{
              boxShadow: "0 0 20px hsl(280 70% 65% / 0.3)"
            }}>
              <Zap size={14} style={{ color: "hsl(280 70% 65%)" }} />
            </div>
          </div>
        </motion.div>

        {/* Title — massive */}
        <motion.h1
          {...fadeUp}
          transition={{ delay: 0.08 }}
          className="font-display text-6xl font-black tracking-tight md:text-8xl lg:text-9xl"
          style={{
            backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 60%), hsl(0 0% 100% / 0.9), hsl(280 60% 55%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VANTABRAIN
        </motion.h1>

        {/* Subtitle — large */}
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.14 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl lg:text-2xl leading-relaxed"
        >
          The intelligence layer that makes your entire AI team smarter.
          VANTABRAIN learns how your business works — and remembers everything.
        </motion.p>

        {/* CTA */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-10 flex justify-center gap-4">
          <Link to="/auth" className="btn-glow inline-flex items-center gap-2 text-sm uppercase tracking-wide">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/how-it-works" className="btn-outline-glow inline-flex items-center gap-2 text-sm uppercase tracking-wide">
            How It Works
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── What VantaBrain Does ── */}
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Your AI Team's <span style={{ color: "hsl(280 70% 65%)" }}>Shared Brain</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-base md:text-lg">
            Every approval, edit, and decision trains VANTABRAIN. It becomes the memory that powers smarter outputs across all your AI Employees.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Database,
              title: "Persistent Memory",
              desc: "VANTABRAIN remembers your brand voice, preferences, and patterns across every session. It never forgets.",
            },
            {
              icon: Activity,
              title: "Pattern Recognition",
              desc: "Detects trends in how you approve, edit, and reject — then adapts to match your style automatically.",
            },
            {
              icon: Network,
              title: "Cross-Role Intelligence",
              desc: "What one AI Employee learns, they all benefit from. Your Social Manager's insights sharpen your Email Marketer.",
            },
            {
              icon: Shield,
              title: "Human-Controlled",
              desc: "VANTABRAIN suggests — you decide. Every high-impact action still requires your approval. Always.",
            },
            {
              icon: Cpu,
              title: "Gets Smarter Over Time",
              desc: "The more you use VANTORY, the better it gets. VANTABRAIN compounds your team's intelligence with every interaction.",
            },
            {
              icon: Lock,
              title: "Private & Secure",
              desc: "Your brain is yours alone. Completely isolated per workspace. No data leaks across accounts — ever.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ delay: 0.05 * i }}
              className="group rounded-2xl border border-border/40 bg-card p-6 transition-all duration-300 hover:border-border/60"
              style={{ boxShadow: "0 0 0 0 transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 40px hsl(280 70% 65% / 0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 0 transparent";
              }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-background mb-4">
                <f.icon size={20} style={{ color: "hsl(280 70% 65%)" }} />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How It Works ── */}
    <section className="px-4 pb-24 md:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div {...fadeUp} className="rounded-2xl border border-border/40 bg-card p-8 md:p-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Three Steps. Infinite Intelligence.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Observe", desc: "Every time you approve a draft, edit a reply, or schedule a post — VANTABRAIN is watching and learning.", icon: Eye },
              { step: "02", title: "Learn", desc: "Patterns and preferences are extracted into persistent memory — your brand voice, timing, style, and more.", icon: Brain },
              { step: "03", title: "Improve", desc: "Your AI Employees pull from VANTABRAIN before every action, delivering outputs that feel like you wrote them.", icon: Sparkles },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <span className="font-display text-5xl font-black tracking-tighter" style={{ color: "hsl(280 70% 65% / 0.2)" }}>{s.step}</span>
                <div className="flex justify-center mt-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-background">
                    <s.icon size={18} style={{ color: "hsl(280 70% 65%)" }} />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Bottom CTA ── */}
    <section className="px-4 pb-28 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div {...fadeUp}>
          <Brain size={32} className="mx-auto mb-4" style={{ color: "hsl(280 70% 65%)" }} />
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Ready to build your AI's memory?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Start using VANTORY and VANTABRAIN starts learning from day one. The longer you use it, the smarter it gets.
          </p>
          <div className="mt-8">
            <Link to="/auth" className="btn-glow inline-flex items-center gap-2 text-sm uppercase tracking-wide">
              Start Free <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </>
);

/* ═══════════════════════════════════════════════
   AUTHENTICATED / DASHBOARD VIEW
   ═══════════════════════════════════════════════ */
const AuthenticatedView = () => {
  const { stats, loading: statsLoading } = useVantaBrainStats();
  const { memories, patterns, loading, refresh } = useVantaBrainMemories();
  const { deleteMemory, deletePattern } = useVantaBrainActions();
  const [showPatterns, setShowPatterns] = useState(true);

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

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pt-32 pb-4 md:pt-36 md:px-8">
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 45% at 50% 10%, hsl(280 70% 65% / 0.14), transparent)"
        }} />

        <div className="mx-auto max-w-5xl relative text-center">
          <motion.div {...fadeUp} className="flex justify-center mb-8">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-border/50 bg-card" style={{
                boxShadow: "0 0 60px hsl(280 70% 65% / 0.2), 0 0 120px hsl(280 70% 65% / 0.08)"
              }}>
                <Brain size={44} style={{ color: "hsl(280 70% 65%)" }} />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-card" style={{
                boxShadow: "0 0 16px hsl(280 70% 65% / 0.3)"
              }}>
                <Zap size={13} style={{ color: "hsl(280 70% 65%)" }} />
              </div>
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.06 }}
            className="font-display text-5xl font-black tracking-tight md:text-7xl"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 60%), hsl(0 0% 100% / 0.9), hsl(280 60% 55%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            VANTABRAIN
          </motion.h1>

          <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="mx-auto mt-4 max-w-lg text-muted-foreground text-base md:text-lg">
            Your workspace intelligence — learning how your business operates and making every AI Employee smarter over time.
          </motion.p>
        </div>
      </section>

      {/* ── Dashboard Content ── */}
      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Stats Row */}
          <motion.div {...fadeUp} transition={{ delay: 0.14 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 mt-10">
            {[
              { label: "Memories Stored", value: stats.totalMemories, icon: Database, desc: "Learned preferences" },
              { label: "Patterns Found", value: stats.totalPatterns, icon: Activity, desc: "Behavioral insights" },
              { label: "Interactions", value: stats.totalInteractions, icon: BarChart3, desc: "Actions tracked" },
              { label: "Connected Roles", value: 4, icon: Network, desc: "AI Employees" },
            ].map((s) => (
              <div key={s.label} className="group rounded-2xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-border/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/40">
                    <s.icon size={15} style={{ color: "hsl(280 70% 65%)" }} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{statsLoading ? "–" : s.value}</p>
                <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* How It Works */}
          <motion.div {...fadeUp} transition={{ delay: 0.18 }} className="mb-10">
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} style={{ color: "hsl(280 70% 65%)" }} />
                <h2 className="font-display text-base font-semibold text-foreground">How VANTABRAIN Works</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { step: "01", title: "Observe", desc: "Every approval, edit, and action across your AI Employees is tracked.", icon: Eye },
                  { step: "02", title: "Learn", desc: "Patterns and preferences are extracted and stored as persistent memory.", icon: Brain },
                  { step: "03", title: "Improve", desc: "Future AI outputs use your brain context to deliver better results.", icon: Sparkles },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 rounded-xl border border-border/30 bg-background/50 p-4">
                    <span className="shrink-0 font-display text-2xl font-bold tracking-tighter" style={{ color: "hsl(280 70% 65% / 0.3)" }}>{s.step}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <s.icon size={13} style={{ color: "hsl(280 70% 65%)" }} /> {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Memories + Patterns */}
          <div className="grid md:grid-cols-5 gap-4">
            <motion.div {...fadeUp} transition={{ delay: 0.22 }} className="md:col-span-3">
              <div className="rounded-2xl border border-border/40 bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} style={{ color: "hsl(280 70% 65%)" }} />
                    <h2 className="font-display text-base font-semibold text-foreground">Learned Preferences</h2>
                    {memories.length > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{memories.length}</span>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : memories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
                    <Brain size={36} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">No memories yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">As you use your AI Employees, VANTABRAIN will learn your preferences.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {memories.map((m) => {
                      const CatIcon = categoryIcons[m.category] || Lightbulb;
                      return (
                        <div key={m.id} className="group flex items-start gap-3 rounded-xl border border-border/30 bg-background/50 p-4 transition-all hover:border-border/50">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/30 bg-card">
                            <CatIcon size={14} style={{ color: "hsl(280 70% 65%)" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{m.memory_key}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.memory_value}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[10px] text-muted-foreground/60 rounded-full border border-border/30 px-2 py-0.5">{m.scope}</span>
                              <span className="text-[10px] text-muted-foreground/60">{m.times_reinforced}× reinforced</span>
                              <span className="text-[10px] text-muted-foreground/60">{Math.round(m.confidence * 100)}%</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => handleDeleteMemory(m.id)}>
                            <Trash2 size={13} className="text-muted-foreground" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.26 }} className="md:col-span-2">
              <div className="rounded-2xl border border-border/40 bg-card p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: "hsl(280 70% 65%)" }} />
                    <h2 className="font-display text-base font-semibold text-foreground">Patterns</h2>
                    {patterns.length > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{patterns.length}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowPatterns(!showPatterns)}>
                    {showPatterns ? <EyeOff size={13} /> : <Eye size={13} />}
                  </Button>
                </div>

                {showPatterns && (
                  loading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : patterns.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
                      <TrendingUp size={28} className="mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-muted-foreground">No patterns yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Keep using the platform and trends will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {patterns.map((p) => (
                        <div key={p.id} className="group rounded-xl border border-border/30 bg-background/50 p-4 transition-all hover:border-border/50">
                          <p className="text-sm text-foreground leading-relaxed">{p.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground/60 rounded-full border border-border/30 px-2 py-0.5">{p.pattern_type}</span>
                            <span className="text-[10px] text-muted-foreground/60">{p.role_scope}</span>
                            <span className="text-[10px] text-muted-foreground/60">{p.evidence_count}×</span>
                          </div>
                          <div className="mt-2">
                            <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${Math.round(p.confidence * 100)}%`,
                                background: "linear-gradient(90deg, hsl(280 70% 65%), hsl(217 91% 60%))"
                              }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground/50 mt-1">{Math.round(p.confidence * 100)}% confidence</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 px-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground" onClick={() => handleDismissPattern(p.id)}>
                            <Trash2 size={11} className="mr-1" /> Dismiss
                          </Button>
                        </div>
                      ))}
                    </div>
                  )
                )}
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

  return (
    <PageLayout>
      {user ? <AuthenticatedView /> : <PublicView />}
    </PageLayout>
  );
};

export default VantaBrainPage;
