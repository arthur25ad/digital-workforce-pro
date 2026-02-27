import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVantaBrainMemories, useVantaBrainStats, useVantaBrainActions } from "@/hooks/useVantaBrain";
import {
  Brain, Sparkles, Trash2, Eye, EyeOff, TrendingUp,
  Lightbulb, Clock, Shield, ArrowLeft,
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
      <section className="px-4 pt-28 pb-20 md:px-8">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Brain size={24} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">VantaBrain</h1>
                <p className="text-sm text-muted-foreground">Your workspace intelligence — what Vantory has learned about your business</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3 mb-10"
          >
            {[
              { label: "Memories", value: stats.totalMemories, icon: Lightbulb },
              { label: "Patterns", value: stats.totalPatterns, icon: TrendingUp },
              { label: "Interactions", value: stats.totalInteractions, icon: Shield },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/40 bg-card p-4 text-center">
                <s.icon size={18} className="mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{statsLoading ? "–" : s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Memories */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-primary" /> Learned Preferences
            </h2>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : memories.length === 0 ? (
              <div className="rounded-xl border border-border/30 bg-card/50 p-8 text-center">
                <Brain size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No memories yet. As you use your AI Employees, VantaBrain will learn your preferences.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((m) => {
                  const CatIcon = categoryIcons[m.category] || Lightbulb;
                  return (
                    <div key={m.id} className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4">
                      <CatIcon size={16} className="mt-0.5 shrink-0 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{m.memory_key}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.memory_value}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground/60 rounded-full bg-muted/30 px-2 py-0.5">{m.scope}</span>
                          <span className="text-[10px] text-muted-foreground/60">{m.times_reinforced}× reinforced</span>
                          <span className="text-[10px] text-muted-foreground/60">{Math.round(m.confidence * 100)}% confident</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMemory(m.id)}
                      >
                        <Trash2 size={14} className="text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Patterns */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Detected Patterns
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPatterns(!showPatterns)}>
                {showPatterns ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="ml-1 text-xs">{showPatterns ? "Hide" : "Show"}</span>
              </Button>
            </div>
            {showPatterns && (
              loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : patterns.length === 0 ? (
                <div className="rounded-xl border border-border/30 bg-card/50 p-8 text-center">
                  <TrendingUp size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No patterns detected yet. Keep using the platform and VantaBrain will identify useful trends.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patterns.map((p) => (
                    <div key={p.id} className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4">
                      <TrendingUp size={16} className="mt-0.5 shrink-0 text-primary/70" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{p.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground/60 rounded-full bg-muted/30 px-2 py-0.5">{p.pattern_type}</span>
                          <span className="text-[10px] text-muted-foreground/60">{p.role_scope}</span>
                          <span className="text-[10px] text-muted-foreground/60">{p.evidence_count}× observed</span>
                          <span className="text-[10px] text-muted-foreground/60">{Math.round(p.confidence * 100)}%</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDismissPattern(p.id)}
                      >
                        <Trash2 size={14} className="text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.div>

        </div>
      </section>
    </PageLayout>
  );
};

export default VantaBrainPage;
