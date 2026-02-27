import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import {
  Users, Settings2, Layers, PenLine, MessageSquare,
  CalendarClock, Plug, Eye, LayoutDashboard,
} from "lucide-react";

const groups = [
  {
    heading: "Core Platform Capabilities",
    description: "The foundation that powers your digital workforce — role assignment, automation, and intelligent task routing.",
    features: [
      {
        icon: Users, title: "Role-Based AI Workers",
        desc: "Deploy specialized employees for social, support, email, and admin.",
        items: ["Social Media Manager", "Customer Support", "Email Marketer", "Virtual Assistant"],
      },
      {
        icon: Settings2, title: "Workflow Automation",
        desc: "Custom triggers, conditions, and multi-step sequences that run on schedule.",
        items: ["Custom triggers", "Conditional logic", "Scheduled runs"],
      },
      {
        icon: Layers, title: "Task Routing",
        desc: "Incoming work is assigned to the right AI role by type and urgency.",
        items: ["Smart assignment", "Priority detection", "Role matching"],
      },
    ],
  },
  {
    heading: "Daily Execution Tools",
    description: "The hands-on capabilities your AI team uses every day to produce real output.",
    features: [
      {
        icon: PenLine, title: "Draft Generation",
        desc: "Ready-to-review drafts for posts, emails, replies, and documents.",
        items: ["Social captions", "Email campaigns", "Support replies"],
      },
      {
        icon: MessageSquare, title: "Messaging Support",
        desc: "Consistent handling of inquiries, follow-ups, and internal communication.",
        items: ["Auto-replies", "FAQ handling", "Escalation tagging"],
      },
      {
        icon: CalendarClock, title: "Scheduling Support",
        desc: "Organized calendars, automated reminders, and coordinated meetings.",
        items: ["Calendar sync", "Reminder automation", "Follow-up scheduling"],
      },
    ],
  },
  {
    heading: "Visibility & Control",
    description: "Stay in the loop — connect your tools and review everything your AI team produces.",
    features: [
      {
        icon: Plug, title: "Platform Connections",
        desc: "Link social, email, calendar, and productivity tools you already use.",
        items: ["Social platforms", "Email providers", "Productivity tools"],
      },
      {
        icon: Eye, title: "Team Visibility",
        desc: "See what every AI employee is working on and review all outputs.",
        items: ["Activity timeline", "Output review", "Performance metrics"],
      },
    ],
  },
];

const FeaturesPage = () => (
  <PageLayout>
    {/* Hero */}
    <section className="section-padding blue-ambient pb-12 md:pb-16">
      <div className="mx-auto max-w-[1600px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Everything Your AI Team Needs to <span className="gradient-text">Get Work Done</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A complete platform for deploying, managing, and scaling your digital workforce.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Dashboard preview band */}
    <section className="px-4 pb-16 md:px-8 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card"
        >
          <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-muted-foreground">VANTORY Dashboard</span>
          </div>
          <div className="grid grid-cols-4 gap-4 p-6">
            {[
              { label: "Active Roles", value: "4" },
              { label: "Tasks Completed", value: "128" },
              { label: "Drafts Pending", value: "7" },
              { label: "Platforms Connected", value: "6" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-secondary/60 p-4 text-center">
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/40 px-6 py-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">All systems operational</span>
            </div>
            <span className="text-xs text-muted-foreground/60">Last updated 2 min ago</span>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Feature groups */}
    {groups.map((group, gi) => (
      <section
        key={group.heading}
        className={`px-4 md:px-8 ${gi === groups.length - 1 ? "pb-24 pt-8 md:pb-32" : "py-8 md:py-12"} ${gi === 1 ? "blue-ambient-bottom" : ""}`}
      >
        <div className="mx-auto max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">{group.heading}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{group.description}</p>
          </motion.div>

          {/* Alternate layout: group 0 = 3-col, group 1 = split-row, group 2 = 2-col wide */}
          {gi === 1 ? (
            <div className="space-y-5">
              {group.features.map((feat, fi) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: fi % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: fi * 0.08 }}
                  className="card-glass flex flex-col gap-5 rounded-xl p-6 sm:flex-row sm:items-start"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feat.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-foreground">{feat.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{feat.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                     {feat.items.map((item, idx) => {
                        const pillColors = ["bg-primary/8 text-primary/60", "bg-accent-violet/8 text-accent-violet/60", "bg-accent-teal/8 text-accent-teal/60"];
                        return <span key={item} className={`rounded-full px-2.5 py-0.5 text-[11px] ${pillColors[idx % pillColors.length]}`}>{item}</span>;
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-6 ${group.features.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {group.features.map((feat, fi) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: fi * 0.08 }}
                  className="card-glass rounded-xl p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feat.icon size={20} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{feat.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feat.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {feat.items.map((item, idx) => {
                      const pillColors = ["bg-primary/8 text-primary/60", "bg-accent-violet/8 text-accent-violet/60", "bg-accent-teal/8 text-accent-teal/60"];
                      return <span key={item} className={`rounded-full px-2.5 py-0.5 text-[11px] ${pillColors[idx % pillColors.length]}`}>{item}</span>;
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    ))}

    {/* CTA */}
    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Ready to put your AI team to work?</h2>
        <p className="mt-3 text-muted-foreground">Get started in minutes — no technical experience required.</p>
        <div className="mt-8">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default FeaturesPage;
