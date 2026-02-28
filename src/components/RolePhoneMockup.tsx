import { motion, AnimatePresence } from "framer-motion";
import type { RoleSlug } from "@/lib/packages";
import phoneFrame from "@/assets/phone-mockup.png";
import {
  Share2, Headphones, Mail, CalendarCheck, Sparkles,
  FileText, Send, BarChart3, Users, MessageSquare,
  Zap, CheckCircle2, Bell, Clock, Target,
} from "lucide-react";

interface RolePhoneMockupProps {
  activeRole: RoleSlug | null;
}

const ROLE_THEMES: Record<
  RoleSlug,
  {
    accent: string;
    accentBg: string;
    accentBorder: string;
    glowColor: string;
    label: string;
    tagline: string;
    Icon: any;
    tasks: { icon: any; label: string; detail: string; status: string }[];
    stats: { label: string; value: string }[];
  }
> = {
  "social-media-manager": {
    accent: "text-blue-400",
    accentBg: "bg-blue-500/15",
    accentBorder: "border-blue-500/25",
    glowColor: "rgba(59,130,246,0.25)",
    label: "Social Media Manager",
    tagline: "Creating & scheduling your content",
    Icon: Share2,
    tasks: [
      { icon: Sparkles, label: "3 post ideas generated", detail: "Instagram Reels", status: "New" },
      { icon: FileText, label: "Caption drafted", detail: "Product launch post", status: "Ready" },
      { icon: Send, label: "Post scheduled", detail: "Tomorrow, 10:00 AM", status: "Queued" },
      { icon: BarChart3, label: "Engagement report", detail: "+24% this week", status: "Live" },
    ],
    stats: [
      { label: "Posts Queued", value: "12" },
      { label: "Engagement", value: "+24%" },
    ],
  },
  "customer-support": {
    accent: "text-violet-400",
    accentBg: "bg-violet-500/15",
    accentBorder: "border-violet-500/25",
    glowColor: "rgba(139,92,246,0.25)",
    label: "Customer Support",
    tagline: "Managing tickets & drafting replies",
    Icon: Headphones,
    tasks: [
      { icon: MessageSquare, label: "Reply drafted", detail: "Refund request #412", status: "Review" },
      { icon: Zap, label: "Ticket triaged", detail: "Urgent — billing issue", status: "Flagged" },
      { icon: CheckCircle2, label: "Issue resolved", detail: "Shipping inquiry", status: "Done" },
      { icon: FileText, label: "FAQ suggested", detail: "Password reset flow", status: "New" },
    ],
    stats: [
      { label: "Open Tickets", value: "8" },
      { label: "Avg Response", value: "2m" },
    ],
  },
  "email-marketer": {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/15",
    accentBorder: "border-emerald-500/25",
    glowColor: "rgba(16,185,129,0.25)",
    label: "Email Marketer",
    tagline: "Drafting campaigns & growing revenue",
    Icon: Mail,
    tasks: [
      { icon: Sparkles, label: "Subject lines generated", detail: "Spring Sale campaign", status: "New" },
      { icon: FileText, label: "Campaign drafted", detail: "Welcome series #2", status: "Ready" },
      { icon: Users, label: "Segment created", detail: "VIP customers (340)", status: "Active" },
      { icon: Send, label: "Send scheduled", detail: "Friday, 9:00 AM", status: "Queued" },
    ],
    stats: [
      { label: "Open Rate", value: "38%" },
      { label: "Campaigns", value: "5" },
    ],
  },
  "calendar-assistant": {
    accent: "text-amber-400",
    accentBg: "bg-amber-500/15",
    accentBorder: "border-amber-500/25",
    glowColor: "rgba(245,158,11,0.25)",
    label: "AI Calendar Assistant",
    tagline: "Scheduling & managing your time",
    Icon: CalendarCheck,
    tasks: [
      { icon: CalendarCheck, label: "Appointment booked", detail: "Sarah M. — 2:00 PM", status: "Confirmed" },
      { icon: Bell, label: "Reminder sent", detail: "Team standup in 15m", status: "Sent" },
      { icon: Clock, label: "Follow-up scheduled", detail: "Client review — Thu", status: "Pending" },
      { icon: Target, label: "Time slot suggested", detail: "Optimal: Wed 11 AM", status: "New" },
    ],
    stats: [
      { label: "This Week", value: "14" },
      { label: "Reminders", value: "6" },
    ],
  },
};

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-500/20 text-blue-300",
  Ready: "bg-emerald-500/20 text-emerald-300",
  Queued: "bg-amber-500/20 text-amber-300",
  Live: "bg-green-500/20 text-green-300",
  Review: "bg-violet-500/20 text-violet-300",
  Flagged: "bg-red-500/20 text-red-300",
  Done: "bg-emerald-500/20 text-emerald-300",
  Active: "bg-blue-500/20 text-blue-300",
  Confirmed: "bg-emerald-500/20 text-emerald-300",
  Sent: "bg-blue-500/20 text-blue-300",
  Pending: "bg-amber-500/20 text-amber-300",
};

