import { motion } from "framer-motion";
import { Share2, Headphones, Mail, CalendarCheck } from "lucide-react";

const roles = [
  {
    icon: Share2,
    title: "Social Media Manager",
    agent: "Content Agent",
    description: "Plans content, drafts captions, organizes posting ideas, and helps keep your brand active online.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    agent: "Support Agent",
    description: "Handles common customer questions, organizes replies, and helps maintain fast, professional communication.",
  },
  {
    icon: Mail,
    title: "Email Marketer",
    agent: "Campaign Agent",
    description: "Builds email campaigns, follow-up sequences, promotions, and retention messaging.",
  },
  {
    icon: CalendarCheck,
    title: "Virtual Assistant",
    agent: "Admin Agent",
    description: "Helps with scheduling, reminders, admin tasks, follow-ups, and business organization.",
  },
];

const AITeamSection = () => {
  return (
    <section id="team" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Specialized AI Roles for Real Business Work
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Deploy a focused digital team built to handle the repetitive work that slows small businesses down.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-glass group cursor-default rounded-xl p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <role.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{role.title}</h3>
              <span className="mt-1 inline-block text-xs font-medium text-primary/70">{role.agent}</span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AITeamSection;
