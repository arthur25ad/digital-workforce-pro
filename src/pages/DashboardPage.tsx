import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, Lock,
  FileText, MessageSquare, PenLine, ThumbsUp, Bell, Send, Calendar,
  AlertTriangle, Inbox, ListChecks,
} from "lucide-react";

const allRoles = [
  { icon: Share2, label: "Social Media Manager", slug: "social-media-manager" },
  { icon: Headphones, label: "Customer Support", slug: "customer-support" },
  { icon: Mail, label: "Email Marketer", slug: "email-marketer" },
  { icon: CalendarCheck, label: "Virtual Assistant", slug: "virtual-assistant" },
];

const StatGrid = ({ stats }: { stats: { label: string; value: string; icon: any; color: string }[] }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    {stats.map((s) => (
      <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between">
          <s.icon size={16} className={s.color} />
          <span className="font-display text-2xl font-bold text-foreground">{s.value}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
      </div>
    ))}
  </div>
);

const RoleHeader = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={18} className="text-primary" />
    <h2 className="font-display text-lg font-semibold text-foreground">{label}</h2>
    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Active</span>
  </div>
);

const LockedRoleCard = ({ icon: Icon, label, slug }: { icon: any; label: string; slug: string }) => (
  <Link to={`/ai-employees/${slug}`} className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 group">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
        <Icon size={18} className="text-muted-foreground" />
      </div>
      <Lock size={14} className="text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-xs text-muted-foreground mt-1">Not included in your current package</p>
    <span className="mt-3 inline-block text-xs text-primary group-hover:underline">View Plans →</span>
  </Link>
);

