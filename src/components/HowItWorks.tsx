import { motion } from "framer-motion";
import { UserPlus, SlidersHorizontal, Repeat } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Choose Your AI Roles",
    desc: "Select the digital workers your business needs most.",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "Customize Their Workflows",
    desc: "Tailor tasks, tone, and business rules to fit how you operate.",
  },
  {
    icon: Repeat,
    number: "03",
    title: "Let Them Run 24/7",
    desc: "Your AI team handles repetitive work around the clock.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Set Up Your AI Team in Minutes
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon size={28} />
              </div>
              <span className="font-display text-xs font-semibold tracking-widest text-primary/60">STEP {step.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
