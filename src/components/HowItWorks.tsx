import { motion } from "framer-motion";
import { UserPlus, SlidersHorizontal, Repeat } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Choose Your AI Roles",
    desc: "Pick the digital workers your business needs — like support, social media, or email.",
    iconColor: "text-[hsl(174,60%,50%)]",
    iconBg: "bg-[hsl(174,60%,50%)]/10",
    numColor: "text-[hsl(174,60%,50%)]/60",
  },
  {
    icon: SlidersHorizontal,
    number: "02",
    title: "Set Their Tasks",
    desc: "Tell them what to do, how to sound, and what your business rules are.",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    numColor: "text-primary/60",
  },
  {
    icon: Repeat,
    number: "03",
    title: "They Work Around the Clock",
    desc: "Your AI team handles the busy work — day and night — so you don't have to.",
    iconColor: "text-[hsl(262,60%,58%)]",
    iconBg: "bg-[hsl(262,60%,58%)]/10",
    numColor: "text-[hsl(262,60%,58%)]/60",
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
            Set Up Your AI Team in Minutes
          </h2>
        </motion.div>

        <div className="relative grid gap-8 lg:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className={`relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor}`}>
                <step.icon size={28} />
              </div>
              <span className={`font-display text-xs font-semibold tracking-widest ${step.numColor}`}>STEP {step.number}</span>
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
