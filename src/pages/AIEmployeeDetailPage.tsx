import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { useAppState } from "@/context/AppContext";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, ArrowRight,
  Instagram, Facebook, Linkedin, Twitter, Music2, MailOpen, Slack,
  Calendar, FileText, HardDrive, ThumbsUp, X, PenLine, BarChart3,
  Clock, Eye, Loader2,
} from "lucide-react";

const platformIcon: Record<string, any> = {
  Instagram, Facebook, LinkedIn: Linkedin, "X / Twitter": Twitter, TikTok: Music2,
  Gmail: MailOpen, Outlook: MailOpen, Mailchimp: Mail, Klaviyo: Mail, HubSpot: Mail,
  "Google Calendar": Calendar, "Outlook Calendar": Calendar, Notion: FileText, Slack, "Google Drive": HardDrive,
};

interface RoleData {
  icon: any;
  title: string;
  summary: string;
  tasks: string[];
  workflow: { input: string; processing: string; output: string };
  platforms?: { name: string; note: string }[];
  platformLabel?: string;
}

const rolesData: Record<string, RoleData> = {
  "social-media-manager": {
    icon: Share2, title: "Social Media Manager",
    summary: "Plans content, drafts captions, organizes posting ideas, and supports day-to-day social content workflows.",
    tasks: ["Content planning & calendar management", "Caption drafting for all platforms", "Post idea generation & brainstorming", "Campaign support & coordination", "Basic content calendar assistance", "Social workflow organization"],
    workflow: { input: "Business goals, brand voice, target audience info", processing: "AI analyzes trends, drafts captions, organizes posting schedule", output: "Ready-to-review social posts, content calendar, campaign briefs" },
    platformLabel: "Connect Your Platforms",
    platforms: [
      { name: "Instagram", note: "Post scheduling & caption drafting" },
      { name: "Facebook", note: "Page management & content support" },
      { name: "LinkedIn", note: "Professional content & engagement" },
      { name: "X / Twitter", note: "Short-form content & threads" },
      { name: "TikTok", note: "Video content planning & captions" },
    ],
  },
  "customer-support": {
    icon: Headphones, title: "Customer Support",
    summary: "Handles common customer inquiries, drafts replies, organizes support communication, and keeps response times fast.",
    tasks: ["FAQ drafting & knowledge base building", "Reply assistance & template generation", "Inbox organization & prioritization", "Escalation tagging & routing", "Conversation summaries & reporting"],
    workflow: { input: "Customer inquiry via email, chat, or form", processing: "AI matches to FAQ, drafts personalized reply, tags priority", output: "Ready-to-send response, escalation alert if needed, conversation summary" },
  },
  "email-marketer": {
    icon: Mail, title: "Email Marketer",
    summary: "Builds email campaigns, follow-up sequences, promotions, retention messaging, and customer re-engagement flows.",
    tasks: ["Campaign drafting & copywriting", "Follow-up sequence building", "Promotional email creation", "Re-engagement messaging", "Newsletter support & scheduling"],
    workflow: { input: "Campaign goals, audience segment, brand guidelines", processing: "AI drafts subject lines, body copy, and sequences", output: "Complete email campaigns ready for review and scheduling" },
    platformLabel: "Connect Email Tools",
    platforms: [
      { name: "Gmail", note: "Direct email sending & tracking" },
      { name: "Outlook", note: "Email integration & calendar sync" },
      { name: "Mailchimp", note: "Campaign management & analytics" },
      { name: "Klaviyo", note: "E-commerce email automation" },
      { name: "HubSpot", note: "CRM-integrated email marketing" },
    ],
  },
  "virtual-assistant": {
    icon: CalendarCheck, title: "Virtual Assistant",
    summary: "Supports scheduling, reminders, task organization, follow-ups, and recurring admin coordination.",
    tasks: ["Scheduling & calendar management", "Reminder automation", "Task tracking & organization", "Meeting prep & agenda creation", "Follow-up coordination"],
    workflow: { input: "Tasks, deadlines, meeting requests, follow-up needs", processing: "AI organizes schedule, sets reminders, prepares agendas", output: "Organized calendar, task lists, meeting briefs, follow-up queue" },
    platformLabel: "Connect Productivity Tools",
    platforms: [
      { name: "Google Calendar", note: "Calendar sync & scheduling" },
      { name: "Outlook Calendar", note: "Microsoft calendar integration" },
      { name: "Notion", note: "Task & knowledge management" },
      { name: "Slack", note: "Team communication & updates" },
      { name: "Google Drive", note: "Document storage & sharing" },
    ],
  },
};

