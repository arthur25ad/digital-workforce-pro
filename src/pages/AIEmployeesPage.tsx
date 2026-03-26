import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Share2, Headphones, Mail, CalendarCheck, Bot } from "lucide-react";

const roles = [
  {
    icon: Share2, title: "Social Media Manager", slug: "social-media-manager",
    value: "Keep your brand active with structured content workflows.",
    workflow: ["Strategy", "Content", "Approval", "Publishing"],
    color: "text-blue-400", bg: "bg-blue-500/10", hoverBorder: "hover:border-blue-500/30",
  },
  {
    icon: Headphones, title: "Customer Support", slug: "customer-support",
    value: "Respond faster with organized, on-brand support drafts.",
    workflow: ["Knowledge", "Drafting", "Review", "Resolution"],
    color: "text-violet-400", bg: "bg-violet-500/10", hoverBorder: "hover:border-violet-500/30",
  },
  {
    icon: Mail, title: "Email Marketer", slug: "email-marketer",
    value: "Plan, draft, and schedule campaigns that keep customers engaged.",
    workflow: ["Campaigns", "Scheduling", "Review", "Performance"],
    color: "text-emerald-400", bg: "bg-emerald-500/10", hoverBorder: "hover:border-emerald-500/30",
  },
  {
    icon: CalendarCheck, title: "AI Calendar Assistant", slug: "calendar-assistant",
    value: "Smart scheduling, appointment management, reminders, and follow-up timing.",
    workflow: ["Appointments", "Scheduling", "Reminders", "Follow-ups"],
    color: "text-amber-400", bg: "bg-amber-500/10", hoverBorder: "hover:border-amber-500/30",
  },
];

const AIEmployeesPage = () => (
  <PageLayout>
    {/* Hero */}
    <section className="section-padding blue-ambient pb-10 md:pb-14">
      <div className="mx-auto max-w-[1600px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Specialized Digital Workers for <span className="gradient-text">Real Business Tasks</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Set the foundation once, connect your tools, and let each role keep tasks moving with your approval where needed.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Intro band */}
    <section className="px-4 pb-10 md:px-8 md:pb-14">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-5 rounded-2xl border border-border/40 bg-card/60 px-8 py-7 text-center sm:flex-row sm:text-left"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">How every AI employee works</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Foundation → Tool Connections → Strategy → Review & Approval → Execution & Insights
            </p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Role cards — 2×2 */}
    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 sm:grid-cols-2">
          {roles.map((role, i) => (
            <motion.div key={role.slug} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={`/ai-employees/${role.slug}`} className={`card-glass group block cursor-pointer rounded-xl p-8 ${role.hoverBorder}`}>
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${role.bg} ${role.color} transition-colors`}>
                  <role.icon size={28} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{role.value}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {role.workflow.map((w) => (
                    <span key={w} className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground/70">{w}</span>
                  ))}
                </div>
                <span className={`mt-5 inline-block text-sm font-medium ${role.color} transition-colors`}>
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
