import { motion, useInView, AnimatePresence } from "framer-motion";
import { Share2, Mail, Headphones, CalendarCheck, CheckCircle2, Clock4, ArrowRight, Zap, TrendingUp, BarChart3, Sparkles, X, MessageSquare, PenTool, Send, Clock, BarChart2, Users, Calendar, Bell, RefreshCw, FileText, Target, Megaphone } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const roleColors = {
  social: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
  email: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
  support: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
  assistant: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
};

const activityRows = [
  { icon: CheckCircle2, role: "support", roleIcon: Headphones, text: "Answered pricing inquiry for new client consultation", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "3 min ago" },
  { icon: CheckCircle2, role: "email", roleIcon: Mail, text: "Monthly newsletter sent to 310 local customers", status: "Sent", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "12 min ago" },
  { icon: Clock4, role: "social", roleIcon: Share2, text: "Before & after photo post ready for approval", status: "Needs Review", statusColor: "text-blue-400", statusBg: "bg-blue-500/10", time: "18 min ago" },
  { icon: CheckCircle2, role: "assistant", roleIcon: CalendarCheck, text: "Rescheduled 2 client appointments & notified them", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "25 min ago" },
  { icon: Clock4, role: "email", roleIcon: Mail, text: "Holiday promo email draft awaiting your review", status: "Needs Review", statusColor: "text-amber-400", statusBg: "bg-amber-500/10", time: "40 min ago" },
  { icon: ArrowRight, role: "social", roleIcon: Share2, text: "Instagram ad set live targeting local audience", status: "Live", statusColor: "text-blue-400", statusBg: "bg-blue-500/10", time: "1h ago" },
];

