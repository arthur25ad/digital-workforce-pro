import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Sparkles, Home, Scissors, Building2, Briefcase, Wrench, Paintbrush, Stethoscope, Scale } from "lucide-react";

const industries = [
  {
    icon: Building2, name: "Cleaning Companies",
    useCase: "Automate lead follow-up, social posting, and scheduling.",
    roles: ["Social Media Manager", "Customer Support", "Virtual Assistant"],
  },
  {
    icon: Home, name: "Realtors",
    useCase: "Manage follow-ups, email sequences, and client coordination.",
    roles: ["Email Marketer", "Social Media Manager", "Virtual Assistant"],
  },
  {
    icon: Sparkles, name: "Med Spas",
    useCase: "Keep social content flowing and appointment reminders on time.",
    roles: ["Social Media Manager", "Customer Support", "Email Marketer"],
  },
  {
    icon: Scissors, name: "Salons",
    useCase: "Automate booking reminders, reviews, and social posts.",
    roles: ["Social Media Manager", "Virtual Assistant", "Customer Support"],
  },
  {
    icon: Wrench, name: "Home Services",
    useCase: "Fast lead response, organized scheduling, and email campaigns.",
    roles: ["Customer Support", "Virtual Assistant", "Email Marketer"],
  },
  {
    icon: Paintbrush, name: "Local Agencies",
    useCase: "Scale multi-client content, campaigns, and communication.",
    roles: ["Social Media Manager", "Email Marketer", "Virtual Assistant"],
  },
  {
    icon: Briefcase, name: "Consultants",
    useCase: "Offload admin, follow-ups, and newsletter creation.",
    roles: ["Virtual Assistant", "Email Marketer", "Social Media Manager"],
  },
  {
    icon: Stethoscope, name: "Dental Practices",
    useCase: "Appointment reminders, patient follow-ups, and review requests.",
    roles: ["Virtual Assistant", "Customer Support", "Email Marketer"],
  },
  {
    icon: Scale, name: "Law Firms",
    useCase: "Client intake follow-ups, scheduling, and email outreach.",
    roles: ["Virtual Assistant", "Email Marketer", "Customer Support"],
  },
];

const IndustriesPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient pb-12 md:pb-16">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Built for Businesses That Need <span className="gradient-text">More Output</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">Without more headcount.</p>
        </motion.div>
      </div>
    </section>

    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="card-glass rounded-xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ind.icon size={20} />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{ind.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{ind.useCase}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ind.roles.map((r) => (
                  <span key={r} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary/80">{r}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default IndustriesPage;
