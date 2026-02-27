import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SocialMediaDemo from "@/components/demos/SocialMediaDemo";
import CustomerSupportDemo from "@/components/demos/CustomerSupportDemo";
import EmailMarketerDemo from "@/components/demos/EmailMarketerDemo";
import VirtualAssistantDemo from "@/components/demos/VirtualAssistantDemo";
import { Share2, Headphones, Mail, CalendarCheck, Check } from "lucide-react";

interface RoleConfig {
  icon: any;
  title: string;
  roleKey: string;
  summary: string;
  valuePoints: string[];
  capabilities: string[];
  Demo: React.FC;
}

const roles: Record<string, RoleConfig> = {
  "social-media-manager": {
    icon: Share2, title: "Your AI Social Media Manager", roleKey: "social",
    summary: "From planning to publishing, this AI role helps keep your brand active with a structured workflow built around strategy, approvals, and ongoing performance.",
    valuePoints: [
      "Understands your audience and brand context",
      "Creates relevant, ready-to-review content",
      "Supports scheduling and publishing workflows",
      "Tracks what performs and improves over time",
    ],
    capabilities: ["Build a content plan", "Draft captions", "Suggest content ideas", "Prepare launch messaging", "Summarize wins and case studies", "Send weekly recaps", "Keep a content rhythm going"],
    Demo: SocialMediaDemo,
  },
  "customer-support": {
    icon: Headphones, title: "Your AI Customer Support Manager", roleKey: "support",
    summary: "From first contact to resolution, this AI role helps your business respond faster, stay organized, and keep support quality consistent.",
    valuePoints: [
      "Understands your business, audience, and policies",
      "Generates FAQs and support documentation",
      "Drafts responses to messages and emails",
      "Helps keep support moving even when volume spikes",
    ],
    capabilities: ["Draft support replies", "Generate FAQs", "Create help content", "Organize inbox by urgency and topic", "Draft complaint responses", "Create training materials", "Keep brand tone consistent"],
    Demo: CustomerSupportDemo,
  },
  "email-marketer": {
    icon: Mail, title: "Your AI Email Marketer", roleKey: "email",
    summary: "From drafts to delivery, this AI role helps keep campaigns moving with structured planning, approval, and repeatable email execution.",
    valuePoints: [
      "Understands your business, audience, and intent",
      "Creates ready-to-send emails, summaries, and reports",
      "Helps plan, schedule, and review campaigns",
      "Keeps email marketing running consistently",
    ],
    capabilities: ["Create email roadmaps", "Draft newsletters", "Generate subject lines and CTAs", "Build promo campaigns", "Prepare post-purchase emails", "Coordinate re-engagement flows", "Summarize performance trends"],
    Demo: EmailMarketerDemo,
  },
  "virtual-assistant": {
    icon: CalendarCheck, title: "Your AI Virtual Assistant", roleKey: "assistant",
    summary: "From scheduling to coordination, this AI role helps turn scattered requests into organized execution without constant follow-up.",
    valuePoints: [
      "Understands your habits, priorities, and work context",
      "Organizes emails, schedules, and progress",
      "Helps keep work moving 24/7",
      "Supports scalable day-to-day operations",
    ],
    capabilities: ["Create task roadmaps", "Draft and summarize outputs", "Track progress", "Coordinate follow-ups", "Provide daily summaries", "Support ad-hoc requests", "Reduce interruptions"],
    Demo: VirtualAssistantDemo,
  },
};

const AIEmployeeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const role = roles[slug || ""];

  if (!role) return (
    <PageLayout><div className="section-padding text-center"><h1 className="font-display text-2xl font-bold text-foreground">Role not found</h1><Link to="/ai-employees" className="mt-4 inline-block text-primary">← Back to AI Employees</Link></div></PageLayout>
  );

  const Icon = role.icon;
  const Demo = role.Demo;

  return (
    <PageLayout>
      <section className="section-padding blue-ambient">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={32} /></div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">{role.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{role.summary}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {role.valuePoints.map((point) => (
                <span key={point} className="flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1.5 text-xs text-muted-foreground">
                  <Check size={12} className="text-primary" /> {point}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate(`/get-started?role=${role.roleKey}`)} className="btn-glow text-base">Activate This AI Employee</button>
              <Link to="/get-started" className="btn-outline-glow text-base">Build My Team</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-8">Interactive Setup & Demo</h2>
          <Demo />
        </div>
      </section>

      <section className="section-padding blue-ambient-bottom">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-6">What This AI Can Do</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {role.capabilities.map((cap) => (
              <div key={cap} className="glow-border flex items-start gap-3 rounded-xl bg-card p-4">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding blue-ambient text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Ready to Deploy?</h2>
          <p className="mt-4 text-muted-foreground">Add this AI employee to your team and start getting structured, approval-driven work done 24/7.</p>
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
