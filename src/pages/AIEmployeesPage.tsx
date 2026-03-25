import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PageLayout from "@/components/PageLayout";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import { roleDirectory } from "@/content/marketing";

export default function AIEmployeesPage() {
  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="AI roles"
              title="Specialist roles, coordinated under one operational system."
              copy="The public narrative now centers on VANTORY as an AI operations assistant. These roles still matter, but they work best as part of a coordinated workflow rather than a confusing menu of isolated features."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleDirectory.map((role, index) => (
              <Reveal key={role.slug} delay={index * 0.06}>
                <Link
                  to={`/ai-employees/${role.slug}`}
                  className="surface-panel block h-full p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <role.icon size={18} className="text-primary" />
                  <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.06em] text-foreground">
                    {role.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{role.copy}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    Explore role
                    <ArrowRight size={14} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