const DashboardPage = () => {
  const { profile, workspace } = useAuth();
  const { drafts, connections, activities } = useWorkspaceData();
  const {
    tickets: supportTickets, drafts: supportDrafts, connections: supportConnections,
    activities: supportActivities,
  } = useCustomerSupportData();
  const {
    campaigns: emailCampaigns, drafts: emailDrafts, connections: emailConnections,
    activities: emailActivities,
  } = useEmailMarketingData();
  const {
    tasks: vaTasks, requests: vaRequests, connections: vaConnections,
    activities: vaActivities,
  } = useVirtualAssistantData();

  const hasSocial = profile?.unlocked_roles.includes("social-media-manager");
  const hasSupport = profile?.unlocked_roles.includes("customer-support");
  const hasEmail = profile?.unlocked_roles.includes("email-marketer");
  const hasVA = profile?.unlocked_roles.includes("virtual-assistant");

  const connectedPlatforms = connections.filter(c => c.connected);
  const connectedChannels = supportConnections.filter((c: any) => c.connected);
  const emailSenders = emailConnections.filter((c: any) => c.connected);
  const vaTools = vaConnections.filter((c: any) => c.connected);
  const allConnected = [...connectedPlatforms, ...connectedChannels, ...emailSenders, ...vaTools];

  const allActivities = [...activities, ...supportActivities, ...emailActivities, ...vaActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const lockedRoles = allRoles.filter(r => !profile?.unlocked_roles.includes(r.slug));

  return (
    <PageLayout>
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {workspace?.business_name ? `${workspace.business_name} Dashboard` : "Your Dashboard"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile?.active_package ? `${profile.active_package.charAt(0).toUpperCase() + profile.active_package.slice(1)} plan` : ""} · {allConnected.length} connection{allConnected.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {hasSocial && <Link to="/ai-employees/social-media-manager" className="btn-outline-glow text-sm">Open Social Manager</Link>}
                {hasSupport && <Link to="/ai-employees/customer-support" className="btn-outline-glow text-sm">Open Support Manager</Link>}
                {hasEmail && <Link to="/ai-employees/email-marketer" className="btn-outline-glow text-sm">Open Email Marketer</Link>}
                {hasVA && <Link to="/ai-employees/virtual-assistant" className="btn-outline-glow text-sm">Open Virtual Assistant</Link>}
              </div>
            </div>
          </motion.div>

          {hasSocial && (
            <div className="mb-8">
              <RoleHeader icon={Share2} label="Social Media Manager" />
              <StatGrid stats={[
                { label: "Total Drafts", value: String(drafts.length), icon: PenLine, color: "text-primary" },
                { label: "Pending Review", value: String(drafts.filter(d => d.status === "pending" || d.status === "draft").length), icon: ThumbsUp, color: "text-yellow-400" },
                { label: "Approved", value: String(drafts.filter(d => d.status === "approved").length), icon: Check, color: "text-emerald-400" },
                { label: "Scheduled", value: String(drafts.filter(d => d.status === "scheduled").length), icon: Calendar, color: "text-primary" },
                { label: "Platforms", value: String(connectedPlatforms.length), icon: Share2, color: "text-primary" },
              ]} />
            </div>
          )}

          {hasSupport && (
            <div className="mb-8">
              <RoleHeader icon={Headphones} label="Customer Support" />
              <StatGrid stats={[
                { label: "Open Tickets", value: String(supportTickets.filter(t => t.status === "new" || t.status === "drafting").length), icon: MessageSquare, color: "text-primary" },
                { label: "Drafts Pending", value: String(supportDrafts.filter(d => d.status === "draft" || d.status === "edited").length), icon: PenLine, color: "text-yellow-400" },
                { label: "Escalated", value: String(supportTickets.filter(t => t.status === "escalated").length), icon: AlertTriangle, color: "text-orange-400" },
                { label: "Resolved", value: String(supportTickets.filter(t => t.status === "resolved").length), icon: Check, color: "text-emerald-400" },
                { label: "Channels", value: String(connectedChannels.length), icon: Headphones, color: "text-primary" },
              ]} />
            </div>
          )}

          {hasEmail && (
            <div className="mb-8">
              <RoleHeader icon={Mail} label="Email Marketer" />
              <StatGrid stats={[
                { label: "Campaigns", value: String(emailCampaigns.length), icon: FileText, color: "text-primary" },
                { label: "Drafts Pending", value: String(emailDrafts.filter(d => d.status === "draft" || d.status === "pending").length), icon: PenLine, color: "text-yellow-400" },
                { label: "Scheduled", value: String(emailDrafts.filter(d => d.status === "scheduled").length), icon: Calendar, color: "text-primary" },
                { label: "Sent", value: String(emailDrafts.filter(d => d.status === "sent").length), icon: Send, color: "text-emerald-400" },
                { label: "Senders", value: String(emailSenders.length), icon: Mail, color: "text-primary" },
              ]} />
            </div>
          )}

          {hasVA && (
            <div className="mb-8">
              <RoleHeader icon={CalendarCheck} label="Virtual Assistant" />
              <StatGrid stats={[
                { label: "Open Requests", value: String(vaRequests.filter(r => r.status !== "completed").length), icon: Inbox, color: "text-primary" },
                { label: "Active Tasks", value: String(vaTasks.filter(t => ["new", "pending", "in_progress"].includes(t.status)).length), icon: ListChecks, color: "text-primary" },
                { label: "Awaiting Approval", value: String(vaTasks.filter(t => t.status === "awaiting_approval").length), icon: Bell, color: "text-yellow-400" },
                { label: "Completed", value: String(vaTasks.filter(t => t.status === "completed").length), icon: Check, color: "text-emerald-400" },
                { label: "Tools", value: String(vaTools.length), icon: CalendarCheck, color: "text-primary" },
              ]} />
            </div>
          )}

          {allConnected.length > 0 && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Connected Platforms & Channels</h3>
              <div className="flex flex-wrap gap-3">
                {allConnected.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-primary">{c.platform}</span>
                    {c.account_name && <span className="text-xs text-muted-foreground">{c.account_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {allActivities.length > 0 && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Activity</h3>
              <div className="space-y-2">
                {allActivities.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{a.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedRoles.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Available AI Employees</h2>
              <p className="text-sm text-muted-foreground mb-6">These roles are not included in your current package. Upgrade to unlock them.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {lockedRoles.map((r) => (
                  <LockedRoleCard key={r.slug} icon={r.icon} label={r.label} slug={r.slug} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
