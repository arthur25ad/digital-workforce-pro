import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Sparkles, Home, Scissors, Building2, Briefcase, Wrench, Paintbrush, Stethoscope, Scale } from "lucide-react";

type AccentColor = "teal" | "violet" | "amber";

const industries: { icon: typeof Building2; name: string; useCase: string; roles: string[]; accent: AccentColor }[] = [
  {
    icon: Building2, name: "Cleaning Companies", accent: "teal",
    useCase: "Automate lead follow-up, social posting, and scheduling.",
    roles: ["Social Media Manager", "Customer Support", "Virtual Assistant"],
  },
  {
    icon: Wrench, name: "Home Services", accent: "teal",
    useCase: "Fast lead response, organized scheduling, and email campaigns.",
    roles: ["Customer Support", "Virtual Assistant", "Email Marketer"],
  },
  {
    icon: Sparkles, name: "Med Spas", accent: "violet",
    useCase: "Keep social content flowing and appointment reminders on time.",
    roles: ["Social Media Manager", "Customer Support", "Email Marketer"],
  },
  {
    icon: Scissors, name: "Salons", accent: "violet",
    useCase: "Automate booking reminders, reviews, and social posts.",
    roles: ["Social Media Manager", "Virtual Assistant", "Customer Support"],
  },
  {
    icon: Home, name: "Realtors", accent: "amber",
    useCase: "Manage follow-ups, email sequences, and client coordination.",
    roles: ["Email Marketer", "Social Media Manager", "Virtual Assistant"],
  },
  {
    icon: Briefcase, name: "Consultants", accent: "amber",
    useCase: "Offload admin, follow-ups, and newsletter creation.",
    roles: ["Virtual Assistant", "Email Marketer", "Social Media Manager"],
  },
  {
    icon: Paintbrush, name: "Local Agencies", accent: "amber",
    useCase: "Scale multi-client content, campaigns, and communication.",
    roles: ["Social Media Manager", "Email Marketer", "Virtual Assistant"],
  },
  {
    icon: Stethoscope, name: "Dental Practices", accent: "violet",
    useCase: "Appointment reminders, patient follow-ups, and review requests.",
    roles: ["Virtual Assistant", "Customer Support", "Email Marketer"],
  },
  {
    icon: Scale, name: "Law Firms", accent: "amber",
    useCase: "Client intake follow-ups, scheduling, and email outreach.",
    roles: ["Virtual Assistant", "Email Marketer", "Customer Support"],
  },
];

const accentStyles: Record<AccentColor, { border: string; iconBg: string; iconText: string; tagBg: string; tagText: string; hoverGlow: string }> = {
  teal: {
    border: "border-t-2 border-t-accent-teal/30",
    iconBg: "bg-accent-teal/10",
    iconText: "text-accent-teal",
    tagBg: "bg-accent-teal/8",
    tagText: "text-accent-teal/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(174_60%_50%/0.08)]",
  },
  violet: {
    border: "border-t-2 border-t-accent-violet/30",
    iconBg: "bg-accent-violet/10",
    iconText: "text-accent-violet",
    tagBg: "bg-accent-violet/8",
    tagText: "text-accent-violet/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(262_60%_58%/0.08)]",
  },
  amber: {
    border: "border-t-2 border-t-accent-amber/30",
    iconBg: "bg-accent-amber/10",
    iconText: "text-accent-amber",
    tagBg: "bg-accent-amber/8",
    tagText: "text-accent-amber/70",
    hoverGlow: "hover:shadow-[0_0_25px_hsl(38_80%_55%/0.08)]",
  },
};

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
          {industries.map((ind, i) => {
            const s = accentStyles[ind.accent];
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`card-glass rounded-xl p-6 ${s.border} ${s.hoverGlow}`}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${s.iconBg} ${s.iconText}`}>
                  <ind.icon size={20} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{ind.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{ind.useCase}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ind.roles.map((r) => (
                    <span key={r} className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${s.tagBg} ${s.tagText}`}>{r}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Link to="/get-started" className="btn-glow text-base">Get Started</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default IndustriesPage;
