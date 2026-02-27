import { motion } from "framer-motion";
import { Users, Sliders, Zap } from "lucide-react";

const steps = [
  {
    icon: Users,
    number: "1",
    title: "Pick Your Team",
    desc: "Choose the AI employees your business needs.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Sliders,
    number: "2",
    title: "Tell Them About You",
    desc: "Share your tone, goals, and preferences.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    number: "3",
    title: "They Start Working",
    desc: "Your AI team runs 24/7 so you don't have to.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding violet-ambient">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            3 Simple Steps to Get Started
          </h2>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
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
              <div className={`relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                <step.icon size={28} />
              </div>
              <span className={`font-display text-5xl font-bold ${step.color}/20`}>{step.number}</span>
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
