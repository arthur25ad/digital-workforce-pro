import { motion } from "framer-motion";
import { Share2, Mail, Headphones, CalendarCheck, CheckCircle2, Clock4, ArrowRight, Zap } from "lucide-react";

const roleColors = {
  social: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hsl(217 91% 60% / 0.15)" },
  email: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hsl(160 60% 45% / 0.15)" },
  support: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "hsl(262 60% 58% / 0.15)" },
  assistant: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hsl(38 80% 55% / 0.15)" },
};

const activityRows = [
  { icon: CheckCircle2, role: "support", roleIcon: Headphones, text: "Drafted 3 customer replies", status: "Done", statusColor: "text-emerald-400", time: "2 min ago" },
  { icon: CheckCircle2, role: "email", roleIcon: Mail, text: "Scheduled welcome email sequence", status: "Done", statusColor: "text-emerald-400", time: "8 min ago" },
  { icon: Clock4, role: "social", roleIcon: Share2, text: "Instagram carousel ready for approval", status: "Needs Review", statusColor: "text-blue-400", time: "15 min ago" },
  { icon: CheckCircle2, role: "assistant", roleIcon: CalendarCheck, text: "Organized 5 tasks & set follow-ups", status: "Done", statusColor: "text-emerald-400", time: "22 min ago" },
  { icon: Clock4, role: "email", roleIcon: Mail, text: "Flash sale email awaiting approval", status: "Needs Review", statusColor: "text-amber-400", time: "35 min ago" },
  { icon: ArrowRight, role: "social", roleIcon: Share2, text: "3 LinkedIn posts scheduled for tomorrow", status: "Queued", statusColor: "text-blue-300", time: "1h ago" },
];

const roleStats = [
  { icon: Share2, label: "Social Media", ...roleColors.social, stat: "12 posts this week" },
  { icon: Mail, label: "Email Marketing", ...roleColors.email, stat: "8 campaigns active" },
  { icon: Headphones, label: "Customer Support", ...roleColors.support, stat: "47 replies drafted" },
  { icon: CalendarCheck, label: "Virtual Assistant", ...roleColors.assistant, stat: "23 tasks managed" },
];

const DashboardPreview = () => {
  return (
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Your AI Team Never Stops Working
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            While you sleep, your AI employees handle social media, customer support, email marketing, and admin — here's a live snapshot.
          </p>
        </motion.div>

        {/* Role stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        >
          {roleStats.map((role, i) => (
            <motion.div
              key={role.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-xl border ${role.border} p-4 transition-all duration-300`}
              style={{ background: `linear-gradient(135deg, ${role.glow}, transparent)` }}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${role.bg} ${role.text}`}>
                <role.icon size={20} />
              </div>
              <p className="font-display text-xs font-semibold text-foreground">{role.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{role.stat}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="card-glass overflow-hidden rounded-2xl p-6 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Zap size={16} className="text-primary" />
              </div>
              <span className="font-display text-base font-semibold text-foreground">Live Activity Feed</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-green-500" />
              All 4 AI employees active
            </span>
          </div>

          {/* Table-like rows */}
          <div className="space-y-2">
            {activityRows.map((row, i) => {
              const colors = roleColors[row.role as keyof typeof roleColors];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl bg-secondary/80 px-4 py-3 md:gap-4"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                    <row.roleIcon size={14} />
                  </div>
                  <span className="flex-1 text-sm text-foreground">{row.text}</span>
                  <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:inline-block ${row.statusColor}`}
                    style={{ background: "hsl(225 20% 11% / 0.8)" }}
                  >
                    {row.status}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/50">{row.time}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom summary */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/30 bg-background/40 px-5 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">90+ tasks</span> completed this week across all roles
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/40">Updated seconds ago</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
