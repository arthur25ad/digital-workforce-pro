import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import {
  featureGroups,
  homeOutcomes,
  roleDirectory,
} from "@/content/marketing";

const platformLayers = [
  {
    title: "Intake layer",
    copy: "Capture requests clearly before they fragment across channels.",
  },
  {
    title: "Calendar layer",
    copy: "Keep appointment logic, availability, and reminders consistent.",
  },
  {
    title: "Follow-up layer",
    copy: "Stay close to warm leads, pending bookings, and post-appointment communication.",
  },
];

export default function FeaturesPage() {
  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="Capabilities"
              title="Everything VANTORY needs to run the booking-side of your operation with real discipline."
              copy="The product is not trying to be a generic AI toolkit. It is built around operational work that directly affects appointments, response time, and follow-up consistency."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {platformLayers.map((layer, index) => (
              <Reveal key={layer.title} delay={index * 0.06}>
                <article className="surface-panel h-full p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Layer 0{index + 1}
                  </p>
                  <h2 className="mt-6 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                    {layer.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{layer.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-4">
        <div className="site-container grid gap-4 lg:grid-cols-2">
          {featureGroups.map((group, index) => (
            <Reveal key={group.heading} delay={index * 0.06}>
              <article className="surface-panel h-full p-6 md:p-8">
                <p className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">{group.heading}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{group.description}</p>

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
      </section>

      <section className="section-padding pt-4">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="Outcome set"
              title="The platform is judged by what it helps teams stop dropping."
              copy="These are the operational outcomes the product is built to improve first."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {homeOutcomes.map((outcome, index) => (
              <Reveal key={outcome.title} delay={index * 0.05}>
                <article className="surface-panel h-full p-6">
                  <outcome.icon size={18} className="text-primary" />
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                    {outcome.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{outcome.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-4">
        <div className="site-container">
          <Reveal>
            <div className="surface-panel p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <span className="section-kicker">Specialist roles</span>
                  <h2 className="section-title max-w-3xl">
                    VANTORY can coordinate dedicated roles when the workflow expands beyond the calendar.
                  </h2>
                </div>
                <Link to="/ai-employees" className="marketing-link">
                  See role details
                  <ArrowRight size={16} />
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
    </PageLayout>
  );
}
