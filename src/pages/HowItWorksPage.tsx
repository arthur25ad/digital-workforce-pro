import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Users, Sliders, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Users,
    number: "1",
    title: "Pick Your Team",
    desc: "Choose which AI employees you want — like a social media manager, email marketer, or support agent.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Sliders,
    number: "2",
    title: "Tell Them About You",
    desc: "Share your business name, tone, and preferences. They'll learn how you like things done.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Zap,
    number: "3",
    title: "They Start Working",
    desc: "That's it. Your AI team handles the work 24/7 while you focus on growing your business.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

const reassurances = [
  "No coding or tech skills needed",
  "Set up in under 5 minutes",
  "Change anything anytime",
  "Cancel whenever you want",
];

const HowItWorksPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-[1100px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            3 Simple Steps
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Getting started is easier than ordering coffee.
          </p>
        </motion.div>

        {/* Reassurance pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16 flex flex-wrap items-center justify-center gap-3"
        >
          {reassurances.map((r) => (
            <span
              key={r}
              className="flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/30 px-3.5 py-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              {r}
            </span>
          ))}
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 md:space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className={`card-glass flex flex-col items-start gap-5 rounded-2xl border ${step.border} p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8`}
            >
              {/* Number + Icon */}
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.bg}`}>
                  <step.icon size={26} className={step.color} />
                </div>
                <span className={`font-display text-4xl font-bold ${step.color}/40 sm:hidden`}>
                  {step.number}
                </span>
              </div>

              {/* Large number (desktop) */}
              <span className={`hidden font-display text-5xl font-bold ${step.color}/30 sm:block`}>
                {step.number}
              </span>

              {/* Text */}
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <Link
            to="/get-started"
            className="btn-glow inline-flex items-center gap-2 text-base"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground/60">
            No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  </PageLayout>
);

export default HowItWorksPage;
