import { useCallback, useState } from "react";
import { ArrowRight, Loader2, Tag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import CheckoutFailedBanner from "@/components/CheckoutFailedBanner";
import PageLayout from "@/components/PageLayout";
import PricingGrid from "@/components/marketing/PricingGrid";
import Reveal from "@/components/marketing/Reveal";
import SectionIntro from "@/components/marketing/SectionIntro";
import PromoCodeInput from "@/components/PromoCodeInput";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useActivePromos, type PromoCode } from "@/hooks/useActivePromos";
import { supabase } from "@/integrations/supabase/client";
import { PACKAGES } from "@/lib/packages";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const { pricingPromos } = useActivePromos();

  const checkoutStatus = searchParams.get("checkout");
  const returnedPlan = searchParams.get("plan");
  const returnedPromo = searchParams.get("promo");
  const declineReason = searchParams.get("reason");
  const topPromo = pricingPromos[0] ?? null;

  const handleDismissFailure = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("checkout");
    newParams.delete("reason");
    newParams.delete("plan");
    newParams.delete("promo");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSelectPlan = async (planKey: string) => {
    if (!user) return;
    const pkg = PACKAGES[planKey];
    if (!pkg) return;

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
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout right now.",
        variant: "destructive",
      });
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
    } catch (error: any) {
      toast({
        title: "Portal unavailable",
        description: error.message || "Unable to open billing portal right now.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <PageLayout>
      <section className="section-padding">
        <div className="site-container">
          <Reveal>
            <SectionIntro
              kicker="Pricing"
              title="Keep the package logic. Remove the noise around it."
              copy="The underlying plan and promo system is preserved. The page is rebuilt to make the offer easier to scan, compare, and act on."
            />
          </Reveal>

          {topPromo && !appliedPromo ? (
            <Reveal delay={0.06}>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                <Tag size={14} />
                Use <span className="font-mono font-semibold text-emerald-100">{topPromo.code}</span>
                for current launch pricing.
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={0.08}>
            <div className="mt-10 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
              <aside className="surface-panel h-fit p-6 md:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">What changes by plan</p>
                <div className="premium-rule my-6" />
                <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                  <p>Starter gives a solo operator a first role and a clean place to begin.</p>
                  <p>Growth is the strongest fit for teams running multiple operational touchpoints at once.</p>
                  <p>Team unlocks the full coordinated system for businesses ready to run VANTORY across the stack.</p>
                </div>

                <div className="mt-8">
                  <PromoCodeInput
                    onApply={setAppliedPromo}
                    onClear={() => setAppliedPromo(null)}
                    appliedPromo={appliedPromo}
                    initialCode={returnedPromo || undefined}
                  />
                </div>

                {user ? (
                  <div className="mt-8 rounded-[1.25rem] border border-border/70 bg-background/35 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Current package</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">
                      {profile?.active_package ? profile.active_package.toUpperCase() : "No active subscription"}
                    </p>
                    <button
                      type="button"
                      onClick={handleManageSubscription}
                      disabled={loadingPlan === "manage"}
                      className="btn-outline-glow mt-5 w-full"
                    >
                      {loadingPlan === "manage" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Opening Portal
                        </>
                      ) : (
                        "Manage Subscription"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[1.25rem] border border-border/70 bg-background/35 p-4">
                    <p className="text-sm leading-7 text-muted-foreground">
                      Sign in to start checkout directly, or compare the plans first and decide what level of operational support fits your team.
                    </p>
                    <Link to="/auth" className="btn-glow mt-5 w-full">
                      Log In to Continue
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </aside>

              <div>
                {checkoutStatus === "cancelled" ? (
                  <div className="mb-4">
                    <CheckoutFailedBanner
                      reason={declineReason}
                      onRetry={returnedPlan ? () => handleSelectPlan(returnedPlan) : undefined}
                      onDismiss={handleDismissFailure}
                    />
                  </div>
                ) : null}

                <PricingGrid
                  appliedPromo={appliedPromo}
                  loadingPlan={loadingPlan}
                  onSelectPlan={handleSelectPlan}
                  signedIn={Boolean(user)}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  );
}
