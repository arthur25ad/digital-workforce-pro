import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PageLayout from "@/components/PageLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import { faqItems } from "@/content/marketing";

export default function FAQPage() {
  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="FAQ"
              title="Straight answers for operators comparing options."
              copy="The site should reduce uncertainty, not create more of it. These answers are intentionally practical and tied to real operational concerns."
            />
          </Reveal>

          <Reveal delay={0.08} className="mt-10">
            <FaqAccordion items={faqItems} />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-10 surface-panel p-8 text-center md:p-10">
              <p className="font-display text-3xl font-semibold tracking-[-0.07em] text-foreground">
                Ready to see whether the workflow fits your business?
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                The fastest next step is to compare plans or start the guided setup and map VANTORY to your existing appointment flow.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/pricing" className="btn-outline-glow">
                  View Pricing
                </Link>
                <Link to="/get-started" className="btn-glow">
                  Get Started
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
