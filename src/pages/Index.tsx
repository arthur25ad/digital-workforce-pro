import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Dot,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import BookDemoModal from "@/components/BookDemoModal";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import PricingGrid from "@/components/marketing/PricingGrid";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import { useActivePromos } from "@/hooks/useActivePromos";
import {
  faqItems,
  featureGroups,
  homeOutcomes,
  homePains,
  homeSteps,
  industryCards,
  operatorVoices,
  proofPoints,
  roleDirectory,
  workflowMoments,
} from "@/content/marketing";

const heroIndustries = [
  "Med spas",
  "Salons",
  "Clinics",
  "Home services",
  "Consultants",
  "Agencies",
];

const heroActivity = [
  { label: "Consultation request organized", status: "Booked" },
  { label: "Reminder wave sent to tomorrow's appointments", status: "Sent" },
  { label: "Reschedule handled and confirmed", status: "Updated" },
];

export default function Index() {
  const [demoOpen, setDemoOpen] = useState(false);
  const { pricingPromos } = useActivePromos();
  const topPromo = pricingPromos[0] ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="overflow-hidden pt-24 md:pt-28">
        <section className="section-padding pb-10 md:pb-14">
          <div className="site-container">
            <Reveal>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <span className="section-kicker">Premium AI operations for appointment-heavy teams</span>
                <div className="pill-muted">
                  <Sparkles size={14} className="text-primary" />
                  Smooth, human-approved workflow automation
                </div>
              </div>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <Reveal className="max-w-3xl">
                <p className="font-display text-[clamp(4.2rem,15vw,10rem)] font-semibold leading-[0.82] tracking-[-0.1em] text-foreground">
                  VANTORY
                </p>
                <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.5rem,6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-foreground">
                  The AI operations assistant for <span className="font-editorial">appointment-based</span> businesses.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  Capture requests, confirm appointments, send reminders, handle reschedules, and keep follow-up moving
                  without living in your calendar all day.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {heroIndustries.map((industry) => (
                    <span key={industry} className="pill-muted">
                      <Dot size={16} className="text-primary" />
                      {industry}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/auth" className="btn-glow">
                    Start With VANTORY
                    <ArrowUpRight size={16} />
                  </Link>
                  <button type="button" onClick={() => setDemoOpen(true)} className="btn-outline-glow">
                    Book a Demo
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {proofPoints.map((point) => (
                    <div key={point.label} className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 px-3 py-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                        {point.label}
                      </span>
                      <span className="text-foreground">{point.value}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="surface-panel relative min-h-[560px] overflow-hidden p-4 md:p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(205_73%_70%/0.18),transparent_36%)]" />
                  <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(180deg,white,white,transparent)]">
                    <ShaderAnimation className="scale-[1.04] opacity-65" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(222_31%_7%/0.08),hsl(222_31%_7%/0.68)_45%,hsl(222_31%_7%/0.95))]" />

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-background/30 p-4 backdrop-blur">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                          Live operations layer
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                          Calendar stays clear. Follow-up stays moving.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                        Active
                      </div>
                    </div>

                    <div className="mx-auto my-8 flex w-full max-w-[360px] flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-[hsl(223_24%_10%/0.78)] p-4 shadow-[0_24px_80px_hsl(222_40%_4%/0.45)] backdrop-blur-xl md:max-w-[400px] md:p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-xl font-semibold tracking-[-0.06em] text-foreground">
                            Today's flow
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">A cleaner front-desk rhythm, without extra headcount.</p>
                        </div>
                        <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                          VANTORY
                        </div>
                      </div>

                      <div className="space-y-3">
                        {heroActivity.map((item) => (
                          <div key={item.label} className="rounded-[1.25rem] border border-white/8 bg-background/50 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm leading-6 text-foreground">{item.label}</p>
                              <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-[1.25rem] border border-primary/15 bg-primary/8 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary/80">This week</p>
                            <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">0 missed follow-ups</p>
                          </div>
                          <CalendarClock size={18} className="text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        "Lead intake",
                        "Reminder timing",
                        "Reschedule control",
                      ].map((item) => (
                        <div key={item} className="rounded-[1.25rem] border border-white/8 bg-background/35 px-4 py-3 backdrop-blur">
                          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="problem" className="section-padding pt-10">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="Why teams feel overloaded"
                title="The operational chaos is rarely the service. It is everything around the appointment."
                copy="The strongest service businesses are usually not held back by demand. They are held back by the admin load that sits between inquiry, booking, reminder, follow-up, and reschedule."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4 md:grid-cols-3">
                {homePains.map((card, index) => (
                  <Reveal key={card.title} delay={index * 0.06}>
                    <article className="surface-panel h-full p-6">
                      <card.icon size={18} className="text-primary" />
                      <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.copy}</p>
                    </article>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.18}>
                <aside className="surface-panel h-full p-6 md:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">What changes with VANTORY</p>
                  <div className="premium-rule my-6" />
                  <div className="space-y-5">
                    {[
                      "Requests are organized before staff even open the day.",
                      "Reminder windows become part of the system, not a mental checklist.",
                      "Reschedules stop creating a chain reaction across the calendar.",
                      "Follow-up happens while interest is still warm.",
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle2 size={18} className="mt-1 shrink-0 text-primary" />
                        <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-padding">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="How it works"
                title="Three deliberate steps. No messy rollout."
                copy="The implementation stays simple: connect the workflow, define how your business runs, and let VANTORY support the repeatable operational work."
                align="center"
              />
            </Reveal>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {homeSteps.map((step, index) => (
                <Reveal key={step.title} delay={index * 0.08}>
                  <article className="surface-panel relative h-full p-6 md:p-8">
                    <span className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                      0{index + 1}
                    </span>
                    <step.icon size={20} className="mt-6 text-primary" />
                    <h3 className="mt-8 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{step.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="section-padding pt-8">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="What it handles"
                title="A cleaner, more productized workflow across the moments that matter most."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {homeOutcomes.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <article className="surface-panel h-full p-6">
                    <item.icon size={18} className="text-primary" />
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {featureGroups.map((group, index) => (
                <Reveal key={group.heading} delay={index * 0.08}>
                  <article className="surface-panel h-full p-6 md:p-8">
                    <p className="font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">{group.heading}</p>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{group.description}</p>
                    <div className="mt-8 space-y-4">
                      {group.features.map((feature) => (
                        <div key={feature.title} className="rounded-[1.25rem] border border-border/70 bg-background/35 p-4">
                          <div className="flex items-center gap-3">
                            <feature.icon size={16} className="text-primary" />
                            <p className="font-semibold text-foreground">{feature.title}</p>
                          </div>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.copy}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.12}>
              <div className="mt-10 surface-panel p-6 md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Coordinated specialist roles
                    </p>
                    <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                      VANTORY can expand beyond scheduling when the business needs it.
                    </p>
                  </div>
                  <Link to="/ai-employees" className="marketing-link">
                    Explore AI roles
                    <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {roleDirectory.map((role) => (
                    <Link
                      key={role.slug}
                      to={`/ai-employees/${role.slug}`}
                      className="rounded-[1.25rem] border border-border/70 bg-background/35 p-5 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <role.icon size={18} className="text-primary" />
                      <p className="mt-5 font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                        {role.title}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{role.copy}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="workflow" className="section-padding">
          <div className="site-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <SectionIntro
                kicker="A day in the workflow"
                title="The day feels different when the operational rhythm does not depend on someone remembering every touchpoint."
                copy="Instead of manually stitching together inquiry, booking, reminder, and follow-up, the workflow advances in the background while your team stays focused on service."
              />
            </Reveal>

            <div className="space-y-4">
              {workflowMoments.map((moment, index) => (
                <Reveal key={moment.time} delay={index * 0.06}>
                  <article className="surface-panel grid gap-4 p-5 md:grid-cols-[92px_1fr] md:p-6">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">{moment.time}</p>
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                        {moment.title}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{moment.copy}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="industries" className="section-padding pt-8">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="Who it is built for"
                title="Made for businesses where availability, responsiveness, and repeat bookings drive growth."
                copy="The strongest fit is any team that wins on speed, consistency, and a calm booking experience."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {industryCards.map((industry, index) => (
                <Reveal key={industry.title} delay={index * 0.06}>
                  <article className="surface-panel overflow-hidden">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <img
                        src={industry.image}
                        alt={industry.title}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-72 transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,hsl(222_31%_7%/0.1)_30%,hsl(222_31%_7%/0.92))]" />
                    </div>
                    <div className="relative -mt-20 p-6 md:p-8">
                      <div className="inline-flex rounded-full border border-white/10 bg-background/45 p-3 text-primary backdrop-blur">
                        <industry.icon size={18} />
                      </div>
                      <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                        {industry.title}
                      </p>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{industry.copy}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="site-container grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <Reveal>
              <SectionIntro
                kicker="Operator perspective"
                title="Proof, framed around the work buyers actually care about."
                copy="The repo did not include hard customer case studies, so the proof section is grounded in the operational outcomes appointment-based teams consistently want: faster response, better reminder timing, and cleaner follow-up."
              />
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              {operatorVoices.map((voice, index) => (
                <Reveal key={voice.role} delay={index * 0.07}>
                  <article className="surface-panel h-full p-6">
                    <p className="font-display text-2xl leading-[1.2] tracking-[-0.05em] text-foreground">
                      “{voice.quote}”
                    </p>
                    <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {voice.role}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-padding">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="Pricing"
                title="Simple plans for the first stage of operational leverage."
                copy="Preserving the current package logic, but presenting it in a cleaner way. Start with the role count that matches your team and expand as the workflow gets more sophisticated."
                align="center"
              />
            </Reveal>

            {topPromo ? (
              <Reveal delay={0.08} className="mx-auto mt-6 flex max-w-max items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                Promo live: use <span className="mx-2 font-mono font-semibold text-emerald-200">{topPromo.code}</span> for launch pricing.
              </Reveal>
            ) : null}

            <Reveal delay={0.12} className="mt-10">
              <PricingGrid compact />
            </Reveal>
          </div>
        </section>

        <section id="faq" className="section-padding pt-8">
          <div className="site-container">
            <Reveal>
              <SectionIntro
                kicker="FAQ"
                title="Clear answers for owners evaluating fit."
                copy="The language stays practical because this product should feel like an operations upgrade, not a science project."
              />
            </Reveal>

            <Reveal delay={0.08} className="mt-10">
              <FaqAccordion items={faqItems} />
            </Reveal>
          </div>
        </section>

        <section id="final-cta" className="section-padding pt-10">
          <div className="site-container">
            <Reveal>
              <div className="surface-panel overflow-hidden p-8 md:p-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <span className="section-kicker">Final call</span>
                    <h2 className="section-title max-w-3xl">
                      Put a real operational layer behind every appointment, not just another dashboard.
                    </h2>
                    <p className="section-copy mt-5 max-w-2xl">
                      VANTORY is at its best when speed, calendar accuracy, reminder timing, and follow-up all directly
                      affect revenue. If that sounds like your business, this is where the site should convert.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Link to="/auth" className="btn-glow">
                      Get Started
                      <ArrowRight size={16} />
                    </Link>
                    <button type="button" onClick={() => setDemoOpen(true)} className="btn-outline-glow">
                      Book a Demo
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
