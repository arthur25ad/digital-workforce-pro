import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAppState } from "@/context/AppContext";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, Clock, AlertCircle,
  FileText, MessageSquare, PenLine, Eye, ThumbsUp, Bell, Send,
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
  const drafts = state.socialDrafts;
  const approved = drafts.filter(d => d.status === "approved").length;
  const pending = drafts.filter(d => d.status === "pending" || d.status === "draft").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Drafts", value: String(drafts.length), icon: PenLine, color: "text-primary" },
          { label: "Pending Review", value: String(pending), icon: Eye, color: "text-yellow-400" },
          { label: "Approved", value: String(approved), icon: ThumbsUp, color: "text-emerald-400" },
          { label: "Ideas Generated", value: String(state.postIdeas.length), icon: Share2, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {drafts.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Drafts</h3>
          <div className="space-y-2">
            {drafts.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div><p className="text-sm font-medium text-foreground truncate max-w-[280px]">{d.content.slice(0, 60)}...</p><p className="text-xs text-muted-foreground">{d.platform} · {d.scheduledDate}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : d.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground border border-border"}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SupportPanel = () => {
  const { state } = useAppState();
  const tickets = state.supportTickets;
  const open = tickets.filter(t => t.status === "open").length;
  const replied = tickets.filter(t => t.status === "replied").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open Tickets", value: String(open), icon: MessageSquare, color: "text-primary" },
          { label: "Replied", value: String(replied), icon: Check, color: "text-emerald-400" },
          { label: "Escalated", value: String(tickets.filter(t => t.status === "escalated").length), icon: AlertCircle, color: "text-orange-400" },
          { label: "Knowledge Items", value: String(state.supportKnowledge.length), icon: FileText, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {tickets.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Tickets</h3>
          <div className="space-y-2">
            {tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div><p className="text-sm font-medium text-foreground">{t.subject}</p><p className="text-xs text-muted-foreground">{t.customer} · {t.time}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.status === "replied" ? "bg-emerald-500/10 text-emerald-400" : t.status === "escalated" ? "bg-orange-500/10 text-orange-400" : t.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>{t.status === "open" ? t.priority : t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EmailPanel = () => {
  const { state } = useAppState();
  const campaigns = state.emailCampaigns;
  const drafts = campaigns.filter(c => c.status === "draft").length;
  const scheduled = campaigns.filter(c => c.status === "scheduled" || c.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Campaigns", value: String(campaigns.length), icon: Mail, color: "text-primary" },
          { label: "Drafts", value: String(drafts), icon: PenLine, color: "text-yellow-400" },
          { label: "Scheduled / Approved", value: String(scheduled), icon: Send, color: "text-emerald-400" },
          { label: "Open Rate", value: "24%", icon: Eye, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {campaigns.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Campaigns</h3>
          <div className="space-y-2">
            {campaigns.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div><p className="text-sm font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.recipients}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "approved" || c.status === "scheduled" ? "bg-emerald-500/10 text-emerald-400" : c.status === "draft" ? "bg-secondary text-muted-foreground border border-border" : "bg-yellow-500/10 text-yellow-400"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AssistantPanel = () => {
  const { state } = useAppState();
  const tasks = state.tasks;
  const pending = tasks.filter(t => t.status === "pending").length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const needsReview = tasks.filter(t => t.needsReview && t.status !== "completed").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tasks Pending", value: String(pending), icon: FileText, color: "text-primary" },
          { label: "In Progress", value: String(tasks.filter(t => t.status === "in-progress").length), icon: Clock, color: "text-yellow-400" },
          { label: "Completed", value: String(completed), icon: Check, color: "text-emerald-400" },
          { label: "Needs Review", value: String(needsReview), icon: Bell, color: "text-orange-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {state.dailySummary && (
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Daily Summary</h3>
          <div className="text-sm text-muted-foreground whitespace-pre-line">{state.dailySummary}</div>
        </div>
      )}
      {tasks.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Tasks</h3>
          <div className="space-y-2">
            {tasks.filter(t => t.status !== "completed").slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div><p className="text-sm font-medium text-foreground">{t.title}</p><p className="text-xs text-muted-foreground">Due: {t.dueDate}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.status === "in-progress" ? "bg-primary/10 text-primary" : t.status === "on-hold" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground border border-border"}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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

          <div className="space-y-12">
            {roles.map((r) => {
              const Panel = panelMap[r];
              if (!Panel) return null;
              return (
                <motion.div key={r} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
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
