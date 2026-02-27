import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import {
  PenLine, MessageSquare, Inbox, Mail, UserCheck, FileText,
  CalendarClock, ClipboardList, ListChecks, Settings2, Share2,
  Headphones, Layers, Eye, Plug, Users,
} from "lucide-react";

const featureSections = [
  {
    title: "Role-Based AI Workers",
    icon: Users,
    desc: "Deploy specialized digital employees for social media, support, email, and admin — each focused on their domain.",
    items: ["Social Media Manager", "Customer Support", "Email Marketer", "Virtual Assistant"],
  },
  {
    title: "Workflow Automation",
    icon: Settings2,
    desc: "Define custom workflows that run automatically. Set triggers, conditions, and actions for each AI role.",
    items: ["Custom triggers", "Conditional logic", "Multi-step sequences", "Scheduled runs"],
  },
  {
    title: "Task Routing",
    icon: Layers,
    desc: "Incoming work is automatically assigned to the right AI employee based on type, urgency, and context.",
    items: ["Smart assignment", "Priority detection", "Role matching", "Overflow handling"],
  },
  {
    title: "Draft Generation",
    icon: PenLine,
    desc: "AI employees create ready-to-review drafts for posts, emails, replies, and documents.",
    items: ["Social captions", "Email campaigns", "Support replies", "Meeting summaries"],
  },
  {
    title: "Messaging Support",
    icon: MessageSquare,
    desc: "Handle customer inquiries, follow-ups, and internal communication with consistent quality.",
    items: ["Auto-replies", "FAQ handling", "Escalation tagging", "Conversation summaries"],
  },
  {
    title: "Scheduling Support",
    icon: CalendarClock,
    desc: "Keep calendars organized, send reminders, and coordinate meetings without manual effort.",
    items: ["Calendar sync", "Reminder automation", "Meeting prep", "Follow-up scheduling"],
  },
  {
    title: "Platform Connections",
    icon: Plug,
    desc: "Connect the tools you already use. AI employees work across your existing tech stack.",
    items: ["Social platforms", "Email providers", "Calendars", "Productivity tools"],
  },
  {
    title: "Team Visibility",
    icon: Eye,
    desc: "See what every AI employee is working on, review outputs, and maintain full control.",
    items: ["Activity timeline", "Task queue", "Output review", "Performance metrics"],
  },
];

const FeaturesPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Everything Your AI Team Needs to <span className="gradient-text">Get Work Done</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            A complete platform for deploying, managing, and scaling your digital workforce.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {featureSections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card-glass rounded-xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{section.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{section.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default FeaturesPage;
