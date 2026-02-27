import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVantaBrainMemories, useVantaBrainStats, useVantaBrainActions } from "@/hooks/useVantaBrain";
import {
  Brain, Sparkles, Trash2, Eye, EyeOff, TrendingUp,
  Lightbulb, Clock, Shield, ArrowLeft, Zap, Database,
  Activity, Network, BarChart3, Layers,
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
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const VantaBrainPage = () => {
  const { workspace } = useAuth();
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
    <PageLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pt-28 pb-0 md:px-8">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(280 70% 65% / 0.12), transparent)"
        }} />

        <div className="mx-auto max-w-5xl relative">
          <motion.div {...fadeUp} className="text-center mb-6">

            <div className="mt-4 flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border/50 bg-card" style={{
                  boxShadow: "0 0 60px hsl(280 70% 65% / 0.2), 0 0 120px hsl(280 70% 65% / 0.08)"
                }}>
                  <Brain size={36} style={{ color: "hsl(280 70% 65%)" }} />
                </div>
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card">
                  <Zap size={12} style={{ color: "hsl(280 70% 65%)" }} />
                </div>
              </div>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-5xl">
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(135deg, hsl(280 70% 75%), hsl(280 70% 55%), hsl(217 91% 70%))"
              }}>VANTABRAIN</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Your workspace intelligence layer. VantaBrain learns how your business operates and makes every AI Employee smarter over time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Dashboard ── */}
      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Stats Row */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Memories Stored", value: stats.totalMemories, icon: Database, desc: "Learned preferences" },
              { label: "Patterns Found", value: stats.totalPatterns, icon: Activity, desc: "Behavioral insights" },
              { label: "Interactions", value: stats.totalInteractions, icon: BarChart3, desc: "Actions tracked" },
              { label: "Connected Roles", value: 4, icon: Network, desc: "AI Employees" },
            ].map((s, i) => (
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

          {/* How VantaBrain Works */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="mb-10">
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} style={{ color: "hsl(280 70% 65%)" }} />
                <h2 className="font-display text-base font-semibold text-foreground">How VantaBrain Works</h2>
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

          {/* Content Grid: Memories + Patterns side by side */}
          <div className="grid md:grid-cols-5 gap-4">

            {/* Memories — wider panel */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="md:col-span-3">
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
                    <p className="text-xs text-muted-foreground/60 mt-1">As you use your AI Employees, VantaBrain will learn your preferences.</p>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => handleDeleteMemory(m.id)}
                          >
                            <Trash2 size={13} className="text-muted-foreground" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Patterns — narrower side panel */}
            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="md:col-span-2">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground"
                            onClick={() => handleDismissPattern(p.id)}
                          >
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
    </PageLayout>
  );
};

export default VantaBrainPage;
