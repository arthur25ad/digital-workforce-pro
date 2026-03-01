import { motion, useInView, AnimatePresence } from "framer-motion";
import { Share2, Mail, Headphones, CalendarCheck, CheckCircle2, Clock4, ArrowRight, Zap, TrendingUp, Sparkles, X, MessageSquare, PenTool, Send, Clock, BarChart2, Users, Calendar, Bell, RefreshCw, FileText, Target, Megaphone } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const roleColors = {
  social: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)", accent: "hsl(217 91% 60%)" },
  email: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)", accent: "hsl(160 60% 45%)" },
  support: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)", accent: "hsl(262 60% 58%)" },
  assistant: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)", accent: "hsl(38 80% 55%)" },
};

const activityRows = [
  { icon: CheckCircle2, role: "support", roleIcon: Headphones, text: "Answered pricing inquiry for new client", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "3 min ago" },
  { icon: CheckCircle2, role: "email", roleIcon: Mail, text: "Monthly newsletter sent to 310 customers", status: "Sent", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "12 min ago" },
  { icon: Clock4, role: "social", roleIcon: Share2, text: "Before & after post ready for approval", status: "Review", statusColor: "text-blue-400", statusBg: "bg-blue-500/10", time: "18 min ago" },
  { icon: CheckCircle2, role: "assistant", roleIcon: CalendarCheck, text: "Rescheduled 2 appointments & notified clients", status: "Done", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10", time: "25 min ago" },
];

const roleDetails = [
  {
    icon: Share2, label: "Social Media", ...roleColors.social, stat: "12", unit: "posts/wk",
    tagline: "Your always-on content creator",
    summary: "Creates, schedules & publishes content across all your social platforms.",
    features: [
      { icon: PenTool, text: "Writes captions in your brand voice" },
      { icon: Calendar, text: "Schedules at peak engagement times" },
      { icon: BarChart2, text: "Tracks performance" },
      { icon: Target, text: "Generates content ideas" },
    ],
    metrics: [{ label: "Response", value: "< 2 min" }, { label: "Platforms", value: "5+" }, { label: "Accuracy", value: "96%" }],
  },
  {
    icon: Mail, label: "Email", ...roleColors.email, stat: "8", unit: "campaigns",
    tagline: "Campaigns that convert, on autopilot",
    summary: "Writes newsletters, promos & follow-ups that sound like you.",
    features: [
      { icon: FileText, text: "Drafts subject lines & body" },
      { icon: Users, text: "Segments audience automatically" },
      { icon: Send, text: "Sends at optimal times" },
      { icon: Megaphone, text: "Creates promo sequences" },
    ],
    metrics: [{ label: "Open Rate", value: "42%" }, { label: "Click Rate", value: "8.3%" }, { label: "Delivery", value: "99%" }],
  },
  {
    icon: Headphones, label: "Support", ...roleColors.support, stat: "47", unit: "replies",
    tagline: "Instant, thoughtful customer care",
    summary: "Reads every ticket, drafts replies using your policies & tone.",
    features: [
      { icon: MessageSquare, text: "Matches your reply tone" },
      { icon: Clock, text: "Prioritizes by urgency" },
      { icon: FileText, text: "References your policies" },
      { icon: Bell, text: "Escalates critical issues" },
    ],
    metrics: [{ label: "First Reply", value: "< 30s" }, { label: "Resolution", value: "94%" }, { label: "CSAT", value: "4.8/5" }],
  },
  {
    icon: CalendarCheck, label: "Calendar", ...roleColors.assistant, stat: "23", unit: "managed",
    tagline: "Your schedule, perfectly managed",
    summary: "Manages bookings, sends reminders & reschedules automatically.",
    features: [
      { icon: Calendar, text: "Books & confirms appointments" },
      { icon: Bell, text: "Sends smart reminders" },
      { icon: RefreshCw, text: "Handles reschedules" },
      { icon: Clock, text: "Detects conflicts" },
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
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const DashboardPreview = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden pb-10 pt-4 md:pb-14 md:pt-8">
      <div className="relative mx-auto max-w-[1200px] px-4 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-12 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            Your AI Team{" "}
            <span className="gradient-text">Never Stops</span>{" "}
            Working
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-muted-foreground">
            Here's what a typical day looks like when your AI employees are active.
          </p>
        </motion.div>

        {/* Compact role cards */}
        <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          {roleDetails.map((role, i) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === i ? null : i)}
            >
              <div
                className={`rounded-xl border ${role.border} p-3 md:p-4 transition-all duration-300 hover:scale-[1.02]`}
                style={{ background: `linear-gradient(160deg, ${role.glow}, transparent 60%)` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${role.bg} ${role.text}`}>
                    <role.icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">{role.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-lg font-bold text-foreground">
                        <AnimatedCounter target={parseInt(role.stat)} />
                      </span>
                      <span className="text-[10px] text-muted-foreground">{role.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expanded card overlay */}
        <AnimatePresence>
          {expandedCard !== null && (() => {
            const role = roleDetails[expandedCard];
            return (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
                  onClick={() => setExpandedCard(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="fixed inset-x-4 top-[12%] z-[70] mx-auto max-w-lg md:inset-x-0"
                >
                  <div className={`relative overflow-hidden rounded-2xl border ${role.border} p-6`}
                    style={{ background: `linear-gradient(160deg, ${role.glow}, hsl(0 0% 6% / 0.97) 50%)` }}
                  >
                    <button onClick={(e) => { e.stopPropagation(); setExpandedCard(null); }}
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/80 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${role.bg} ${role.text}`}>
                      <role.icon size={24} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">{role.label}</h3>
                    <p className="mt-1 text-xs" style={{ color: role.accent }}>{role.tagline}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{role.summary}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {role.features.map((f, fi) => (
                        <div key={fi} className={`flex items-start gap-2 rounded-lg border ${role.border} bg-background/30 p-2.5`}>
                          <f.icon size={12} className={role.text} />
                          <span className="text-[11px] text-foreground/80">{f.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {role.metrics.map((m, mi) => (
                        <div key={mi} className={`rounded-lg border ${role.border} bg-background/30 px-2 py-2 text-center`}>
                          <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                          <p className="text-[9px] text-muted-foreground/60">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            );
          })()}
        </AnimatePresence>

        {/* Activity feed — compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-border/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-primary" />
              <span className="font-display text-xs font-semibold text-foreground">Live Activity</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              4 AI employees active
            </span>
          </div>
          <div className="divide-y divide-border/20 px-2 py-1">
            {activityRows.map((row, i) => {
              const colors = roleColors[row.role as keyof typeof roleColors];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-2.5 px-2 py-2.5"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                    <row.roleIcon size={13} />
                  </div>
                  <span className="flex-1 text-xs text-foreground/90 line-clamp-1">{row.text}</span>
                  <span className={`hidden sm:inline-block shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${row.statusColor} ${row.statusBg}`}>
                    {row.status}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground/40">{row.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
