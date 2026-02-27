import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData } from "@/hooks/useWorkspaceData";
import { useCustomerSupportData } from "@/hooks/useCustomerSupportData";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, Clock, AlertCircle,
  FileText, MessageSquare, PenLine, Eye, ThumbsUp, Bell, Send, Calendar,
  AlertTriangle,
} from "lucide-react";

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

  const approved = drafts.filter(d => d.status === "approved").length;
  const pending = drafts.filter(d => d.status === "pending" || d.status === "draft").length;
  const scheduled = drafts.filter(d => d.status === "scheduled").length;
  const connectedPlatforms = connections.filter(c => c.connected);
  const nextScheduled = drafts.find(d => d.status === "scheduled" && d.scheduled_date);

  const hasSocial = profile?.unlocked_roles.includes("social-media-manager");
  const hasSupport = profile?.unlocked_roles.includes("customer-support");
  const hasEmail = profile?.unlocked_roles.includes("email-marketer");

  // Support stats
  const openTickets = supportTickets.filter(t => t.status === "new" || t.status === "drafting").length;
  const pendingDrafts = supportDrafts.filter(d => d.status === "draft" || d.status === "edited").length;
  const escalatedTickets = supportTickets.filter(t => t.status === "escalated").length;
  const resolvedTickets = supportTickets.filter(t => t.status === "resolved").length;
  const connectedChannels = supportConnections.filter((c: any) => c.connected);

  // Email stats
  const emailDraftsPending = emailDrafts.filter(d => d.status === "draft" || d.status === "pending").length;
  const emailScheduled = emailDrafts.filter(d => d.status === "scheduled").length;
  const emailSent = emailDrafts.filter(d => d.status === "sent").length;
  const emailSenders = emailConnections.filter((c: any) => c.connected);
  const nextEmailScheduled = emailDrafts.find(d => d.status === "scheduled" && d.scheduled_date);

  // Merge activities from all roles
  const allActivities = [...activities, ...supportActivities, ...emailActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

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
                  {profile?.active_package ? `${profile.active_package} plan` : ""} · {connectedPlatforms.length + connectedChannels.length + emailSenders.length} connections
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {hasSocial && <Link to="/ai-employees/social-media-manager" className="btn-outline-glow text-sm">Open Social Manager</Link>}
                {hasSupport && <Link to="/ai-employees/customer-support" className="btn-outline-glow text-sm">Open Support Manager</Link>}
                {hasEmail && <Link to="/ai-employees/email-marketer" className="btn-outline-glow text-sm">Open Email Marketer</Link>}
              </div>
            </div>
          </motion.div>

          {/* Social Media Manager Stats */}
          {hasSocial && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Share2 size={18} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Social Media Manager</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Active</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Total Drafts", value: String(drafts.length), icon: PenLine, color: "text-primary" },
                  { label: "Pending Review", value: String(pending), icon: Eye, color: "text-yellow-400" },
                  { label: "Approved", value: String(approved), icon: ThumbsUp, color: "text-emerald-400" },
                  { label: "Scheduled", value: String(scheduled), icon: Calendar, color: "text-primary" },
                  { label: "Platforms", value: String(connectedPlatforms.length), icon: Share2, color: "text-primary" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Support Stats */}
          {hasSupport && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Headphones size={18} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Customer Support</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Active</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Open Tickets", value: String(openTickets), icon: MessageSquare, color: "text-primary" },
                  { label: "Drafts Pending", value: String(pendingDrafts), icon: PenLine, color: "text-yellow-400" },
                  { label: "Escalated", value: String(escalatedTickets), icon: AlertTriangle, color: "text-orange-400" },
                  { label: "Resolved", value: String(resolvedTickets), icon: Check, color: "text-emerald-400" },
                  { label: "Channels", value: String(connectedChannels.length), icon: Headphones, color: "text-primary" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Marketer Stats */}
          {hasEmail && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={18} className="text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">Email Marketer</h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Active</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: "Campaigns", value: String(emailCampaigns.length), icon: FileText, color: "text-primary" },
                  { label: "Drafts Pending", value: String(emailDraftsPending), icon: PenLine, color: "text-yellow-400" },
                  { label: "Scheduled", value: String(emailScheduled), icon: Calendar, color: "text-primary" },
                  { label: "Sent", value: String(emailSent), icon: Send, color: "text-emerald-400" },
                  { label: "Senders", value: String(emailSenders.length), icon: Mail, color: "text-primary" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-center justify-between"><s.icon size={16} className={s.color} /><span className="font-display text-2xl font-bold text-foreground">{s.value}</span></div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Platforms */}
          {(connectedPlatforms.length > 0 || connectedChannels.length > 0 || emailSenders.length > 0) && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Connected Platforms & Channels</h3>
              <div className="flex flex-wrap gap-3">
                {[...connectedPlatforms, ...connectedChannels, ...emailSenders].map((c: any) => (
                  <div key={c.id} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-primary">{c.platform}</span>
                    <span className="text-xs text-muted-foreground">{c.account_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Scheduled */}
          {nextScheduled && (
            <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-display text-sm font-semibold text-foreground">Next Scheduled Post</h3>
              <p className="text-sm text-foreground">{nextScheduled.idea_title}</p>
              <p className="text-xs text-muted-foreground">{nextScheduled.platform} · {new Date(nextScheduled.scheduled_date!).toLocaleDateString()}</p>
            </div>
          )}

          {nextEmailScheduled && (
            <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="mb-2 font-display text-sm font-semibold text-foreground">Next Scheduled Email</h3>
              <p className="text-sm text-foreground">{nextEmailScheduled.subject_line}</p>
              <p className="text-xs text-muted-foreground">{new Date(nextEmailScheduled.scheduled_date!).toLocaleDateString()}</p>
            </div>
          )}

          {/* Recent Drafts */}
          {drafts.length > 0 && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Social Drafts</h3>
              <div className="space-y-2">
                {drafts.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[300px]">{d.idea_title}</p>
                      <p className="text-xs text-muted-foreground">{d.platform}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                      d.status === "scheduled" ? "bg-primary/10 text-primary" :
                      d.status === "pending" || d.status === "draft" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-secondary text-muted-foreground border border-border"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Support Tickets */}
          {supportTickets.length > 0 && hasSupport && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Support Tickets</h3>
              <div className="space-y-2">
                {supportTickets.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[300px]">{t.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{t.channel} · {t.issue_type || "General"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      t.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" :
                      t.status === "escalated" ? "bg-orange-500/10 text-orange-400" :
                      "bg-primary/10 text-primary"
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Email Drafts */}
          {emailDrafts.length > 0 && hasEmail && (
            <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Recent Email Drafts</h3>
              <div className="space-y-2">
                {emailDrafts.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[300px]">{d.subject_line || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">{d.email_type}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                      d.status === "scheduled" ? "bg-primary/10 text-primary" :
                      d.status === "sent" ? "bg-muted text-muted-foreground" :
                      "bg-yellow-500/10 text-yellow-400"
                    }`}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {allActivities.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
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

          {/* Other roles locked preview */}
          <div className="mt-12">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Other AI Employees</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Share2, label: "Social Media Manager", slug: "social-media-manager" },
                { icon: Headphones, label: "Customer Support", slug: "customer-support" },
                { icon: Mail, label: "Email Marketer", slug: "email-marketer" },
                { icon: CalendarCheck, label: "Virtual Assistant", slug: "virtual-assistant" },
              ].filter((r) => !profile?.unlocked_roles.includes(r.slug)).map((r) => {
                return (
                  <Link key={r.slug} to={`/ai-employees/${r.slug}`}
                    className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30">
                    <r.icon size={20} className="text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">Locked — upgrade to access</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default DashboardPage;
