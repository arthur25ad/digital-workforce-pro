import { motion } from "framer-motion";
import { Users, Sliders, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section id="how-it-works" className="px-4 py-8 md:px-12 md:py-14 lg:px-16 violet-ambient">
      <div className="mx-auto max-w-[1600px] px-0 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            3 Simple Steps to Get Started
          </h2>
        </motion.div>

        <div className="relative grid gap-6 md:gap-8 md:grid-cols-3">
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
              <div className={`relative z-10 mx-auto mb-3 md:mb-5 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                <step.icon size={28} />
              </div>
              <span className={`font-display text-3xl md:text-5xl font-bold ${step.color}/20`}>{step.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:gap-3"
          >
            Learn More
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
