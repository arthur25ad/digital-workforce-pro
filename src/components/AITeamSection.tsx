import { motion } from "framer-motion";
import { Share2, Headphones, Mail, CalendarCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Share2, title: "Social Media Manager", slug: "social-media-manager",
    desc: "Plans content, drafts captions, and organizes posting ideas.",
    iconBg: "bg-[hsl(174,60%,50%)]/10", iconColor: "text-[hsl(174,60%,50%)]",
  },
  {
    icon: Headphones, title: "Customer Support", slug: "customer-support",
    desc: "Handles customer questions and maintains fast communication.",
    iconBg: "bg-primary/10", iconColor: "text-primary",
  },
  {
    icon: Mail, title: "Email Marketer", slug: "email-marketer",
    desc: "Builds email campaigns, follow-up sequences, and retention messaging.",
    iconBg: "bg-[hsl(262,60%,58%)]/10", iconColor: "text-[hsl(262,60%,58%)]",
  },
  {
    icon: CalendarCheck, title: "Calendar Assistant", slug: "calendar-assistant",
    desc: "Manages appointments, bookings, reminders, and follow-ups.",
    iconBg: "bg-[hsl(38,80%,55%)]/10", iconColor: "text-[hsl(38,80%,55%)]",
  },
];

const AITeamSection = () => (
  <section id="team" className="section-padding">
    <div className="mx-auto max-w-[1200px] px-4 md:px-12 lg:px-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 md:mb-10 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">Your AI Team</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Four specialized roles built for real business work.</p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role, i) => (
          <motion.div key={role.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
            <Link to={`/ai-employees/${role.slug}`} className="group block rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-border/60">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${role.iconBg} ${role.iconColor}`}>
                <role.icon size={18} />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">{role.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{role.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more <ArrowRight size={10} />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AITeamSection;
