import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PACKAGES, PACKAGE_ORDER, getPackageByPriceId } from "@/lib/packages";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
import { toast } from "@/hooks/use-toast";
import PromoCodeInput from "@/components/PromoCodeInput";
import type { PromoCode } from "@/hooks/useActivePromos";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Crown, CheckCircle2, ArrowLeft, ArrowRight, Share2, Mail,
  Headphones, CalendarCheck, Sparkles, Zap, Shield, Star,
  Loader2, AlertTriangle, Users,
} from "lucide-react";

const planIcons: Record<string, typeof Star> = { starter: Star, growth: Zap, team: Crown };

const planGradients: Record<string, string> = {
  starter: "linear-gradient(135deg, hsl(217 91% 60% / 0.08), transparent)",
  growth: "linear-gradient(135deg, hsl(160 60% 45% / 0.08), transparent)",
  team: "linear-gradient(135deg, hsl(280 70% 65% / 0.08), transparent)",
};

const planBorderColors: Record<string, string> = { starter: "border-blue-500/20", growth: "border-emerald-500/20", team: "border-violet-500/20" };
const planAccentColors: Record<string, string> = { starter: "text-blue-400", growth: "text-emerald-400", team: "text-violet-400" };
const planBgColors: Record<string, string> = { starter: "bg-blue-500/10", growth: "bg-emerald-500/10", team: "bg-violet-500/10" };

const roleIcons = [Share2, Mail, Headphones, CalendarCheck];

const planEmployees: Record<string, number> = { starter: 1, growth: 3, team: 4 };

function getDiscountedPrice(pkg: any, promo: PromoCode | null): string | null {
  if (!promo || !pkg) return null;
  const basePrice = parseInt(pkg.price.replace("$", ""));
  const planKey = pkg.key;
  const planDiscount = planKey === "starter" ? (promo.starter_discount || 0)
    : planKey === "growth" ? (promo.growth_discount || 0)
    : planKey === "team" ? (promo.team_discount || 0) : 0;
  const discount = planDiscount > 0 ? planDiscount : (planKey === "team" ? 0 : (promo.discount_value || 0));
  if (discount <= 0) return null;
  if ((promo.discount_type || "percentage") === "percentage") {
    const discounted = basePrice * (1 - discount / 100);
    return `$${discounted.toFixed(0)}`;
  }
  const discounted = basePrice - discount;
  return `$${Math.max(0, discounted).toFixed(0)}`;
}

const ChangePlanPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { syncSubscription } = useSubscriptionSync();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [switchResult, setSwitchResult] = useState<{ planKey: string; needsRoleReselection: boolean; maxRoles: number } | null>(null);

  const currentPackageKey = profile?.active_package || "free";
  const currentPkg = PACKAGES[currentPackageKey];

  const getPlanRelation = (planKey: string): "current" | "upgrade" | "downgrade" => {
    if (planKey === currentPackageKey) return "current";
    const currentIdx = PACKAGE_ORDER.indexOf(currentPackageKey);
    const targetIdx = PACKAGE_ORDER.indexOf(planKey);
    return targetIdx > currentIdx ? "upgrade" : "downgrade";
  };

  const handleClickPlan = (planKey: string) => {
    if (planKey === currentPackageKey || switchingPlan) return;
    setSelectedPlan(planKey);
    setShowConfirm(true);
  };

  const handleConfirmSwitch = async () => {
    if (!selectedPlan) return;
    const pkg = PACKAGES[selectedPlan];
    if (!pkg) return;

    setShowConfirm(false);
    setSwitchingPlan(selectedPlan);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: pkg.stripePriceId,
          isPlanSwitch: true,
          promoCode: appliedPromo?.code || undefined,
        },
      });
      if (error) throw error;

      if (data?.switched) {
        await syncSubscription({ retries: 3, delayMs: 2000 });
        setSwitchResult({
          planKey: data.newPlanKey,
          needsRoleReselection: data.needsRoleReselection,
          maxRoles: data.maxRoles,
        });
        setSwitchingPlan(null);
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Could not switch plans.", variant: "destructive" });
      setSwitchingPlan(null);
    }
  };

  // After switch success: show result and route user
  const handleContinueAfterSwitch = () => {
    if (switchResult?.needsRoleReselection) {
      navigate("/choose-roles");
    } else {
      navigate("/subscription-details");
    }
  };

  const selectedPkg = selectedPlan ? PACKAGES[selectedPlan] : null;
  const selectedRelation = selectedPlan ? getPlanRelation(selectedPlan) : null;
  const discountedPrice = selectedPkg ? getDiscountedPrice(selectedPkg, appliedPromo) : null;
  const currentRoleCount = profile?.unlocked_roles?.length || 0;
  const newMaxRoles = selectedPlan ? (planEmployees[selectedPlan] || 0) : 0;
  const wouldReduceRoles = selectedPlan && newMaxRoles < currentRoleCount;

  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl">
          {/* Success state */}
          {switchResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Plan Changed Successfully
              </h2>
              <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto leading-relaxed">
                You're now on the <span className="font-semibold text-foreground">{PACKAGES[switchResult.planKey]?.name || switchResult.planKey}</span> plan.
                Your billing and access have been updated immediately.
              </p>
              {switchResult.needsRoleReselection && (
                <div className="mx-auto max-w-md mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground mb-1">AI Employee selection required</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your new plan includes {switchResult.maxRoles} AI employee{switchResult.maxRoles !== 1 ? "s" : ""},
                        but you currently have {currentRoleCount} active.
                        Please choose which AI employee{switchResult.maxRoles !== 1 ? "s" : ""} to keep.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleContinueAfterSwitch}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))", boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)" }}
              >
                {switchResult.needsRoleReselection ? "Choose AI Employees" : "View Subscription Details"}
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {!switchResult && (
            <>
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <Link to="/subscription-details" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
                  <ArrowLeft size={12} /> Back to Subscription Details
                </Link>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Change Your Plan</h1>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {currentPkg
                    ? <>You're currently on the <span className="font-semibold text-foreground">{currentPkg.name}</span> plan at <span className="font-semibold text-foreground">{currentPkg.price}/mo</span>. Select a new plan below.</>
                    : "Select a plan to get started."}
                </p>
              </motion.div>

              {/* How it works notice */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">How plan switching works</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      When you switch plans, your subscription is updated instantly with prorated billing.
                      Your old plan is replaced automatically — you'll never be double-charged.
                      {currentPackageKey !== "free" && " You'll be asked to confirm before any changes are applied."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Promo code input */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
                <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Have a promo code?</p>
                  <PromoCodeInput
                    onApply={setAppliedPromo}
                    onClear={() => setAppliedPromo(null)}
                    appliedPromo={appliedPromo}
                  />
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
                  const promoPrice = getDiscountedPrice(pkg, appliedPromo);

                  return (
                    <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                      className={`relative overflow-hidden rounded-2xl border ${isCurrent ? `${planBorderColors[key]} ring-1 ring-primary/20` : "border-border/30"} transition-all ${!isCurrent && !isDisabled ? "hover:border-border/50" : ""}`}
                      style={{ background: isCurrent ? planGradients[key] : undefined }}>
                      {isCurrent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(262 60% 58%))" }} />}
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
                                {relation === "upgrade" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Upgrade</span>}
                                {relation === "downgrade" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">Downgrade</span>}
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
                                <span className="text-[11px] text-muted-foreground ml-1">{pkg.maxRoles} AI employee{pkg.maxRoles !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                            <div className="text-right">
                              {promoPrice && !isCurrent ? (
                                <>
                                  <span className="font-display text-2xl font-bold text-foreground">{promoPrice}</span>
                                  <span className="text-sm text-muted-foreground">/mo</span>
                                  <div className="text-xs text-muted-foreground/50 line-through">{pkg.price}/mo</div>
                                </>
                              ) : (
                                <>
                                  <span className="font-display text-2xl font-bold text-foreground">{pkg.price}</span>
                                  <span className="text-sm text-muted-foreground">/mo</span>
                                </>
                              )}
                            </div>
                            {isCurrent ? (
                              <span className="text-xs text-muted-foreground/50 font-medium">Active</span>
                            ) : (
                              <button onClick={() => handleClickPlan(key)} disabled={isLoading || isDisabled}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${relation === "upgrade" ? "text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg" : "border border-border/40 bg-background/60 text-foreground hover:bg-secondary/60"}`}
                                style={relation === "upgrade" ? { background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))", boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)" } : undefined}>
                                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <>{relation === "upgrade" ? "Upgrade" : "Switch"} <ArrowRight size={13} /></>}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6">
                <div className="flex items-start gap-2.5 rounded-xl border border-border/15 bg-background/20 px-4 py-3">
                  <Shield size={12} className="shrink-0 text-muted-foreground/35 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground/45 leading-relaxed">
                    We do not offer refunds, but you may cancel your subscription at any time. Your access will remain active until the end of the current billing period.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md border-border/40 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Confirm Plan Change</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Please review the details before switching.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Current → New */}
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
              <div className="rounded-xl border border-border/30 bg-background/40 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Current</p>
                <p className="font-display text-sm font-bold text-foreground">{currentPkg?.name || "Free"}</p>
                <p className="text-xs text-muted-foreground">{currentPkg?.price || "$0"}/mo</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground/30" />
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-primary/60 mb-1">New Plan</p>
                <p className="font-display text-sm font-bold text-foreground">{selectedPkg?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {discountedPrice ? (
                    <><span className="text-emerald-400 font-semibold">{discountedPrice}</span><span className="line-through ml-1 text-muted-foreground/40">{selectedPkg?.price}</span>/mo</>
                  ) : <>{selectedPkg?.price}/mo</>}
                </p>
              </div>
            </div>

            {/* Promo applied */}
            {appliedPromo && discountedPrice && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">Promo <span className="font-mono font-bold">{appliedPromo.code}</span> applied</span>
              </div>
            )}

            {/* Access impact */}
            {wouldReduceRoles && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-amber-400">Access change:</span> Your new plan includes {newMaxRoles} AI employee{newMaxRoles !== 1 ? "s" : ""}, but you have {currentRoleCount} active.
                    You'll need to choose which to keep after switching.
                  </p>
                </div>
              </div>
            )}

            {/* What happens */}
            <div className="rounded-lg border border-border/20 bg-background/40 px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                • Your subscription will be updated immediately<br/>
                • Billing is prorated — no double charge<br/>
                • Your old plan is replaced automatically
                {wouldReduceRoles && <><br/>• You'll choose your AI employee{newMaxRoles !== 1 ? "s" : ""} after confirming</>}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button onClick={() => setShowConfirm(false)} className="rounded-xl border border-border/40 bg-background/60 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirmSwitch}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))", boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)" }}>
              Confirm Plan Change
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ChangePlanPage;
