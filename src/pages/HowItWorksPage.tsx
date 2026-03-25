import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import { homeSteps } from "@/content/marketing";

const rolloutNotes = [
  "No technical team required",
  "Set guardrails around approvals and tone",
  "Connect only the channels you actually use",
  "Adjust the workflow as your business evolves",
];

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="How it works"
              title="A simple rollout with enough control to feel production-ready."
              copy="The setup is intentionally practical. The goal is not to add another system your team has to manage. The goal is to make the existing workflow run more cleanly."
            />
          </Reveal>

          <Reveal delay={0.06}>
            <div className="mt-8 flex flex-wrap gap-3">
              {rolloutNotes.map((note) => (
                <div key={note} className="pill-muted">
                  <CheckCircle2 size={14} className="text-primary" />
                  {note}
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 space-y-4">
            {homeSteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <article className="surface-panel grid gap-5 p-6 md:grid-cols-[100px_56px_1fr] md:items-start md:p-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.26em] text-primary">0{index + 1}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
                    <step.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                      {step.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{step.copy}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-12 surface-panel p-8 text-center md:p-10">
              <p className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                Ready to see the rollout in context?
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                The product lands best when you can map it to your actual appointment flow, not just read about the steps in abstraction.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/pricing" className="btn-outline-glow">
                  View Plans
                </Link>
                <Link to="/get-started" className="btn-glow">
                  Start Setup
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  );
}
