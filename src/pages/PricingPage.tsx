import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, Tag } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PromoCodeInput from "@/components/PromoCodeInput";
import CheckoutFailedBanner from "@/components/CheckoutFailedBanner";
import { useAuth } from "@/hooks/useAuth";
import { PACKAGES, PACKAGE_ORDER } from "@/lib/packages";
import { useActivePromos, type PromoCode } from "@/hooks/useActivePromos";
import { resolvePromoRules } from "@/lib/promoRules";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PricingPage = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const { pricingPromos } = useActivePromos();

  const checkoutStatus = searchParams.get("checkout");
  const returnedPlan = searchParams.get("plan");
  const returnedPromo = searchParams.get("promo");
  const declineReason = searchParams.get("reason");

  // Auto-apply promo code from URL (returned after failed checkout)
  useEffect(() => {
    if (returnedPromo && !appliedPromo) {
      // Trigger promo lookup — the PromoCodeInput will handle validation
      // We set a flag so the input pre-fills with the code
    }
  }, [returnedPromo, appliedPromo]);

  const handleDismissFailure = useCallback(() => {
    // Clean up URL params without reloading
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("checkout");
    newParams.delete("reason");
    newParams.delete("plan");
    newParams.delete("promo");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);
  const topPromo = pricingPromos[0] || null;

  const handleSelectPlan = async (planKey: string) => {
    if (!user) return;
    const pkg = PACKAGES[planKey];
    if (!pkg) return;

    // Clear any failure state when retrying
    handleDismissFailure();

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

  return (
    <PageLayout>
      <section className="section-padding blue-ambient pb-8 md:pb-16">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-5xl">
              Simple Pricing for Your <span className="gradient-text">Digital Team</span>
            </h1>
            <p className="mx-auto mt-3 md:mt-5 max-w-xl text-sm md:text-base text-muted-foreground">
              Start small, scale when ready. Every plan includes full access.
            </p>
            {topPromo && !appliedPromo && (
              <div className="mt-3 inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs md:text-sm text-emerald-400">
                <Tag size={12} className="md:w-[14px] md:h-[14px]" />
                Code "<span className="font-mono font-bold text-sm md:text-base">{topPromo.code}</span>" saves
                {topPromo.discount_type === "percentage"
                  ? ` ${topPromo.discount_value}%`
                  : ` $${topPromo.discount_value}`}
                {topPromo.first_billing_cycle_only && <span className="text-emerald-400/70 text-[10px] md:text-xs ml-1">(first month)</span>}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1200px]">
          {/* Checkout failure banner */}
          {checkoutStatus === "cancelled" && (
            <div className="mb-6">
              <CheckoutFailedBanner
                reason={declineReason}
                onRetry={returnedPlan ? () => handleSelectPlan(returnedPlan) : undefined}
                onDismiss={handleDismissFailure}
              />
            </div>
          )}

          {/* Promo code input */}
          <div className="mx-auto max-w-xs mb-5 md:mb-8">
            <PromoCodeInput
              onApply={setAppliedPromo}
              onClear={() => setAppliedPromo(null)}
              appliedPromo={appliedPromo}
              initialCode={returnedPromo || undefined}
            />
          </div>

          <div className="grid gap-4 md:gap-8 md:grid-cols-3">
            {plans.map((plan, i) => {
              const isPopular = plan.key === "growth";
              const isLoading = loadingPlan === plan.key;
              const resolved = resolvePromoRules(appliedPromo as any, plan.key);

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-xl md:rounded-2xl border p-5 md:p-8 transition-all duration-300 ${
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
                    {resolved.hasDiscount ? (
                      <>
                        <span className="font-display text-2xl font-bold text-muted-foreground line-through mr-2">{plan.price}</span>
                        <span className="font-display text-4xl font-bold text-foreground">${resolved.discountedPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                    )}
                    <span className="text-sm text-muted-foreground">{plan.period}</span>

                    {/* Billing journey timeline — driven by rules engine */}
                    <div className="mt-4 space-y-2 rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                      {/* Trial line */}
                      {resolved.removeTrial ? (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          <span className="text-amber-400 font-medium">No free trial — billing starts immediately</span>
                        </div>
                      ) : resolved.trialDays > 0 ? (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 font-medium">Free for {resolved.trialDays} days</span>
                        </div>
                      ) : null}

                      {/* Billing delay */}
                      {resolved.billingDelayDays > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                          <span className="text-blue-400 font-medium">First payment delayed by {resolved.billingDelayDays} days</span>
                        </div>
                      )}

                      {/* Discounted period */}
                      {resolved.hasDiscount && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span className="text-foreground">
                            {resolved.isRecurringDiscount
                              ? <><span className="font-semibold">${resolved.discountedPrice.toFixed(2)}/mo</span> ongoing</>
                              : resolved.isFirstCycleOnly
                                ? <><span className="font-semibold">${resolved.discountedPrice.toFixed(2)}</span> first {resolved.trialDays > 0 ? "paid " : ""}month</>
                                : resolved.discountDurationMonths && resolved.discountDurationMonths > 1
                                  ? <><span className="font-semibold">${resolved.discountedPrice.toFixed(2)}/mo</span> for {resolved.discountDurationMonths} months</>
                                  : <>Then <span className="font-semibold">${resolved.discountedPrice.toFixed(2)}/mo</span> ongoing</>
                            }
                          </span>
                        </div>
                      )}

                      {/* Normal price after discount ends */}
                      {resolved.hasDiscount && (resolved.isFirstCycleOnly || (resolved.discountDurationMonths && resolved.discountDurationMonths > 0 && !resolved.isRecurringDiscount)) && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                          <span className="text-muted-foreground">Then renews at {plan.price}/mo</span>
                        </div>
                      )}

                      {/* Default: no promo, just show post-trial price */}
                      {!resolved.hasDiscount && !resolved.removeTrial && resolved.trialDays > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                          <span className="text-muted-foreground">Then {plan.price}/mo after trial</span>
                        </div>
                      )}
                    </div>
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
                      {isLoading
                        ? <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        : resolved.removeTrial || resolved.trialDays === 0
                          ? "Get Started"
                          : `Start ${resolved.trialDays}-Day Free Trial`}
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
