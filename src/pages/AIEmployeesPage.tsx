import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Share2, Headphones, Mail, CalendarCheck } from "lucide-react";

const roles = [
  {
    icon: Share2, title: "Social Media Manager", slug: "social-media-manager", agent: "Content Agent",
    description: "Plans content, drafts captions, organizes posting ideas, helps maintain consistent presence, and supports day-to-day social content workflows.",
    workflow: "Strategy • Content • Approval • Publishing",
  },
  {
    icon: Headphones, title: "Customer Support", slug: "customer-support", agent: "Support Agent",
    description: "Handles common customer inquiries, drafts replies, organizes support communication, and helps keep response times fast and professional.",
    workflow: "Knowledge • Drafting • Review • Resolution",
  },
  {
    icon: Mail, title: "Email Marketer", slug: "email-marketer", agent: "Campaign Agent",
    description: "Builds email campaigns, follow-up sequences, promotions, retention messaging, and customer re-engagement flows.",
    workflow: "Campaigns • Scheduling • Review • Performance",
  },
  {
    icon: CalendarCheck, title: "Virtual Assistant", slug: "virtual-assistant", agent: "Admin Agent",
    description: "Supports scheduling, reminders, task organization, follow-ups, and recurring admin coordination.",
    workflow: "Tasks • Tools • Summaries • Coordination",
  },
];

const AIEmployeesPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Specialized Digital Workers for <span className="gradient-text">Real Business Tasks</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Each AI employee is built around a practical workflow. Set the foundation once, connect your tools, define how you want it to work, and let it keep tasks moving with your approval where needed.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {roles.map((role, i) => (
            <motion.div key={role.slug} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={`/ai-employees/${role.slug}`} className="card-glass group block cursor-pointer rounded-xl p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <role.icon size={28} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{role.title}</h3>
                <span className="mt-1 inline-block text-xs font-medium text-primary/70">{role.agent}</span>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">{role.workflow}</span>
                </div>
                <span className="mt-4 inline-block text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                  Explore this role →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PageLayout>
);

export default AIEmployeesPage;
