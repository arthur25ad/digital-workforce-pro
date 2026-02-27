import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { UserPlus, Plug, SlidersHorizontal, Repeat, Building2, Users, Link2, Palette, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, number: "01", title: "Choose Your AI Employees", desc: "Select the digital workers your business needs — social media, support, email, or admin." },
  { icon: Plug, number: "02", title: "Connect Your Tools", desc: "Link the platforms you already use — social accounts, email tools, calendars, and more." },
  { icon: SlidersHorizontal, number: "03", title: "Customize Workflows", desc: "Set the tone, business rules, and task preferences that match how you operate." },
  { icon: Repeat, number: "04", title: "Let Your Team Run 24/7", desc: "Your AI employees handle repetitive work around the clock while you focus on growth." },
];

const onboardingSteps = [
  { icon: Building2, label: "Select business type", desc: "Tell us what industry you're in so we can tailor the experience." },
  { icon: Users, label: "Pick AI roles", desc: "Choose which AI employees will join your team." },
  { icon: Link2, label: "Connect platforms", desc: "Link your social, email, and productivity tools." },
  { icon: Palette, label: "Set tone & preferences", desc: "Configure brand voice, communication style, and goals." },
  { icon: Rocket, label: "Launch workspace", desc: "Your AI team starts working immediately." },
];

const HowItWorksPage = () => (
  <PageLayout>
    {/* Hero steps */}
    <section className="section-padding blue-ambient pb-16 md:pb-20">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            How <span className="gradient-text">VANTORY</span> Works
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Get your AI team up and running in minutes — no technical experience required.
          </p>
        </motion.div>

        <div className="relative grid gap-12 md:grid-cols-4 md:gap-8">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon size={28} />
              </div>
              <span className="font-display text-xs font-semibold tracking-widest text-primary/60">STEP {step.number}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Setup walkthrough */}
    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">What Setup Actually Looks Like</h2>
          <p className="mt-4 text-muted-foreground">A quick walkthrough of the onboarding experience.</p>
        </motion.div>

        {/* Progress bar visual */}
        <div className="mb-10 flex items-center justify-between px-4">
          {onboardingSteps.map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {i + 1}
              </div>
              {i < onboardingSteps.length - 1 && (
                <div className="mx-1 h-px w-8 bg-primary/20 sm:w-16" />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {onboardingSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-glass flex items-center gap-5 rounded-xl p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon size={22} />
              </div>
              <div>
                <span className="font-display text-xs font-semibold text-primary/60">Step {i + 1}</span>
                <h4 className="font-display text-sm font-semibold text-foreground">{step.label}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/get-started" className="btn-glow text-base">Start Setup Now</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default HowItWorksPage;
