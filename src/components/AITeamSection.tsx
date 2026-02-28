import { motion } from "framer-motion";
import { Share2, Headphones, Mail, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Share2, title: "Social Media Manager", slug: "social-media-manager", agent: "Content Agent",
    description: "Plans content, drafts captions, organizes posting ideas, and helps keep your brand active online.",
    accentBorder: "hover:border-t-[hsl(174,60%,50%)]/60",
    iconBg: "bg-[hsl(174,60%,50%)]/10",
    iconColor: "text-[hsl(174,60%,50%)]",
    tagColor: "text-[hsl(174,60%,50%)]/70",
  },
  {
    icon: Headphones, title: "Customer Support", slug: "customer-support", agent: "Support Agent",
    description: "Handles common customer questions, organizes replies, and helps maintain fast, professional communication.",
    accentBorder: "hover:border-t-primary/60",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    tagColor: "text-primary/70",
  },
  {
    icon: Mail, title: "Email Marketer", slug: "email-marketer", agent: "Campaign Agent",
    description: "Builds email campaigns, follow-up sequences, promotions, and retention messaging.",
    accentBorder: "hover:border-t-[hsl(262,60%,58%)]/60",
    iconBg: "bg-[hsl(262,60%,58%)]/10",
    iconColor: "text-[hsl(262,60%,58%)]",
    tagColor: "text-[hsl(262,60%,58%)]/70",
  },
  {
    icon: CalendarCheck, title: "AI Calendar Assistant", slug: "calendar-assistant", agent: "Scheduling Agent",
    description: "Manages appointments, bookings, reminders, follow-ups, and daily scheduling for your business.",
    accentBorder: "hover:border-t-[hsl(38,80%,55%)]/60",
    iconBg: "bg-[hsl(38,80%,55%)]/10",
    iconColor: "text-[hsl(38,80%,55%)]",
    tagColor: "text-[hsl(38,80%,55%)]/70",
  },
];

const AITeamSection = () => (
  <section id="team" className="section-padding">
    <div className="mx-auto max-w-[1600px] px-0 md:px-12 lg:px-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-8 md:mb-14 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">Specialized AI Roles for Real Business Work</h2>
        <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-sm md:text-base text-muted-foreground">Deploy a focused digital team built to handle the repetitive work that slows small businesses down.</p>
      </motion.div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role, i) => (
          <motion.div key={role.title} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Link to={`/ai-employees/${role.slug}`} className={`card-glass group block cursor-pointer rounded-xl border-t-2 border-t-transparent p-4 md:p-6 ${role.accentBorder}`}>
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${role.iconBg} ${role.iconColor} transition-colors`}>
                <role.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{role.title}</h3>
              <span className={`mt-1 inline-block text-xs font-medium ${role.tagColor}`}>{role.agent}</span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AITeamSection;