const roleDetails = [
  {
    icon: Share2, label: "Social Media", ...roleColors.social, stat: "12", unit: "posts this week", trend: "+24%",
    tagline: "Your always-on content creator",
    summary: "Creates, schedules & publishes content across all your social platforms — so you stay visible without lifting a finger.",
    features: [
      { icon: PenTool, text: "Writes captions in your brand voice" },
      { icon: Calendar, text: "Schedules posts at peak engagement times" },
      { icon: BarChart2, text: "Tracks performance & suggests improvements" },
      { icon: Target, text: "Generates content ideas from your niche" },
    ],
    metrics: [{ label: "Avg. Response", value: "< 2 min" }, { label: "Platforms", value: "5+" }, { label: "Accuracy", value: "96%" }],
  },
  {
    icon: Mail, label: "Email Marketing", ...roleColors.email, stat: "8", unit: "campaigns active", trend: "+15%",
    tagline: "Campaigns that convert, on autopilot",
    summary: "Writes newsletters, promos & follow-ups that sound like you — then sends them at the perfect time.",
    features: [
      { icon: FileText, text: "Drafts subject lines & body copy" },
      { icon: Users, text: "Segments your audience automatically" },
      { icon: Send, text: "Sends at optimal open-rate times" },
      { icon: Megaphone, text: "Creates promo & nurture sequences" },
    ],
    metrics: [{ label: "Open Rate", value: "42%" }, { label: "Click Rate", value: "8.3%" }, { label: "Deliverability", value: "99%" }],
  },
  {
    icon: Headphones, label: "Customer Support", ...roleColors.support, stat: "47", unit: "replies drafted", trend: "+32%",
    tagline: "Instant, thoughtful customer care",
    summary: "Reads every ticket, drafts thoughtful replies using your policies & tone — and flags anything urgent.",
    features: [
      { icon: MessageSquare, text: "Drafts replies matching your tone" },
      { icon: Clock, text: "Prioritizes tickets by urgency" },
      { icon: FileText, text: "References your policies & FAQs" },
      { icon: Bell, text: "Escalates critical issues to you" },
    ],
    metrics: [{ label: "First Reply", value: "< 30s" }, { label: "Resolution", value: "94%" }, { label: "CSAT", value: "4.8/5" }],
  },
  {
    icon: CalendarCheck, label: "Calendar Assistant", ...roleColors.assistant, stat: "23", unit: "appointments managed", trend: "+18%",
    tagline: "Your schedule, perfectly managed",
    summary: "Manages bookings, sends reminders & reschedules — keeping your calendar organized automatically.",
    features: [
      { icon: Calendar, text: "Books & confirms appointments" },
      { icon: Bell, text: "Sends smart reminders to clients" },
      { icon: RefreshCw, text: "Handles reschedules & cancellations" },
      { icon: Clock, text: "Detects scheduling conflicts" },
    ],
    metrics: [{ label: "No-Shows", value: "↓ 70%" }, { label: "Bookings", value: "Auto" }, { label: "Reminders", value: "Smart" }],
  },
];

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const DashboardPreview = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden pb-10 pt-4 md:pb-14 md:pt-8">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.3), transparent 70%)" }} />
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, hsl(262 60% 58% / 0.3), transparent 70%)" }} />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[80px]" style={{ background: "radial-gradient(circle, hsl(160 60% 45% / 0.4), transparent 70%)" }} />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Your AI Team{" "}
            <span className="relative">
              <span className="gradient-text">Never Stops</span>
            </span>{" "}
            Working
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            While you sleep, your AI employees handle social media, customer support, email marketing, and admin — here's what a typical day looks like.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Sparkles size={14} className="animate-pulse" />
            Live Dashboard Preview
          </motion.div>
        </motion.div>

        {/* Big stat cards with animated counters */}
        <div className="relative mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {roleDetails.map((role, i) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === i ? null : i)}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border ${role.border} p-5 transition-all duration-500 hover:scale-[1.02]`}
                style={{ background: `linear-gradient(160deg, ${role.glow}, transparent 60%)` }}
              >
                <div
                  className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: role.accent }}
                />
                <div className="relative">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${role.bg} ${role.text} transition-transform duration-300 group-hover:scale-110`}>
                    <role.icon size={22} />
                  </div>
                  <p className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{role.label}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="font-display text-3xl font-bold text-foreground">
                      <AnimatedCounter target={parseInt(role.stat)} />
                    </span>
                    <span className="mb-1 text-xs text-muted-foreground">{role.unit}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp size={12} className={role.text} />
                    <span className={`text-[11px] font-semibold ${role.text}`}>{role.trend}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded card overlay */}
        <AnimatePresence>
          {expandedCard !== null && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
                onClick={() => setExpandedCard(null)}
              />
              {/* Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 40 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="fixed inset-x-4 top-[10%] z-[70] mx-auto max-w-lg md:inset-x-0 md:top-[15%] max-h-[80vh] overflow-y-auto"
              >
                {(() => {
                  const role = roleDetails[expandedCard];
                  return (
                    <div
                      className={`relative overflow-hidden rounded-3xl border ${role.border} p-6 md:p-8`}
                      style={{ background: `linear-gradient(160deg, ${role.glow}, hsl(0 0% 6% / 0.97) 50%)` }}
                    >
                      {/* Glow effects */}
                      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: role.accent }} />
                      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full opacity-15 blur-3xl" style={{ background: role.accent }} />

                      {/* Close button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-background/80 text-muted-foreground transition-colors hover:text-foreground active:scale-95 md:h-8 md:w-8 md:right-4 md:top-4"
                      >
                        <X size={16} />
                      </button>

                      {/* Header */}
                      <div className="relative mb-6">
                        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${role.bg} ${role.text}`}>
                          <role.icon size={28} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">{role.label}</h3>
                        <p className="mt-1 text-sm font-medium" style={{ color: role.accent }}>{role.tagline}</p>
                      </div>

                      {/* Summary */}
                      <p className="relative mb-6 text-sm leading-relaxed text-muted-foreground md:text-base">
                        {role.summary}
                      </p>

                      {/* Feature grid */}
                      <div className="relative grid grid-cols-2 gap-3">
                        {role.features.map((feat, fi) => (
                          <motion.div
                            key={fi}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + fi * 0.08 }}
                            className={`flex items-start gap-3 rounded-xl border ${role.border} bg-background/30 p-3`}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${role.bg} ${role.text}`}>
                              <feat.icon size={14} />
                            </div>
                            <span className="text-xs leading-snug text-foreground/80 pt-1">{feat.text}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Key metrics */}
                      <div className="relative mt-6 grid grid-cols-3 gap-2">
                        {role.metrics.map((m, mi) => (
                          <motion.div
                            key={mi}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + mi * 0.08 }}
                            className={`rounded-lg border ${role.border} bg-background/30 px-3 py-2.5 text-center`}
                          >
                            <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content area — two columns on desktop */}
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
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
                All 4 AI employees active
              </span>
            </div>

            <div className="divide-y divide-border/20 px-3 py-2">
              {activityRows.map((row, i) => {
                const colors = roleColors[row.role as keyof typeof roleColors];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                    className="group/row flex items-center gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-secondary/40 md:gap-4"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition-transform duration-200 group-hover/row:scale-110`}>
                      <row.roleIcon size={15} />
                    </div>
                    <span className="flex-1 text-sm text-foreground/90">{row.text}</span>
                    <span className={`hidden shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold sm:inline-block ${row.statusColor} ${row.statusBg}`}>
                      {row.status}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground/40">{row.time}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right sidebar — summary + performance */}
          <div className="flex flex-col gap-5">
            {/* Weekly summary card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                <span className="font-display text-sm font-semibold text-foreground">Weekly Performance</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Tasks Completed", value: 90, max: 100, color: "bg-primary" },
                  { label: "Approval Rate", value: 94, max: 100, color: "bg-emerald-500" },
                  { label: "Response Time", value: 87, max: 100, color: "bg-violet-500" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                      <span className="text-xs font-semibold text-foreground">{metric.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(metric.value / metric.max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${metric.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Time saved card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-primary/20 p-5"
              style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.08), hsl(262 60% 58% / 0.06))" }}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: "hsl(217 91% 60%)" }} />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">Time Saved This Week</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-foreground">
                  <AnimatedCounter target={34} duration={2.5} />
                </span>
                <span className="mb-1.5 text-lg font-semibold text-muted-foreground">hours</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground/60">
                Equivalent to 2 full-time employees
              </p>
            </motion.div>

            {/* Bottom summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex items-center gap-3 rounded-xl border border-border/20 bg-background/40 px-4 py-3"
            >
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">90+ tasks</span> completed this week
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
