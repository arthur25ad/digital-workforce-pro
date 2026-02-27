import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Sparkles, Home, Scissors, Building2, Briefcase, Wrench, Paintbrush } from "lucide-react";

const industries = [
  {
    icon: Building2, name: "Cleaning Companies", slug: "cleaning-companies",
    why: "Cleaning companies handle high volumes of leads, scheduling, and follow-ups. AI employees keep operations running smoothly without extra hires.",
    roles: ["Social Media Manager", "Customer Support", "Virtual Assistant"],
    useCases: ["Lead follow-up", "Social posting", "Scheduling support", "Review request help"],
  },
  {
    icon: Home, name: "Realtors", slug: "realtors",
    why: "Real estate professionals juggle client communication, listings, and follow-ups. AI employees handle the repetitive work so you can close deals.",
    roles: ["Email Marketer", "Social Media Manager", "Virtual Assistant"],
    useCases: ["Follow-up messaging", "Email sequences", "Social content support", "Client coordination"],
  },
  {
    icon: Sparkles, name: "Med Spas", slug: "med-spas",
    why: "Med spas need consistent social presence, fast client responses, and organized communications. AI handles it all 24/7.",
    roles: ["Social Media Manager", "Customer Support", "Email Marketer"],
    useCases: ["Social content", "Support questions", "Appointment reminders", "Email promotions"],
  },
  {
    icon: Scissors, name: "Salons", slug: "salons",
    why: "Salons benefit from automated appointment reminders, social content, and client follow-ups without adding staff.",
    roles: ["Social Media Manager", "Virtual Assistant", "Customer Support"],
    useCases: ["Booking reminders", "Social posts", "Client follow-ups", "Review requests"],
  },
  {
    icon: Wrench, name: "Home Services", slug: "home-services",
    why: "Home service businesses need fast lead response and organized scheduling. AI employees keep your pipeline moving.",
    roles: ["Customer Support", "Virtual Assistant", "Email Marketer"],
    useCases: ["Lead response", "Scheduling", "Follow-ups", "Email campaigns"],
  },
  {
    icon: Paintbrush, name: "Local Agencies", slug: "local-agencies",
    why: "Agencies managing multiple clients can deploy AI employees to handle content, communication, and coordination across accounts.",
    roles: ["Social Media Manager", "Email Marketer", "Virtual Assistant"],
    useCases: ["Multi-client content", "Campaign management", "Client communication", "Reporting"],
  },
  {
    icon: Briefcase, name: "Consultants", slug: "consultants",
    why: "Consultants can offload admin work, client follow-ups, and content creation to focus on delivering value.",
    roles: ["Virtual Assistant", "Email Marketer", "Social Media Manager"],
    useCases: ["Client follow-ups", "Meeting prep", "Newsletter creation", "Social presence"],
  },
];

const IndustriesPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Built for Businesses That Need <span className="gradient-text">More Output</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">Without more headcount.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.slug}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card-glass rounded-xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ind.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{ind.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{ind.why}</p>

              <div className="mt-4">
                <span className="text-xs font-semibold text-primary/60">Best AI Roles</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ind.roles.map((r) => (
                    <span key={r} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{r}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-xs font-semibold text-primary/60">Common Use Cases</span>
                <ul className="mt-2 space-y-1">
                  {ind.useCases.map((uc) => (
                    <li key={uc} className="text-xs text-muted-foreground">• {uc}</li>
                  ))}
                </ul>
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

export default IndustriesPage;
