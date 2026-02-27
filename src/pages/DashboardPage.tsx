import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAppState } from "@/context/AppContext";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, Clock, AlertCircle,
  FileText, MessageSquare, BarChart3, Calendar, Bell, Users, Inbox,
  Send, PenLine, Eye, ThumbsUp, ArrowRight,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  social: "Social Media Manager",
  support: "Customer Support",
  email: "Email Marketer",
  assistant: "Virtual Assistant",
};

const roleIcons: Record<string, any> = {
  social: Share2,
  support: Headphones,
  email: Mail,
  assistant: CalendarCheck,
};

const SocialPanel = () => {
  const { state } = useAppState();
  const socialConnections = state.connections.filter((c) =>
    ["Instagram", "Facebook", "LinkedIn", "X / Twitter", "TikTok"].includes(c.platform)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Scheduled Posts", value: "12", icon: Calendar, color: "text-primary" },
          { label: "Drafts", value: "4", icon: PenLine, color: "text-yellow-400" },
          { label: "Approval Needed", value: "2", icon: Eye, color: "text-orange-400" },
          { label: "Published", value: "28", icon: ThumbsUp, color: "text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between">
              <stat.icon size={18} className={stat.color} />
              <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Content Queue</h3>
          <div className="space-y-3">
            {[
              { title: "Weekly tip carousel", platform: "Instagram", time: "Today 2PM", status: "Scheduled" },
              { title: "Product announcement", platform: "LinkedIn", time: "Tomorrow 10AM", status: "Pending Approval" },
              { title: "Customer spotlight", platform: "Facebook", time: "Wed 9AM", status: "Draft" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.platform} · {item.time}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                  item.status === "Scheduled" ? "bg-primary/10 text-primary" :
                  item.status === "Draft" ? "bg-secondary text-muted-foreground border border-border" :
                  "bg-orange-500/10 text-orange-400"
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Connected Platforms</h3>
          {socialConnections.length > 0 ? (
            <div className="space-y-2">
              {socialConnections.map((c) => (
                <div key={c.platform} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-foreground">{c.platform}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.accountName}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Share2 size={24} className="mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No platforms connected yet</p>
              <Link to="/ai-employees/social-media-manager" className="mt-2 text-xs text-primary hover:underline">Connect now →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupportPanel = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Open Tickets", value: "7", icon: Inbox, color: "text-primary" },
        { label: "Suggested Replies", value: "5", icon: MessageSquare, color: "text-yellow-400" },
        { label: "Resolved Today", value: "12", icon: Check, color: "text-emerald-400" },
        { label: "Escalations", value: "1", icon: AlertCircle, color: "text-red-400" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <stat.icon size={18} className={stat.color} />
            <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Support Queue</h3>
      <div className="space-y-3">
        {[
          { customer: "Sarah M.", subject: "Booking confirmation issue", time: "5 min ago", priority: "High" },
          { customer: "David K.", subject: "Pricing question", time: "12 min ago", priority: "Medium" },
          { customer: "Lisa T.", subject: "Service area inquiry", time: "28 min ago", priority: "Low" },
          { customer: "Mark R.", subject: "Rescheduling request", time: "1 hr ago", priority: "Medium" },
        ].map((ticket) => (
          <div key={ticket.customer} className="flex items-center justify-between rounded-lg bg-secondary p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
              <p className="text-xs text-muted-foreground">{ticket.customer} · {ticket.time}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              ticket.priority === "High" ? "bg-red-500/10 text-red-400" :
              ticket.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-secondary text-muted-foreground border border-border"
            }`}>{ticket.priority}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const EmailPanel = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Campaign Drafts", value: "3", icon: FileText, color: "text-primary" },
        { label: "Scheduled", value: "5", icon: Send, color: "text-emerald-400" },
        { label: "Open Rate", value: "24%", icon: BarChart3, color: "text-yellow-400" },
        { label: "Follow-Up Queue", value: "8", icon: Clock, color: "text-orange-400" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <stat.icon size={18} className={stat.color} />
            <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Campaign Drafts</h3>
      <div className="space-y-3">
        {[
          { name: "Welcome Series — Email 1", recipients: "New subscribers", status: "Ready" },
          { name: "Monthly Newsletter — March", recipients: "All contacts", status: "Draft" },
          { name: "Re-engagement Campaign", recipients: "Inactive 30d+", status: "In Review" },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-lg bg-secondary p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.recipients}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              c.status === "Ready" ? "bg-emerald-500/10 text-emerald-400" :
              c.status === "Draft" ? "bg-secondary text-muted-foreground border border-border" :
              "bg-primary/10 text-primary"
            }`}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AssistantPanel = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Tasks Today", value: "9", icon: FileText, color: "text-primary" },
        { label: "Reminders", value: "4", icon: Bell, color: "text-yellow-400" },
        { label: "Meetings", value: "3", icon: Users, color: "text-emerald-400" },
        { label: "Completed", value: "14", icon: Check, color: "text-muted-foreground" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <stat.icon size={18} className={stat.color} />
            <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Today's Tasks</h3>
        <div className="space-y-2">
          {["Follow up with vendor", "Prepare meeting agenda", "Update project timeline", "Send weekly report"].map((t) => (
            <div key={t} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <div className="h-4 w-4 rounded border border-border" />
              <span className="text-sm text-foreground">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Daily Summary</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>• 3 meetings scheduled for today</p>
          <p>• 2 follow-ups pending from yesterday</p>
          <p>• Weekly report due by 5 PM</p>
          <p>• New client onboarding at 2 PM</p>
        </div>
      </div>
    </div>
  </div>
);

const panelMap: Record<string, React.FC> = {
  social: SocialPanel,
  support: SupportPanel,
  email: EmailPanel,
  assistant: AssistantPanel,
};

const DashboardPage = () => {
  const { state } = useAppState();
  const roles = state.selectedRoles.length > 0 ? state.selectedRoles : ["social", "support", "email", "assistant"];

  return (
    <PageLayout>
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {state.preferences.businessName ? `${state.preferences.businessName} Dashboard` : "Dashboard"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {roles.length} AI employee{roles.length !== 1 ? "s" : ""} active · {state.connections.length} tools connected
                </p>
              </div>
              <Link to="/get-started" className="btn-outline-glow text-sm">Edit Setup</Link>
            </div>
          </motion.div>

          {/* Active roles tabs */}
          <div className="mb-8 flex flex-wrap gap-3">
            {roles.map((r) => {
              const Icon = roleIcons[r] || Share2;
              return (
                <div key={r} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
                  <Icon size={14} className="text-primary" />
                  <span className="text-xs font-medium text-primary">{roleLabels[r] || r}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              );
            })}
          </div>

          {/* Panels */}
          <div className="space-y-12">
            {roles.map((r) => {
              const Panel = panelMap[r];
              if (!Panel) return null;
              return (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    {(() => { const Icon = roleIcons[r] || Share2; return <Icon size={18} className="text-primary" />; })()}
                    <h2 className="font-display text-lg font-semibold text-foreground">{roleLabels[r]}</h2>
                  </div>
                  <Panel />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
