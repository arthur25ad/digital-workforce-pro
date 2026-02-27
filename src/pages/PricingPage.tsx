import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const plans = [
  { name: "Starter", price: "$49", period: "/mo", key: "Starter", description: "Good for solo operators", features: ["1 AI employee", "Basic workflows", "Email support", "Standard setup"], popular: false },
  { name: "Growth", price: "$129", period: "/mo", key: "Growth", description: "Best for growing businesses", features: ["3 AI employees", "Multi-role support", "Priority setup", "Custom workflows", "Platform integrations"], popular: true },
  { name: "Team", price: "$299", period: "/mo", key: "Team", description: "Best for operational scale", features: ["Full AI team", "Cross-functional workflows", "Dedicated support", "Advanced integrations", "Custom reporting"], popular: false },
];

const PricingPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient pb-12 md:pb-16">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Simple Pricing for Your <span className="gradient-text">Digital Team</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Start small, scale when you're ready. Every plan includes full platform access.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="px-4 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                plan.popular ? "border-primary/40 bg-card" : "border-border/50 bg-card"
              }`}
              style={plan.popular ? { boxShadow: "0 0 40px hsl(217 91% 60% / 0.1)" } : {}}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">Most Popular</span>
              )}
              <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={16} className="shrink-0 text-primary" /> {f}</li>
                ))}
              </ul>
              <Link to={`/get-started?plan=${plan.key}`}
                className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${
                  plan.popular ? "btn-glow" : "btn-outline-glow"
                }`}>
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground/60">
          Need a custom setup? <Link to="/get-started" className="text-primary hover:underline">Contact us</Link> for a tailored implementation plan.
        </p>
      </div>
    </section>
  </PageLayout>
);

export default PricingPage;
