import { motion, useInView } from "framer-motion";
import { Share2, Mail, Headphones, CalendarCheck, CheckCircle2, Clock4, ArrowRight, Zap, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const roleColors = {
  social: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
  email: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
  support: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
  assistant: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
};

const activityRows = [
  { icon: CheckCircle2, role: "support", roleIcon: Headphones, text: "Drafted 3 customer replies", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "2 min ago" },
  { icon: CheckCircle2, role: "email", roleIcon: Mail, text: "Scheduled welcome email sequence", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "8 min ago" },
  { icon: Clock4, role: "social", roleIcon: Share2, text: "Instagram carousel ready for approval", status: "Needs Review", statusColor: "text-blue-400", statusBg: "bg-blue-500/10", time: "15 min ago" },
  { icon: CheckCircle2, role: "assistant", roleIcon: CalendarCheck, text: "Organized 5 tasks & set follow-ups", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "22 min ago" },
  { icon: Clock4, role: "email", roleIcon: Mail, text: "Flash sale email awaiting approval", status: "Needs Review", statusColor: "text-amber-400", statusBg: "bg-amber-500/10", time: "35 min ago" },
  { icon: ArrowRight, role: "social", roleIcon: Share2, text: "3 LinkedIn posts scheduled for tomorrow", status: "Queued", statusColor: "text-blue-300", statusBg: "bg-blue-500/10", time: "1h ago" },
];

const roleStats = [
  { icon: Share2, label: "Social Media", ...roleColors.social, stat: "12", unit: "posts this week", trend: "+24%" },
  { icon: Mail, label: "Email Marketing", ...roleColors.email, stat: "8", unit: "campaigns active", trend: "+15%" },
  { icon: Headphones, label: "Customer Support", ...roleColors.support, stat: "47", unit: "replies drafted", trend: "+32%" },
  { icon: CalendarCheck, label: "Virtual Assistant", ...roleColors.assistant, stat: "23", unit: "tasks managed", trend: "+18%" },
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
  return (
    <section className="relative overflow-hidden pb-24 pt-4 md:pb-32 md:pt-8">
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
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {roleStats.map((role, i) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border ${role.border} p-5 transition-all duration-500 hover:scale-[1.02]`}
              style={{ background: `linear-gradient(160deg, ${role.glow}, transparent 60%)` }}
            >
              {/* Subtle animated glow on hover */}
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
            </motion.div>
          ))}
        </div>

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
                Equivalent to hiring 0.85 full-time employees
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