// Social Media Manager interactive demo component
const SocialMediaDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateDraftStatus, setSocialStrategy } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ businessName: state.preferences.businessName || "", brandVoice: state.preferences.brandTone || "Professional", audience: "Small business owners", goals: "Increase engagement" });

  const socialPlatforms = ["Instagram", "Facebook", "LinkedIn", "TikTok", "X / Twitter"];
  const connectedSocial = socialPlatforms.filter((p) => isConnected(p));

  const tabs = ["Foundation", "Platforms", "Strategy", "Approval", "Performance"];

  return (
    <>
      {/* Tab nav */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setDemoStep(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              demoStep === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Foundation */}
      {demoStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Set the Foundation</h3>
          {[
            { key: "businessName", label: "Business Name" },
            { key: "brandVoice", label: "Brand Voice" },
            { key: "audience", label: "Target Audience" },
            { key: "goals", label: "Goals" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={foundation[key as keyof typeof foundation]} onChange={(e) => setFoundation({ ...foundation, [key]: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <button onClick={() => setDemoStep(1)} className="btn-glow text-sm mt-4">Save & Continue</button>
        </motion.div>
      )}

      {/* Platforms */}
      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Connect Your Social Platforms</h3>
          <div className="space-y-3">
            {socialPlatforms.map((p) => {
              const connected = isConnected(p);
              const Icon = platformIcon[p] || Share2;
              return (
                <div key={p} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p}</p>
                      <p className="text-xs text-muted-foreground">{connected ? "Connected" : "Not connected"}</p>
                    </div>
                  </div>
                  {connected ? (
                    <button onClick={() => removeConnection(p)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                  ) : (
                    <button onClick={() => setConnectModal(p)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(2)} className="btn-glow text-sm">Continue</button>
          </div>
        </motion.div>
      )}

      {/* Strategy */}
      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Set Strategy</h3>
          {[
            { key: "frequency", label: "Posting Frequency", placeholder: "3x per week" },
            { key: "themes", label: "Content Themes", placeholder: "Tips, Updates, Insights" },
            { key: "hashtags", label: "Hashtags", placeholder: "#AI #SmallBusiness" },
            { key: "captionTone", label: "Caption Tone", placeholder: "Professional yet approachable" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={state.socialStrategy[key as keyof typeof state.socialStrategy] as string}
                onChange={(e) => setSocialStrategy({ [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Require Approval Before Posting</p>
              <p className="text-xs text-muted-foreground">Review all drafts before they go live</p>
            </div>
            <button
              onClick={() => setSocialStrategy({ approvalRequired: !state.socialStrategy.approvalRequired })}
              className={`relative h-6 w-11 rounded-full transition-colors ${state.socialStrategy.approvalRequired ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${state.socialStrategy.approvalRequired ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(1)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(3)} className="btn-glow text-sm">Continue</button>
          </div>
        </motion.div>
      )}

      {/* Approval */}
      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Approval Flow</h3>
          <p className="text-sm text-muted-foreground">Review AI-generated drafts before they go live.</p>
          <div className="space-y-3">
            {state.socialDrafts.map((draft) => (
              <div key={draft.id} className={`rounded-xl border p-4 transition-all ${
                draft.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
                draft.status === "rejected" ? "border-red-500/30 bg-red-500/5" :
                "border-border/50 bg-card"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">{draft.platform}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    draft.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    draft.status === "rejected" ? "bg-red-500/10 text-red-400" :
                    draft.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-secondary text-muted-foreground"
                  }`}>{draft.status}</span>
                </div>
                <p className="text-sm text-foreground mb-2">{draft.content}</p>
                <p className="text-xs text-muted-foreground mb-3">{draft.scheduledDate}</p>
                {(draft.status === "draft" || draft.status === "pending") && (
                  <div className="flex gap-2">
                    <button onClick={() => updateDraftStatus(draft.id, "approved")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <ThumbsUp size={12} /> Approve
                    </button>
                    <button onClick={() => updateDraftStatus(draft.id, "rejected")}
                      className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                      <X size={12} /> Reject
                    </button>
                    <button onClick={() => updateDraftStatus(draft.id, "pending")}
                      className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <PenLine size={12} /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(4)} className="btn-glow text-sm">View Performance</button>
          </div>
        </motion.div>
      )}

      {/* Performance */}
      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Performance Overview</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Engagement Rate", value: "4.2%", icon: BarChart3, trend: "+0.8%" },
              { label: "Scheduled Posts", value: String(state.socialDrafts.filter((d) => d.status !== "rejected").length), icon: Calendar, trend: "" },
              { label: "Approved Drafts", value: String(state.socialDrafts.filter((d) => d.status === "approved").length), icon: ThumbsUp, trend: "" },
              { label: "Pending Review", value: String(state.socialDrafts.filter((d) => d.status === "pending" || d.status === "draft").length), icon: Eye, trend: "" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <stat.icon size={18} className="text-primary mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.trend && <p className="text-xs text-emerald-400 mt-1">{stat.trend}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Connected Platforms ({connectedSocial.length})</h4>
            {connectedSocial.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {connectedSocial.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {p}
                  </span>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Connect platforms to see performance data.</p>}
          </div>
          <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back to Foundation</button>
        </motion.div>
      )}

      <ConnectPlatformModal
        open={!!connectModal}
        onClose={() => setConnectModal(null)}
        platformName={connectModal || ""}
        onConnect={(accountName) => {
          if (connectModal) addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() });
          setConnectModal(null);
        }}
      />
    </>
  );
};

const AIEmployeeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isConnected, addConnection, removeConnection, getConnection } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const role = rolesData[slug || ""];
  const isSocial = slug === "social-media-manager";

  if (!role) return (
    <PageLayout>
      <div className="section-padding text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Role not found</h1>
        <Link to="/ai-employees" className="mt-4 inline-block text-primary">← Back to AI Employees</Link>
      </div>
    </PageLayout>
  );

  const Icon = role.icon;

  return (
    <PageLayout>
      {/* Hero */}
      <section className="section-padding blue-ambient">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={32} />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{role.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{role.summary}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate(`/get-started?role=${slug === "social-media-manager" ? "social" : slug === "customer-support" ? "support" : slug === "email-marketer" ? "email" : "assistant"}`)} className="btn-glow text-base">Activate This AI Employee</button>
              <Link to="/get-started" className="btn-outline-glow text-base">Build My Team</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Media Manager gets the full interactive demo */}
      {isSocial && (
        <section className="section-padding">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-8">Interactive Demo</h2>
            <SocialMediaDemo />
          </div>
        </section>
      )}

      {/* Tasks */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-8">What This AI Handles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {role.tasks.map((task, i) => (
              <motion.div key={task} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glow-border flex items-start gap-3 rounded-xl bg-card p-5">
                <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{task}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="section-padding blue-ambient-bottom">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-8">Example Workflow</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(["input", "processing", "output"] as const).map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-glass rounded-xl p-6 text-center">
                <span className="mb-2 inline-block font-display text-xs font-semibold uppercase tracking-widest text-primary/60">
                  {step === "input" ? "Step 1 — Input" : step === "processing" ? "Step 2 — Processing" : "Step 3 — Output"}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">{role.workflow[step]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Connections (non-social roles) */}
      {!isSocial && role.platforms && (
        <section className="section-padding">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-2">{role.platformLabel}</h2>
            <p className="mb-8 text-sm text-muted-foreground">Connect your accounts to enable seamless integration.</p>
            <div className="space-y-3">
              {role.platforms.map((p) => {
                const connected = isConnected(p.name);
                const conn = getConnection(p.name);
                const PIcon = platformIcon[p.name] || Mail;
                return (
                  <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-300 ${
                    connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-secondary hover:border-primary/30"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
                        <PIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{connected ? conn?.accountName : p.note}</p>
                      </div>
                    </div>
                    {connected ? (
                      <button onClick={() => removeConnection(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                    ) : (
                      <button onClick={() => setConnectModal(p.name)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="section-padding blue-ambient text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Ready to Activate?</h2>
          <p className="mt-4 text-muted-foreground">Add this AI employee to your team and start getting work done 24/7.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate("/get-started")} className="btn-glow text-base">Activate This Role</button>
            <Link to="/pricing" className="btn-outline-glow text-base">View Pricing</Link>
          </div>
        </div>
      </section>

      <ConnectPlatformModal
        open={!!connectModal}
        onClose={() => setConnectModal(null)}
        platformName={connectModal || ""}
        onConnect={(accountName) => {
          if (connectModal) addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() });
          setConnectModal(null);
        }}
      />
    </PageLayout>
  );
};

export default AIEmployeeDetailPage;
