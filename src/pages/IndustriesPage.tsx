import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import { detailedIndustries, industryCards } from "@/content/marketing";

export default function IndustriesPage() {
  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="Industries"
              title="Purpose-built for businesses where booked time is the business."
              copy="The strongest fit is any operator whose revenue depends on a responsive intake flow, a clean calendar, and consistent reminder and follow-up timing."
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
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,hsl(222_31%_7%/0.16)_25%,hsl(222_31%_7%/0.92))]" />
                  </div>
                  <div className="relative -mt-20 p-6 md:p-8">
                    <div className="inline-flex rounded-full border border-white/10 bg-background/45 p-3 text-primary backdrop-blur">
                      <industry.icon size={18} />
                    </div>
                    <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                      {industry.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{industry.copy}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding pt-4">
        <div className="site-container grid gap-4 lg:grid-cols-2">
          {detailedIndustries.map((industry, index) => (
            <Reveal key={industry.title} delay={index * 0.05}>
              <article className="surface-panel h-full p-6 md:p-8">
                <industry.icon size={18} className="text-primary" />
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                  {industry.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{industry.copy}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {industry.bullets.map((bullet) => (
                    <span key={bullet} className="pill-muted">
                      {bullet}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 surface-panel p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="section-kicker">Fit check</span>
                <h2 className="section-title max-w-3xl">
                  If a missed reminder or a slow response directly affects revenue, VANTORY is in the right neighborhood.
                </h2>
              </div>
              <Link to="/pricing" className="marketing-link">
                See plan options
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </PageLayout>
  );
}