export default function RolePhoneMockup({ activeRole }: RolePhoneMockupProps) {
  const theme = activeRole ? ROLE_THEMES[activeRole] : null;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 640 }}>
      {/* Ambient glow behind phone */}
      <AnimatePresence mode="wait">
        {theme && (
          <motion.div
            key={activeRole + "-glow"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-[-40px] rounded-[4rem] blur-3xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${theme.glowColor}, transparent 70%)` }}
          />
        )}
      </AnimatePresence>

      {/* Screen content layer — positioned to fit inside the phone image's screen area */}
      {/* These insets are tuned to the uploaded mockup's visible screen opening */}
      <div
        className="absolute overflow-hidden bg-[hsl(225,20%,6%)]"
        style={{
          top: "3.5%",
          left: "6.5%",
          right: "6.5%",
          bottom: "3.5%",
          borderRadius: "2rem",
        }}
      >
        <AnimatePresence mode="wait">
          {!theme ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles size={22} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground/70">Select a role to preview</p>
              <p className="text-xs text-muted-foreground mt-1">Tap a card to see it in action</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className={`pt-8 pb-3.5 px-4 ${theme.accentBg}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
                    <theme.Icon size={17} className={theme.accent} />
                  </div>
                  <div>
                    <p className={`text-[13px] font-semibold ${theme.accent}`}>{theme.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{theme.tagline}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-2.5 mt-3">
                  {theme.stats.map((s) => (
                    <div key={s.label} className={`flex-1 rounded-lg border ${theme.accentBorder} bg-background/40 backdrop-blur px-3 py-2`}>
                      <p className={`text-base font-bold ${theme.accent}`}>{s.value}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="flex-1 px-3.5 pt-3 pb-3 space-y-2 overflow-hidden">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Recent Activity</p>
                {theme.tasks.map((task, i) => (
                  <motion.div
                    key={task.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.08, duration: 0.3 }}
                    className={`flex items-start gap-2 rounded-xl border ${theme.accentBorder} bg-card/80 p-2.5`}
                  >
                    <div className={`mt-0.5 w-7 h-7 rounded-lg ${theme.accentBg} flex items-center justify-center shrink-0`}>
                      <task.icon size={13} className={theme.accent} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground leading-tight truncate">{task.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{task.detail}</p>
                    </div>
                    <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[task.status] || "bg-muted text-muted-foreground"}`}>
                      {task.status}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className={`px-4 py-2.5 border-t ${theme.accentBorder} bg-card/50 backdrop-blur flex items-center justify-center gap-1.5`}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.glowColor.replace("0.25", "1") }} />
                <p className={`text-[9px] font-medium ${theme.accent}`}>Actively working</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phone frame image — sits on top as the foreground overlay */}
      <img
        src={phoneFrame}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))" }}
        draggable={false}
      />
    </div>
  );
}
