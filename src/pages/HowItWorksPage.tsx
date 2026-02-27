import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { UserPlus, Plug, SlidersHorizontal, Repeat, Building2, Users, Link2, Palette, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, number: "01", title: "Choose Your AI Employees", desc: "Select the digital workers your business needs — social media, support, email, or admin." },
  { icon: Plug, number: "02", title: "Connect Your Tools", desc: "Link the platforms you already use — social media accounts, email tools, calendars, and more." },
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
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            How <span className="gradient-text">Vantory</span> Works
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Get your AI team up and running in minutes — no technical experience required.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-4">
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

    <section className="section-padding">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">What Setup Actually Looks Like</h2>
          <p className="mt-4 text-muted-foreground">A quick walkthrough of the onboarding experience.</p>
        </motion.div>

        <div className="space-y-4">
          {onboardingSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-glass flex items-center gap-5 rounded-xl p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon size={22} />
              </div>
              <div>
                <span className="font-display text-xs font-semibold text-primary/60">Step {i + 1}</span>
                <h4 className="font-display text-sm font-semibold text-foreground">{step.label}</h4>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/get-started" className="btn-glow text-base">Start Setup Now</Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default HowItWorksPage;
