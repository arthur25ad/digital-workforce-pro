import { motion } from "framer-motion";
import { MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "1",
    title: "Tell It How You Work",
    desc: "Describe how your business schedules and follows up — no code required.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Sparkles,
    number: "2",
    title: "It Organizes Requests",
    desc: "Incoming requests become clear next steps, suggested times, reminders, and follow-ups.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: CheckCircle2,
    number: "3",
    title: "Review & Approve",
    desc: "You stay in control while the assistant keeps everything moving forward.",
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
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-14 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
        </motion.div>

        <div className="relative grid gap-6 md:gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
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
      </div>
    </section>
  );
};

export default HowItWorks;
