import { useParams, Link } from "react-router-dom";
import { Share2, Headphones, Mail, CalendarCheck, Check, Lock } from "lucide-react";

import CustomerSupportDemo from "@/components/demos/CustomerSupportDemo";
import EmailMarketerDemo from "@/components/demos/EmailMarketerDemo";
import SocialMediaDemo from "@/components/demos/SocialMediaDemo";
import VirtualAssistantDemo from "@/components/demos/VirtualAssistantDemo";
import Reveal from "@/components/marketing/Reveal";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";

interface RoleConfig {
  icon: any;
  title: string;
  roleKey: string;
  slug: string;
  summary: string;
  valuePoints: string[];
  capabilities: string[];
  Demo: React.FC;
}

const roles: Record<string, RoleConfig> = {
  "social-media-manager": {
    icon: Share2,
    title: "Your AI Social Media Manager",
    roleKey: "social",
    slug: "social-media-manager",
    summary:
      "From planning to publishing, this AI role helps keep your brand active with a structured workflow built around strategy, approvals, and ongoing performance.",
    valuePoints: [
      "Understands your audience and brand context",
      "Creates relevant, ready-to-review content",
      "Supports scheduling and publishing workflows",
      "Tracks what performs and improves over time",
    ],
    capabilities: [
      "Build a content plan",
      "Draft captions",
      "Suggest content ideas",
      "Prepare launch messaging",
      "Summarize wins and case studies",
      "Send weekly recaps",
      "Keep a content rhythm going",
    ],
    Demo: SocialMediaDemo,
  },
  "customer-support": {
    icon: Headphones,
    title: "Your AI Customer Support Manager",
    roleKey: "support",
    slug: "customer-support",
    summary:
      "From first contact to resolution, this AI role helps your business respond faster, stay organized, and keep support quality consistent.",
    valuePoints: [
      "Understands your business, audience, and policies",
      "Generates FAQs and support documentation",
      "Drafts responses to messages and emails",
      "Helps keep support moving even when volume spikes",
    ],
    capabilities: [
      "Draft support replies",
      "Generate FAQs",
      "Create help content",
      "Organize inbox by urgency and topic",
      "Draft complaint responses",
      "Create training materials",
      "Keep brand tone consistent",
    ],
    Demo: CustomerSupportDemo,
  },
  "email-marketer": {
    icon: Mail,
    title: "Your AI Email Marketer",
    roleKey: "email",
    slug: "email-marketer",
    summary:
      "From drafts to delivery, this AI role helps keep campaigns moving with structured planning, approval, and repeatable email execution.",
    valuePoints: [
      "Understands your business, audience, and intent",
      "Creates ready-to-send emails, summaries, and reports",
      "Helps plan, schedule, and review campaigns",
      "Keeps email marketing running consistently",
    ],
    capabilities: [
      "Create email roadmaps",
      "Draft newsletters",
      "Generate subject lines and CTAs",
      "Build promo campaigns",
      "Prepare post-purchase emails",
      "Coordinate re-engagement flows",
      "Summarize performance trends",
    ],
    Demo: EmailMarketerDemo,
  },
  "calendar-assistant": {
    icon: CalendarCheck,
    title: "Your AI Calendar Assistant",
    roleKey: "assistant",
    slug: "calendar-assistant",
    summary:
      "From scheduling to coordination, this AI role helps manage appointments, bookings, reminders, and follow-up timing so you never miss a client.",
    valuePoints: [
      "Understands your scheduling habits and client patterns",
      "Manages appointments, rescheduling, and reminders",
      "Helps keep work moving 24/7",
      "Learns preferred booking windows over time",
    ],
    capabilities: [
      "Manage appointments & bookings",
      "Suggest optimal time slots",
      "Send appointment reminders",
      "Handle rescheduling requests",
      "Track client scheduling patterns",
      "Coordinate follow-ups",
      "Provide daily scheduling summaries",
    ],
    Demo: VirtualAssistantDemo,
  },
};

export default function AIEmployeeDetailPage() {
  const { slug } = useParams();
  const { user, userHasAccessToRole } = useAuth();
  const role = roles[slug || ""];

  if (!role) {
    return (
      <PageLayout>
        <div className="section-padding">
          <div className="site-container text-center">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">Role not found</h1>
            <Link to="/ai-employees" className="marketing-link mt-4 inline-flex">
              Back to AI roles
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const hasAccess = !user || userHasAccessToRole(role.slug);
  const Icon = role.icon;
  const Demo = role.Demo;

  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <div className="surface-panel p-8 md:p-10">
              <div className="max-w-4xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-background/35 text-primary">
                  <Icon size={24} />
                </div>
                <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.08em] text-foreground md:text-5xl">
                  {role.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{role.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {role.valuePoints.map((point) => (
                    <span key={point} className="pill-muted">
                      <Check size={12} className="text-primary" />
                      {point}
                    </span>
                  ))}
                </div>
                {!user ? (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link to="/auth" className="btn-glow">Sign Up to Use</Link>
                    <Link to="/pricing" className="btn-outline-glow">View Pricing</Link>
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {user && !hasAccess ? (
        <section className="section-padding pt-0">
          <div className="site-container">
            <div className="surface-panel mx-auto max-w-2xl p-8 text-center md:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-border/70 bg-background/35">
                <Lock size={32} className="text-muted-foreground" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                This AI role is not in your current package
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {role.title} is locked for this subscription. Upgrade to unlock the role and its workflow demo.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/pricing" className="btn-glow">View Plans</Link>
                <Link to="/dashboard" className="btn-outline-glow">Back to Dashboard</Link>
              </div>
            </div>
          </div>
        </section>
      ) : user && hasAccess ? (
        <section className="section-padding pt-0">
          <div className="site-container max-w-[1400px]">
            <Demo />
          </div>
        </section>
      ) : (
        <section className="section-padding pt-0">
          <div className="site-container max-w-4xl text-center">
            <p className="text-muted-foreground">Sign up to save your work and access the full AI workflow.</p>
          </div>
        </section>
      )}

      <section className="section-padding pt-0">
        <div className="site-container max-w-[1400px]">
          <Reveal>
            <div className="surface-panel p-6 md:p-8">
              <h2 className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                What this AI role can do
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {role.capabilities.map((capability) => (
                  <div key={capability} className="rounded-[1.25rem] border border-border/70 bg-background/35 p-4">
                    <div className="flex items-start gap-3">
                      <Check size={16} className="mt-1 shrink-0 text-primary" />
                      <span className="text-sm leading-7 text-foreground">{capability}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  );
}
