import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { PACKAGES, PACKAGE_ORDER } from "@/lib/packages";

const PricingSection = () => {
  const plans = PACKAGE_ORDER.map((key) => PACKAGES[key]);

  return (
    <section id="pricing" className="section-padding">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Simple Pricing for Your First AI Team</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isPopular = plan.key === "growth";
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 transition-all duration-300 ${isPopular ? "border-primary/40 bg-card" : "border-border/50 bg-card"}`}
                style={isPopular ? { boxShadow: "0 0 40px hsl(217 91% 60% / 0.1)" } : {}}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">Most Popular</span>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={16} className="text-primary" />{f}</li>
                  ))}
                </ul>
                <Link to="/pricing" className={`mt-6 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${isPopular ? "btn-glow" : "btn-outline-glow"}`}>
                  Get Started
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
