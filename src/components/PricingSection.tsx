import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { PACKAGES, PACKAGE_ORDER } from "@/lib/packages";
import { useActivePromos, getDiscountForPlan, applyDiscount, type PromoCode } from "@/hooks/useActivePromos";
import PromoCodeInput from "@/components/PromoCodeInput";

const PricingSection = () => {
  const plans = PACKAGE_ORDER.map((key) => PACKAGES[key]);
  const { pricingPromos } = useActivePromos();
  const topPromo = pricingPromos[0] || null;
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const activePromo = appliedPromo;

  return (
    <section id="pricing" className="section-padding">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Simple Pricing for Your First AI Team</h2>
          {topPromo && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-sm text-emerald-400">
              <Tag size={14} />
              Use <span className="font-mono font-bold">{topPromo.code}</span> at checkout to save
              {topPromo.discount_type === "percentage"
                ? ` ${topPromo.discount_value}%`
                : ` $${topPromo.discount_value}`}
              {topPromo.first_billing_cycle_only && <span className="text-emerald-400/70 text-xs ml-1">(first month only)</span>}
            </div>
          )}
        </motion.div>

        {/* Promo code input */}
        <div className="mx-auto max-w-xs mb-8">
          <PromoCodeInput
            onApply={setAppliedPromo}
            onClear={() => setAppliedPromo(null)}
            appliedPromo={appliedPromo}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isPopular = plan.key === "growth";
            const priceNum = parseInt(plan.price.replace("$", ""));
            const discount = activePromo ? getDiscountForPlan(activePromo, plan.key) : 0;
            const hasDiscount = discount > 0;
            const discountedPrice = hasDiscount ? applyDiscount(priceNum, discount, activePromo!.discount_type) : priceNum;

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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold" style={{ background: "hsl(38 80% 55%)", color: "hsl(225 25% 3%)" }}>Most Popular</span>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-5">
                  {hasDiscount ? (
                    <>
                      <span className="font-display text-2xl font-bold text-muted-foreground line-through mr-2">{plan.price}</span>
                      <span className="font-display text-4xl font-bold text-foreground">${Math.round(discountedPrice)}</span>
                    </>
                  ) : (
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  )}
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                  {hasDiscount && activePromo?.first_billing_cycle_only && (
                    <p className="mt-1 text-xs text-emerald-400/70">First month only · then {plan.price}/mo</p>
                  )}
                  {plan.trialDays && (
                    <p className="mt-3 flex items-center gap-2 text-base font-semibold text-emerald-400">
                      <Check size={20} className="text-emerald-400" />
                      {plan.trialDays}-day free trial
                    </p>
                  )}
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
