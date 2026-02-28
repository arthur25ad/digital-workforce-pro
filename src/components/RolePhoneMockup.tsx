import { motion, AnimatePresence } from "framer-motion";
import type { RoleSlug } from "@/lib/packages";
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
    glowFrom: string;
    glowTo: string;
    label: string;
    tagline: string;
    Icon: any;
    tasks: { icon: any; label: string; detail: string; status: string }[];
    stats: { label: string; value: string }[];
  }
> = {
  "social-media-manager": {
    accent: "text-blue-400",
    accentBg: "bg-blue-500/12",
    accentBorder: "border-blue-500/20",
    glowFrom: "from-blue-500/30",
    glowTo: "to-cyan-500/10",
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
    accentBg: "bg-violet-500/12",
    accentBorder: "border-violet-500/20",
    glowFrom: "from-violet-500/30",
    glowTo: "to-indigo-500/10",
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
    accentBg: "bg-emerald-500/12",
    accentBorder: "border-emerald-500/20",
    glowFrom: "from-emerald-500/30",
    glowTo: "to-teal-500/10",
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
    accentBg: "bg-amber-500/12",
    accentBorder: "border-amber-500/20",
    glowFrom: "from-amber-500/30",
    glowTo: "to-yellow-500/10",
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
    <div className="relative flex items-center justify-center">
      {/* Ambient glow */}
      <AnimatePresence mode="wait">
        {theme && (
          <motion.div
            key={activeRole + "-glow"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
            className={`absolute -inset-12 rounded-[4rem] bg-gradient-to-b ${theme.glowFrom} ${theme.glowTo} blur-3xl pointer-events-none`}
          />
        )}
      </AnimatePresence>

      {/* Phone device */}
      <div
        className="relative"
        style={{
          width: 280,
          height: 580,
          /* Outer device shadow for realism */
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5)) drop-shadow(0 8px 20px rgba(0,0,0,0.3))",
        }}
      >
        {/* Device body — titanium-style frame */}
        <div
          className="absolute inset-0 rounded-[3rem]"
          style={{
            background: "linear-gradient(145deg, hsl(225 10% 22%), hsl(225 10% 12%) 50%, hsl(225 10% 16%))",
            padding: 4,
          }}
        >
          {/* Inner bezel */}
          <div
            className="w-full h-full rounded-[2.75rem]"
            style={{
              background: "linear-gradient(180deg, hsl(225 12% 8%), hsl(225 15% 5%))",
              padding: 3,
            }}
          >
            {/* Screen */}
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-[hsl(230,20%,5%)] relative">
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-[90px] h-[26px] bg-black rounded-full flex items-center justify-center gap-2">
                <div className="w-[6px] h-[6px] rounded-full bg-[hsl(225,10%,15%)] ring-1 ring-[hsl(225,10%,20%)]" />
              </div>

              {/* Screen content */}
              <AnimatePresence mode="wait">
                {!theme ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center px-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mb-4">
                      <Sparkles size={24} className="text-primary/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground/60">Select a role</p>
                    <p className="text-[11px] text-muted-foreground mt-1">See it in action</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeRole}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-full flex flex-col"
                  >
                    {/* Status bar */}
                    <div className="pt-10 pb-0 px-5 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-[3px] rounded-full ${i <= 3 ? 'bg-foreground/60' : 'bg-foreground/20'}`} style={{ height: 4 + i * 2 }} />
                          ))}
                        </div>
                        <div className="ml-1 w-6 h-3 rounded-sm border border-foreground/40 relative">
                          <div className="absolute inset-0.5 rounded-[1px] bg-foreground/50 w-[60%]" />
                        </div>
                      </div>
                    </div>

                    {/* App header */}
                    <div className={`px-4 pt-3 pb-3`}>
                      <div className="flex items-center gap-2.5">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className={`w-10 h-10 rounded-[14px] ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}
                        >
                          <theme.Icon size={18} className={theme.accent} />
                        </motion.div>
                        <div>
                          <p className={`text-[13px] font-semibold ${theme.accent}`}>{theme.label}</p>
                          <p className="text-[10px] text-muted-foreground/80 leading-tight">{theme.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="px-4 pb-3 flex gap-2">
                      {theme.stats.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                          className={`flex-1 rounded-xl border ${theme.accentBorder} bg-card/60 backdrop-blur-sm px-3 py-2.5`}
                        >
                          <p className={`text-[15px] font-bold ${theme.accent} leading-none`}>{s.value}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">{s.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-border/30" />

                    {/* Activity feed */}
                    <div className="flex-1 px-3.5 pt-2.5 pb-2 space-y-1.5 overflow-hidden">
                      <p className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-[0.08em] px-0.5 mb-1">Recent Activity</p>
                      {theme.tasks.map((task, i) => (
                        <motion.div
                          key={task.label}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.07, duration: 0.35, ease: "easeOut" }}
                          className={`flex items-center gap-2 rounded-xl border ${theme.accentBorder} bg-card/50 p-2.5`}
                        >
                          <div className={`w-7 h-7 rounded-lg ${theme.accentBg} flex items-center justify-center shrink-0`}>
                            <task.icon size={13} className={theme.accent} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-foreground/90 leading-tight truncate">{task.label}</p>
                            <p className="text-[9px] text-muted-foreground/70 truncate">{task.detail}</p>
                          </div>
                          <span className={`text-[7px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide ${STATUS_COLORS[task.status] || "bg-muted text-muted-foreground"}`}>
                            {task.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom bar */}
                    <div className={`px-4 py-2.5 border-t border-border/20 bg-card/30 backdrop-blur-sm flex items-center justify-center gap-1.5`}>
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`w-1.5 h-1.5 rounded-full`}
                        style={{ backgroundColor: "currentColor" }}
                      />
                      <p className={`text-[9px] font-medium ${theme.accent}`}>Actively working</p>
                    </div>

                    {/* Home indicator */}
                    <div className="pb-2 flex justify-center">
                      <div className="w-[100px] h-[4px] rounded-full bg-foreground/20" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Side buttons — power button */}
        <div
          className="absolute right-[-2px] top-[120px] w-[3px] h-[40px] rounded-r-sm"
          style={{ background: "linear-gradient(180deg, hsl(225 10% 25%), hsl(225 10% 15%))" }}
        />
        {/* Volume buttons */}
        <div
          className="absolute left-[-2px] top-[100px] w-[3px] h-[24px] rounded-l-sm"
          style={{ background: "linear-gradient(180deg, hsl(225 10% 25%), hsl(225 10% 15%))" }}
        />
        <div
          className="absolute left-[-2px] top-[135px] w-[3px] h-[24px] rounded-l-sm"
          style={{ background: "linear-gradient(180deg, hsl(225 10% 25%), hsl(225 10% 15%))" }}
        />
      </div>
    </div>
  );
}
