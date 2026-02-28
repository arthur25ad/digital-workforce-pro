import { motion } from "framer-motion";
import { Sparkles, Home, Scissors, Building2, Briefcase, Users2, Paintbrush, Wrench } from "lucide-react";

const industries = [
  { icon: Sparkles, name: "Med Spas", accent: "text-accent-violet" },
  { icon: Home, name: "Realtors", accent: "text-accent-amber" },
  { icon: Scissors, name: "Salons", accent: "text-accent-violet" },
  { icon: Wrench, name: "Home Services", accent: "text-accent-teal" },
  { icon: Building2, name: "Cleaning Companies", accent: "text-accent-teal" },
  { icon: Paintbrush, name: "Local Agencies", accent: "text-accent-amber" },
  { icon: Briefcase, name: "Consultants", accent: "text-accent-amber" },
  { icon: Users2, name: "Small Service Businesses", accent: "text-primary" },
];

const IndustriesSection = () => {
  return (
    <section id="industries" className="section-padding">
      <div className="mx-auto max-w-[1600px] px-0 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            Built for Small Businesses That Need More Output
          </h2>
          <p className="mx-auto mt-3 md:mt-4 max-w-xl text-sm md:text-base text-muted-foreground">Without more headcount.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-4">
          {industries.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card-glass flex flex-col items-center gap-2 md:gap-3 rounded-xl px-3 py-4 md:px-4 md:py-6 text-center"
            >
              <item.icon size={24} className={item.accent} />
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
