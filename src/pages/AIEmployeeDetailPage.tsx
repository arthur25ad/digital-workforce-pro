import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import {
  Share2, Headphones, Mail, CalendarCheck, Check, ArrowRight,
  Instagram, Facebook, Linkedin, Twitter, Music2, MailOpen, Slack,
  Calendar, FileText, HardDrive,
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
    icon: Share2,
    title: "Social Media Manager",
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
    icon: Headphones,
    title: "Customer Support",
    summary: "Handles common customer inquiries, drafts replies, organizes support communication, and keeps response times fast.",
    tasks: ["FAQ drafting & knowledge base building", "Reply assistance & template generation", "Inbox organization & prioritization", "Escalation tagging & routing", "Conversation summaries & reporting"],
    workflow: { input: "Customer inquiry via email, chat, or form", processing: "AI matches to FAQ, drafts personalized reply, tags priority", output: "Ready-to-send response, escalation alert if needed, conversation summary" },
  },
  "email-marketer": {
    icon: Mail,
    title: "Email Marketer",
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
    icon: CalendarCheck,
    title: "Virtual Assistant",
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

const ConnectButton = ({ name, note }: { name: string; note: string }) => {
  const [connected, setConnected] = useState(false);
  const Icon = platformIcon[name] || Mail;
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary p-4 transition-all duration-300 hover:border-primary/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      </div>
      <button
        onClick={() => setConnected(!connected)}
        className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
          connected
            ? "bg-primary/10 text-primary border border-primary/30"
            : "btn-glow"
        }`}
      >
        {connected ? (
          <span className="flex items-center gap-1"><Check size={14} /> Connected</span>
        ) : "Connect"}
      </button>
    </div>
  );
};

const AIEmployeeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const role = rolesData[slug || ""];

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
              <button onClick={() => navigate("/get-started")} className="btn-glow text-base">Activate This AI Employee</button>
              <Link to="/get-started" className="btn-outline-glow text-base">Build My Team</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tasks */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-8">What This AI Handles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {role.tasks.map((task, i) => (
              <motion.div
                key={task}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glow-border flex items-start gap-3 rounded-xl bg-card p-5"
              >
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
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-xl p-6 text-center"
              >
                <span className="mb-2 inline-block font-display text-xs font-semibold uppercase tracking-widest text-primary/60">
                  {step === "input" ? "Step 1 — Input" : step === "processing" ? "Step 2 — Processing" : "Step 3 — Output"}
                </span>
                <p className="mt-2 text-sm text-muted-foreground">{role.workflow[step]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Connections */}
      {role.platforms && (
        <section className="section-padding">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-2">{role.platformLabel}</h2>
            <p className="mb-8 text-sm text-muted-foreground">Connect your accounts to enable seamless integration.</p>
            <div className="space-y-3">
              {role.platforms.map((p) => (
                <ConnectButton key={p.name} name={p.name} note={p.note} />
              ))}
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
    </PageLayout>
  );
};

export default AIEmployeeDetailPage;
