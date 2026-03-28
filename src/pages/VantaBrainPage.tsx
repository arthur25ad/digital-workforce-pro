import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useVantaBrainMemories, useVantaBrainStats, useVantaBrainActions } from "@/hooks/useVantaBrain";
import { useBrainSettings } from "@/hooks/useBrainSettings";
import {
  Brain, Sparkles, Trash2, Eye, EyeOff, TrendingUp,
  Lightbulb, Clock, Shield, Database,
  Activity, Network, BarChart3, ArrowRight,
  Globe, Lock, Cpu, Mail, MessageSquare,
  Users, Plug, Settings, History, AlertCircle, Zap,
  ChevronDown,
} from "lucide-react";
import N8nSettingsPanel from "@/components/workspace/N8nSettingsPanel";
import NotionBusinessNotes from "@/components/workspace/NotionBusinessNotes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import VantaBrainAssistant from "@/components/VantaBrainAssistant";

const PURPLE = "hsl(280 70% 65%)";

const categoryIcons: Record<string, any> = {
  preference: Lightbulb, style: Sparkles, timing: Clock, tone: Sparkles, workflow: TrendingUp,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════
   PUBLIC VIEW — Simplified
   ═══════════════════════════════════════════════ */
const PublicView = () => (
  <>
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-28 md:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 15%, hsl(280 70% 65% / 0.2), transparent)"
      }} />
      <div className="mx-auto max-w-[1600px] relative text-center">
        <motion.div {...fadeUp} className="flex justify-center mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-border/50 bg-card" style={{
            boxShadow: `0 0 80px hsl(280 70% 65% / 0.3)`
          }}>
            <Brain size={48} style={{ color: PURPLE }} />
          </div>
        </motion.div>
        <motion.h1 {...fadeUp} transition={{ delay: 0.06 }}
          className="font-display text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[0.85]"
          style={{ backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 55%), hsl(0 0% 100% / 0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          VANTABRAIN
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.12 }} className="mx-auto mt-5 max-w-xl text-base md:text-lg leading-relaxed" style={{ color: "hsl(280 70% 75% / 0.7)" }}>
          The intelligence layer that makes your AI team smarter.{" "}
          <span className="text-foreground/60">It learns how your business works.</span>
        </motion.p>
      </div>
    </section>

    {/* AI Chat — open by default */}
    <section className="px-6 pb-8 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1200px]">
        <motion.div {...fadeUp} transition={{ delay: 0.18 }}>
          <VantaBrainAssistant variant="flagship" />
        </motion.div>
      </div>
    </section>

    {/* How it works — compact */}
    <section className="px-6 pb-20 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[800px]">
        <motion.h2 {...fadeUp} className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
          How <span style={{ color: PURPLE }}>VANTABRAIN</span> Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Observe", desc: "Tracks your approvals, edits, and actions.", icon: Eye },
            { step: "02", title: "Learn", desc: "Turns patterns into persistent memory.", icon: Brain },
            { step: "03", title: "Improve", desc: "Outputs feel more like you, automatically.", icon: Sparkles },
          ].map((s) => (
            <motion.div key={s.step} {...fadeUp} className="text-center p-4">
              <span className="font-display text-3xl font-black tracking-tighter" style={{ color: "hsl(280 70% 65% / 0.15)" }}>{s.step}</span>
              <div className="flex justify-center mt-1 mb-2">
                <s.icon size={18} style={{ color: PURPLE }} />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Capabilities — compact grid */}
    <section className="px-6 pb-20 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1000px]">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { icon: Database, title: "Persistent Memory", desc: "Remembers preferences across sessions." },
            { icon: Activity, title: "Pattern Recognition", desc: "Detects trends and adapts." },
            { icon: Network, title: "Cross-Role Intelligence", desc: "All roles benefit from every interaction." },
            { icon: Shield, title: "Human-Controlled", desc: "Suggests — you decide." },
            { icon: Cpu, title: "Gets Smarter Over Time", desc: "The more you use it, the better it gets." },
            { icon: Lock, title: "Private & Secure", desc: "Completely isolated per workspace." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border/40 bg-card p-4">
              <f.icon size={16} style={{ color: PURPLE }} className="mb-2" />
              <h3 className="font-display text-xs font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 pb-20 md:px-12 lg:px-16">
      <div className="mx-auto max-w-md text-center">
        <Brain size={24} className="mx-auto mb-3" style={{ color: PURPLE }} />
        <h2 className="font-display text-lg font-bold text-foreground">Ready to build your AI's memory?</h2>
        <div className="mt-4">
          <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold uppercase tracking-wide"
            style={{ backgroundColor: "white", color: "hsl(280 70% 50%)", boxShadow: "0 0 25px hsl(280 70% 65% / 0.15)" }}>
            Start Free <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  </>
);

/* ═══════════════════════════════════════════════
   AUTHENTICATED — Simplified Intelligence Center
   ═══════════════════════════════════════════════ */

const ROLES = [
  { key: "social_media", label: "Social Media", icon: Globe, color: "hsl(217 91% 60%)" },
  { key: "customer_support", label: "Support", icon: MessageSquare, color: "hsl(150 60% 50%)" },
  { key: "email_marketing", label: "Email", icon: Mail, color: "hsl(35 90% 55%)" },
  { key: "virtual_assistant", label: "Assistant", icon: Users, color: "hsl(280 70% 65%)" },
];

const AuthenticatedView = ({ initialQuestion }: { initialQuestion?: string }) => {
  const { stats, loading: statsLoading } = useVantaBrainStats();
  const { memories, patterns, loading, refresh } = useVantaBrainMemories();
  const { deleteMemory, deletePattern } = useVantaBrainActions();
  const { settings, update: updateSettings, clearRoleMemory, clearAllMemory } = useBrainSettings();
  const { workspace } = useAuth();
  const [showPatterns, setShowPatterns] = useState(true);
  const [activeRoleTab, setActiveRoleTab] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"learning" | "context" | "activity">("learning");
  const [showNextSteps, setShowNextSteps] = useState(false);

  const handleDeleteMemory = async (id: string) => { await deleteMemory(id); toast.success("Memory removed"); refresh(); };
  const handleDismissPattern = async (id: string) => { await deletePattern(id); toast.success("Pattern dismissed"); refresh(); };

  const roleMemories = activeRoleTab ? memories.filter(m => m.scope === activeRoleTab) : memories;
  const rolePatterns = activeRoleTab ? patterns.filter(p => p.role_scope === activeRoleTab) : patterns;

  return (
    <>
      {/* ── Header ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-2 md:pt-28 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 45% at 50% 10%, hsl(280 70% 65% / 0.1), transparent)"
        }} />
        <div className="mx-auto max-w-[1200px] relative text-center">
          <motion.h1 {...fadeUp}
            className="font-display text-3xl font-black tracking-tight md:text-5xl"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(280 70% 80%), hsl(280 70% 60%), hsl(0 0% 100% / 0.9))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Intelligence Center
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.06 }} className="mx-auto mt-2 max-w-md text-muted-foreground text-xs md:text-sm">
            Guide how your AI team learns and adapts to your business.
          </motion.p>

          {/* ── Compact stats strip ── */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="mt-4 inline-flex items-center gap-4 rounded-full border border-border/30 bg-card/60 px-5 py-2 text-[11px] text-muted-foreground">
            <span><span className="font-semibold text-foreground">{statsLoading ? "–" : stats.totalMemories}</span> memories</span>
            <span className="h-3 w-px bg-border/40" />
            <span><span className="font-semibold text-foreground">{statsLoading ? "–" : stats.totalPatterns}</span> patterns</span>
            <span className="h-3 w-px bg-border/40" />
            <span><span className="font-semibold text-foreground">{statsLoading ? "–" : stats.totalInteractions}</span> interactions</span>
          </motion.div>
        </div>
      </section>

      {/* ── Ask VANTABRAIN ── */}
      <section className="px-6 pt-6 pb-4 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fadeUp} transition={{ delay: 0.12 }}>
            <VantaBrainAssistant initialQuestion={initialQuestion} variant="flagship" />
          </motion.div>
        </div>
      </section>

      {/* ── Automatic Next Steps — collapsed ── */}
      <section className="px-6 pb-4 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fadeUp} transition={{ delay: 0.14 }}>
            <button
              onClick={() => setShowNextSteps(!showNextSteps)}
              className="flex w-full items-center justify-between rounded-xl border border-border/30 bg-card/60 px-4 py-3 text-left transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Automatic Next Steps</span>
              </div>
              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${showNextSteps ? "rotate-180" : ""}`} />
            </button>
            {showNextSteps && (
              <div className="mt-2 rounded-xl border border-border/30 bg-card/60 p-4">
                <N8nSettingsPanel />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Main control panel with tabs ── */}
      <section className="px-6 pb-16 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1200px]">

          {/* Tab bar */}
          <motion.div {...fadeUp} transition={{ delay: 0.18 }} className="flex items-center gap-1 rounded-lg border border-border/30 bg-card/40 p-1 mb-4 w-fit">
            {[
              { key: "learning" as const, label: "Learning Controls", icon: Settings },
              { key: "context" as const, label: "Connected Context", icon: Plug },
              { key: "activity" as const, label: "Brain Activity", icon: History },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePanel(tab.key)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all ${
                  activePanel === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Role filter */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex items-center gap-1.5 mb-4">
            <button onClick={() => setActiveRoleTab(null)}
              className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${!activeRoleTab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground border border-border/30"}`}>
              All
            </button>
            {ROLES.map((r) => (
              <button key={r.key} onClick={() => setActiveRoleTab(activeRoleTab === r.key ? null : r.key)}
                className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${activeRoleTab === r.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground border border-border/30"}`}>
                {r.label}
              </button>
            ))}
          </motion.div>

          {/* Panel content */}
          <motion.div {...fadeUp} transition={{ delay: 0.22 }}>
            {activePanel === "learning" && (
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/50 p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">Pause All Learning</p>
                    <p className="text-[10px] text-muted-foreground">Temporarily stop learning new preferences</p>
                  </div>
                  <Switch checked={settings.learning_paused} onCheckedChange={(v) => updateSettings({ learning_paused: v })} />
                </div>
                <div className="space-y-3">
                  {[
                    { key: "learn_from_approvals" as const, label: "Learn from approvals", desc: "Track what you approve" },
                    { key: "learn_from_edits" as const, label: "Learn from edits", desc: "Refine outputs from your edits" },
                    { key: "learn_timing_suggestions" as const, label: "Timing suggestions", desc: "Suggest posting and send times" },
                    { key: "require_approval" as const, label: "Require approval", desc: "Ask before applying preferences" },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-foreground">{c.label}</p>
                        <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                      </div>
                      <Switch checked={settings[c.key]} onCheckedChange={(v) => updateSettings({ [c.key]: v })} />
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-border/30">
                  <Button variant="outline" size="sm" className="text-[11px] text-muted-foreground hover:text-destructive"
                    onClick={async () => { activeRoleTab ? await clearRoleMemory(activeRoleTab) : await clearAllMemory(); refresh(); }}>
                    <AlertCircle size={11} className="mr-1" />
                    {activeRoleTab ? `Clear ${ROLES.find(r => r.key === activeRoleTab)?.label} Memory` : "Reset All Preferences"}
                  </Button>
                </div>
              </div>
            )}

            {activePanel === "context" && (
              <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
                {/* Notion — primary integration */}
                <NotionBusinessNotes workspaceId={workspace?.id || null} />
                
                {/* Other context sources — secondary */}
                <div className="border-t border-border/30 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Other context sources</p>
                  <div className="space-y-1.5">
                    {[
                      { name: "Google Account", context: "Calendar, contacts", icon: Globe },
                      { name: "Gmail", context: "Email patterns", icon: Mail },
                      { name: "Social Accounts", context: "Posting patterns", icon: Globe },
                      { name: "Support Inbox", context: "Ticket history", icon: MessageSquare },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/50 p-2.5">
                        <t.icon size={13} className="text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="text-[11px] font-medium text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.context}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 rounded-full border border-border/20 px-1.5 py-0.5">Coming soon</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activePanel === "activity" && (
              <div className="rounded-xl border border-border/40 bg-card p-5">
                {stats.totalInteractions > 0 ? (
                  <div className="space-y-3">
                    {[
                      { text: "Learned preferred posting time", role: "social_media" },
                      { text: "Updated support reply tone", role: "customer_support" },
                      { text: "Strengthened newsletter timing", role: "email_marketing" },
                      { text: "Added task prioritization pattern", role: "virtual_assistant" },
                    ].map((a, i) => {
                      const role = ROLES.find(r => r.key === a.role);
                      return (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/30 bg-card">
                            {role ? <role.icon size={10} style={{ color: role.color }} /> : <Brain size={10} style={{ color: PURPLE }} />}
                          </div>
                          <p className="text-xs text-foreground">{a.text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <History size={20} className="mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No activity yet</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Activity appears as you use your AI Employees.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Learned memories & patterns — collapsible */}
          {(roleMemories.length > 0 || rolePatterns.length > 0) && (
            <motion.div {...fadeUp} transition={{ delay: 0.26 }} className="mt-4">
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                  View {roleMemories.length} memories & {rolePatterns.length} patterns
                </summary>
                <div className="mt-2 space-y-2">
                  {roleMemories.slice(0, 5).map((m) => {
                    const CatIcon = categoryIcons[m.category] || Lightbulb;
                    return (
                      <div key={m.id} className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-card p-3">
                        <CatIcon size={12} style={{ color: PURPLE }} className="mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{m.memory_key}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{m.memory_value}</p>
                        </div>
                        <button onClick={() => handleDeleteMemory(m.id)} className="text-muted-foreground/30 hover:text-destructive shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                  {rolePatterns.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-start gap-2.5 rounded-lg border border-border/30 bg-card p-3">
                      <TrendingUp size={12} style={{ color: PURPLE }} className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{p.description}</p>
                        <p className="text-[10px] text-muted-foreground/50">{p.pattern_type} · {Math.round(p.confidence * 100)}% confidence</p>
                      </div>
                      <button onClick={() => handleDismissPattern(p.id)} className="text-muted-foreground/30 hover:text-destructive shrink-0">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            </motion.div>
          )}

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
