import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PACKAGES, PACKAGE_ORDER, getPackageByPriceId } from "@/lib/packages";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { toast } from "@/hooks/use-toast";
import {
  Crown, CheckCircle2, ArrowLeft, ArrowRight, Share2, Mail,
  Headphones, CalendarCheck, Sparkles, Zap, Shield, Star,
  AlertTriangle, Loader2,
} from "lucide-react";

const planIcons: Record<string, typeof Star> = {
  starter: Star,
  growth: Zap,
  team: Crown,
};

const planGradients: Record<string, string> = {
  starter: "linear-gradient(135deg, hsl(217 91% 60% / 0.08), transparent)",
  growth: "linear-gradient(135deg, hsl(160 60% 45% / 0.08), transparent)",
  team: "linear-gradient(135deg, hsl(280 70% 65% / 0.08), transparent)",
};

const planBorderColors: Record<string, string> = {
  starter: "border-blue-500/20",
  growth: "border-emerald-500/20",
  team: "border-violet-500/20",
};

const planAccentColors: Record<string, string> = {
  starter: "text-blue-400",
  growth: "text-emerald-400",
  team: "text-violet-400",
};

const planBgColors: Record<string, string> = {
  starter: "bg-blue-500/10",
  growth: "bg-emerald-500/10",
  team: "bg-violet-500/10",
};

const roleIcons = [Share2, Mail, Headphones, CalendarCheck];

const ChangePlanPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { syncSubscription } = useSubscriptionSync();
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);

  const currentPackageKey = profile?.active_package || "free";
  const currentPkg = PACKAGES[currentPackageKey];

  const handleSelectPlan = async (planKey: string) => {
    const pkg = PACKAGES[planKey];
    if (!pkg || planKey === currentPackageKey) return;

    setSwitchingPlan(planKey);
    try {
      // Try plan switch (updates existing subscription in-place)
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: pkg.stripePriceId, isPlanSwitch: true },
      });
      if (error) throw error;

      if (data?.switched) {
        // Successful in-place switch — sync and redirect
        toast({
          title: "Plan Updated!",
          description: `You've been switched to the ${pkg.name} plan. Changes take effect immediately.`,
        });
        await syncSubscription({ retries: 3, delayMs: 2000 });
        navigate("/subscription-details");
      } else if (data?.url) {
        // Fallback to checkout (new customer or no existing sub)
        window.location.href = data.url;
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not switch plans. Please try again.",
        variant: "destructive",
      });
      setSwitchingPlan(null);
    }
  };

  const getPlanRelation = (planKey: string): "current" | "upgrade" | "downgrade" => {
    if (planKey === currentPackageKey) return "current";
    const currentIdx = PACKAGE_ORDER.indexOf(currentPackageKey);
    const targetIdx = PACKAGE_ORDER.indexOf(planKey);
    return targetIdx > currentIdx ? "upgrade" : "downgrade";
  };

  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Link
              to="/subscription-details"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft size={12} /> Back to Subscription Details
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Change Your Plan
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {currentPkg
                ? <>You're currently on the <span className="font-semibold text-foreground">{currentPkg.name}</span> plan at <span className="font-semibold text-foreground">{currentPkg.price}/mo</span>. Select a new plan below.</>
                : "Select a plan to get started."}
            </p>
          </motion.div>

          {/* How it works notice */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">How plan switching works</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When you switch plans, your subscription is updated instantly. Your new plan takes effect immediately, and any difference in cost is prorated on your next bill. You won't be double-charged — your old plan is replaced automatically.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Plan Cards */}
          <div className="space-y-4">
            {PACKAGE_ORDER.map((key, i) => {
              const pkg = PACKAGES[key];
              const relation = getPlanRelation(key);
              const isCurrent = relation === "current";
              const PlanIcon = planIcons[key] || Star;
              const isLoading = switchingPlan === key;
              const isDisabled = switchingPlan !== null;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border ${isCurrent ? `${planBorderColors[key]} ring-1 ring-primary/20` : "border-border/30"} transition-all ${!isCurrent && !isDisabled ? "hover:border-border/50" : ""}`}
                  style={{ background: isCurrent ? planGradients[key] : undefined }}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(262 60% 58%))" }} />
                  )}

                  <div className="p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${planBgColors[key]} ${planAccentColors[key]}`}>
                          <PlanIcon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <h3 className="font-display text-lg font-bold text-foreground">{pkg.name}</h3>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                <CheckCircle2 size={9} /> Current
                              </span>
                            )}
                            {relation === "upgrade" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                Upgrade
                              </span>
                            )}
                            {relation === "downgrade" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Downgrade
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {pkg.features.slice(0, 4).map((feat, fi) => (
                              <div key={fi} className="flex items-center gap-1.5">
                                <CheckCircle2 size={10} className={isCurrent ? "text-primary" : "text-muted-foreground/40"} />
                                <span className="text-[11px] text-muted-foreground">{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center gap-1.5">
                            {roleIcons.slice(0, pkg.maxRoles).map((Icon, ri) => (
                              <div key={ri} className={`flex h-6 w-6 items-center justify-center rounded-md ${planBgColors[key]} ${planAccentColors[key]}`}>
                                <Icon size={11} />
                              </div>
                            ))}
                            <span className="text-[11px] text-muted-foreground ml-1">
                              {pkg.maxRoles} AI employee{pkg.maxRoles !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-display text-2xl font-bold text-foreground">{pkg.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>

                        {isCurrent ? (
                          <span className="text-xs text-muted-foreground/50 font-medium">Active</span>
                        ) : (
                          <button
                            onClick={() => handleSelectPlan(key)}
                            disabled={isLoading || isDisabled}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
                              relation === "upgrade"
                                ? "text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg"
                                : "border border-border/40 bg-background/60 text-foreground hover:bg-secondary/60"
                            }`}
                            style={relation === "upgrade" ? {
                              background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))",
                              boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)",
                            } : undefined}
                          >
                            {isLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                {relation === "upgrade" ? "Upgrade" : "Switch"} <ArrowRight size={13} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info notes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="flex items-start gap-2.5 rounded-xl border border-border/15 bg-background/20 px-4 py-3">
              <Shield size={12} className="shrink-0 text-muted-foreground/35 mt-0.5" />
              <p className="text-[11px] text-muted-foreground/45 leading-relaxed">
                We do not offer refunds, but you may cancel your subscription at any time. Your access will remain active until the end of the current billing period.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ChangePlanPage;
