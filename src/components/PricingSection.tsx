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
      <div className="mx-auto max-w-[1600px] px-0 md:px-12 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 md:mb-14 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">Simple Pricing for Your First AI Team</h2>
          {topPromo && (
            <div className="mt-3 md:mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 md:px-4 py-1.5 text-xs md:text-sm text-emerald-400">
              <Tag size={14} />
              Use code "<span className="font-mono font-bold text-base">{topPromo.code}</span>" at checkout to save
              {topPromo.discount_type === "percentage"
                ? ` ${topPromo.discount_value}%`
                : ` $${topPromo.discount_value}`}
              {topPromo.first_billing_cycle_only && <span className="text-emerald-400/70 text-xs ml-1">(first month only)</span>}
            </div>
          )}
        </motion.div>

        {/* Promo code input */}
        <div className="mx-auto max-w-xs mb-6 md:mb-8">
          <PromoCodeInput
            onApply={setAppliedPromo}
            onClear={() => setAppliedPromo(null)}
            appliedPromo={appliedPromo}
          />
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3">
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
                className={`relative rounded-xl md:rounded-2xl border p-5 md:p-6 transition-all duration-300 ${isPopular ? "border-primary/40 bg-card" : "border-border/50 bg-card"}`}
                style={isPopular ? { boxShadow: "0 0 40px hsl(217 91% 60% / 0.1)" } : {}}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold" style={{ background: "hsl(38 80% 55%)", color: "hsl(225 25% 3%)" }}>Most Popular</span>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 md:mt-5">
                  {hasDiscount ? (
                    <>
                      <span className="font-display text-2xl font-bold text-muted-foreground line-through mr-2">{plan.price}</span>
                      <span className="font-display text-4xl font-bold text-foreground">${discountedPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  )}
                  <span className="text-sm text-muted-foreground">{plan.period}</span>

                  {/* Billing journey timeline */}
                  <div className="mt-4 space-y-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5">
                    {plan.trialDays && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 font-medium">Free for {plan.trialDays} days</span>
                      </div>
                    )}
                    {hasDiscount && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span className="text-foreground">
                          {activePromo?.first_billing_cycle_only
                            ? <>Then <span className="font-semibold">${discountedPrice.toFixed(2)}</span> first {plan.trialDays ? "paid " : ""}month</>
                            : <>Then <span className="font-semibold">${discountedPrice.toFixed(2)}/mo</span> ongoing</>
                          }
                        </span>
                      </div>
                    )}
                    {hasDiscount && activePromo?.first_billing_cycle_only && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                        <span className="text-muted-foreground">Then renews at {plan.price}/mo</span>
                      </div>
                    )}
                    {!hasDiscount && plan.trialDays && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                        <span className="text-muted-foreground">Then {plan.price}/mo after trial</span>
                      </div>
                    )}
                  </div>
                </div>
                <ul className="mt-4 md:mt-6 space-y-2.5 md:space-y-3">
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
