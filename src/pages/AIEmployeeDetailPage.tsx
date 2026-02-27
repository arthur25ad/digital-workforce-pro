import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import SocialMediaDemo from "@/components/demos/SocialMediaDemo";
import CustomerSupportDemo from "@/components/demos/CustomerSupportDemo";
import EmailMarketerDemo from "@/components/demos/EmailMarketerDemo";
import VirtualAssistantDemo from "@/components/demos/VirtualAssistantDemo";
import { Share2, Headphones, Mail, CalendarCheck, Check, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RoleConfig {
  icon: any; title: string; roleKey: string; slug: string; summary: string;
  valuePoints: string[]; capabilities: string[]; Demo: React.FC;
}

const roles: Record<string, RoleConfig> = {
  "social-media-manager": {
    icon: Share2, title: "Your AI Social Media Manager", roleKey: "social", slug: "social-media-manager",
    summary: "From planning to publishing, this AI role helps keep your brand active with a structured workflow built around strategy, approvals, and ongoing performance.",
    valuePoints: ["Understands your audience and brand context", "Creates relevant, ready-to-review content", "Supports scheduling and publishing workflows", "Tracks what performs and improves over time"],
    capabilities: ["Build a content plan", "Draft captions", "Suggest content ideas", "Prepare launch messaging", "Summarize wins and case studies", "Send weekly recaps", "Keep a content rhythm going"],
    Demo: SocialMediaDemo,
  },
  "customer-support": {
    icon: Headphones, title: "Your AI Customer Support Manager", roleKey: "support", slug: "customer-support",
    summary: "From first contact to resolution, this AI role helps your business respond faster, stay organized, and keep support quality consistent.",
    valuePoints: ["Understands your business, audience, and policies", "Generates FAQs and support documentation", "Drafts responses to messages and emails", "Helps keep support moving even when volume spikes"],
    capabilities: ["Draft support replies", "Generate FAQs", "Create help content", "Organize inbox by urgency and topic", "Draft complaint responses", "Create training materials", "Keep brand tone consistent"],
    Demo: CustomerSupportDemo,
  },
  "email-marketer": {
    icon: Mail, title: "Your AI Email Marketer", roleKey: "email", slug: "email-marketer",
    summary: "From drafts to delivery, this AI role helps keep campaigns moving with structured planning, approval, and repeatable email execution.",
    valuePoints: ["Understands your business, audience, and intent", "Creates ready-to-send emails, summaries, and reports", "Helps plan, schedule, and review campaigns", "Keeps email marketing running consistently"],
    capabilities: ["Create email roadmaps", "Draft newsletters", "Generate subject lines and CTAs", "Build promo campaigns", "Prepare post-purchase emails", "Coordinate re-engagement flows", "Summarize performance trends"],
    Demo: EmailMarketerDemo,
  },
  "calendar-assistant": {
    icon: CalendarCheck, title: "Your AI Calendar Assistant", roleKey: "assistant", slug: "calendar-assistant",
    summary: "From scheduling to coordination, this AI role helps manage appointments, bookings, reminders, and follow-up timing — so you never miss a client.",
    valuePoints: ["Understands your scheduling habits and client patterns", "Manages appointments, rescheduling, and reminders", "Helps keep work moving 24/7", "Learns preferred booking windows over time"],
    capabilities: ["Manage appointments & bookings", "Suggest optimal time slots", "Send appointment reminders", "Handle rescheduling requests", "Track client scheduling patterns", "Coordinate follow-ups", "Provide daily scheduling summaries"],
    Demo: VirtualAssistantDemo,
  },
};

const AIEmployeeDetailPage = () => {
  const { slug } = useParams();
  const { user, userHasAccessToRole } = useAuth();
  const role = roles[slug || ""];

  if (!role) return (
    <PageLayout><div className="section-padding text-center"><h1 className="font-display text-2xl font-bold text-foreground">Role not found</h1><Link to="/ai-employees" className="mt-4 inline-block text-primary">← Back to AI Employees</Link></div></PageLayout>
  );

  const hasAccess = !user || userHasAccessToRole(role.slug);
  const Icon = role.icon;
  const Demo = role.Demo;

  return (
    <PageLayout>
      {/* Hero */}
      <section className="blue-ambient px-4 md:px-8 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="mx-auto max-w-[1200px] text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={28} /></div>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{role.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{role.summary}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {role.valuePoints.map(point => (
                <span key={point} className="flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1.5 text-xs text-muted-foreground">
                  <Check size={12} className="text-primary" /> {point}
                </span>
              ))}
            </div>
            {!user && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link to="/auth" className="btn-glow text-base">Sign Up to Use</Link>
                <Link to="/pricing" className="btn-outline-glow text-base">View Pricing</Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Workspace */}
      {user && !hasAccess ? (
        <section className="px-4 md:px-8 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50"><Lock size={32} className="text-muted-foreground" /></div>
            <h2 className="font-display text-2xl font-bold text-foreground">This AI Employee is Locked</h2>
            <p className="mt-3 text-muted-foreground">{role.title} is not included in your current package. Upgrade to unlock this role.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/pricing" className="btn-glow text-base">View Plans</Link>
              <Link to="/dashboard" className="btn-outline-glow text-base">Back to Dashboard</Link>
            </div>
          </div>
        </section>
      ) : user && hasAccess ? (
        <section className="px-4 md:px-8 py-10 md:py-14">
          <div className="mx-auto max-w-[1400px]">
            <Demo />
          </div>
        </section>
      ) : (
        <section className="px-4 md:px-8 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-muted-foreground">Sign up to save your work and access the full AI workflow.</p>
          </div>
        </section>
      )}

      {/* What This AI Can Do */}
      <section className="blue-ambient-bottom px-4 md:px-8 py-16 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl mb-6">What This AI Can Do</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {role.capabilities.map(cap => (
              <div key={cap} className="glow-border flex items-start gap-3 rounded-xl bg-card p-4">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default AIEmployeeDetailPage;
