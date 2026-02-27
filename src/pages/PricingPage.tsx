import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Loader2, Tag } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PromoCodeInput from "@/components/PromoCodeInput";
import { useAuth } from "@/hooks/useAuth";
import { PACKAGES, PACKAGE_ORDER } from "@/lib/packages";
import { useActivePromos, getDiscountForPlan, applyDiscount, type PromoCode } from "@/hooks/useActivePromos";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PricingPage = () => {
  const { user, profile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const { pricingPromos } = useActivePromos();
  const topPromo = pricingPromos[0] || null;

  const handleSelectPlan = async (planKey: string) => {
    if (!user) return;
    const pkg = PACKAGES[planKey];
    if (!pkg) return;

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: pkg.stripePriceId,
          promoCode: appliedPromo?.code || null,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to open billing portal", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = PACKAGE_ORDER.map((key) => PACKAGES[key]);
  const activePromo = appliedPromo;

  return (
    <PageLayout>
      <section className="section-padding blue-ambient pb-12 md:pb-16">
        <div className="mx-auto max-w-[1600px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Simple Pricing for Your <span className="gradient-text">Digital Team</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Start small, scale when you're ready. Every plan includes full platform access.
            </p>
            {topPromo && !appliedPromo && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-sm text-emerald-400">
                <Tag size={14} />
                Use <span className="font-mono font-bold">{topPromo.code}</span> to save
                {topPromo.first_billing_cycle_only && <span className="text-xs ml-1">(first month only)</span>}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1200px]">
          {/* Promo code input */}
          <div className="mx-auto max-w-xs mb-8">
            <PromoCodeInput
              onApply={setAppliedPromo}
              onClear={() => setAppliedPromo(null)}
              appliedPromo={appliedPromo}
            />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, i) => {
              const isPopular = plan.key === "growth";
              const isLoading = loadingPlan === plan.key;
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
                  className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                    isPopular ? "border-primary/40 bg-card" : "border-border/50 bg-card"
                  }`}
                  style={isPopular ? { boxShadow: "0 0 40px hsl(217 91% 60% / 0.1)" } : {}}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">Most Popular</span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6">
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
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={16} className="shrink-0 text-primary" /> {f}</li>
                    ))}
                  </ul>
                  {user ? (
                    <button
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={isLoading}
                      className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                        isPopular ? "btn-glow" : "btn-outline-glow"
                      }`}>
                      {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : plan.trialDays ? `Start ${plan.trialDays}-Day Free Trial` : "Subscribe"}
                    </button>
                  ) : (
                    <Link to="/auth"
                      className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all duration-300 ${
                        isPopular ? "btn-glow" : "btn-outline-glow"
                      }`}>
                      Get Started
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>

          {user && (
            <div className="mt-8 text-center">
              <button
                onClick={handleManageSubscription}
                disabled={loadingPlan === "manage"}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {loadingPlan === "manage" ? "Opening..." : "Manage existing subscription →"}
              </button>
            </div>
          )}

          <p className="mt-12 text-center text-sm text-muted-foreground/60">
            Need a custom setup? <Link to="/auth" className="text-primary hover:underline">Contact us</Link> for a tailored implementation plan.
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default PricingPage;
