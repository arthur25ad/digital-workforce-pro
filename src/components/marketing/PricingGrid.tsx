import { Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { PromoCode } from "@/hooks/useActivePromos";
import { PACKAGES, PACKAGE_ORDER } from "@/lib/packages";
import { resolvePromoRules } from "@/lib/promoRules";
import { cn } from "@/lib/utils";

interface PricingGridProps {
  appliedPromo?: PromoCode | null;
  loadingPlan?: string | null;
  onSelectPlan?: (planKey: string) => void;
  signedIn?: boolean;
  compact?: boolean;
}

export default function PricingGrid({
  appliedPromo = null,
  loadingPlan = null,
  onSelectPlan,
  signedIn = false,
  compact = false,
}: PricingGridProps) {
  const plans = PACKAGE_ORDER.map((key) => PACKAGES[key]);

  return (
    <div className={cn("grid gap-5 lg:grid-cols-3", compact && "gap-4")}>
      {plans.map((plan) => {
        const resolved = resolvePromoRules(appliedPromo as PromoCode | null, plan.key);
        const isPopular = plan.key === "growth";
        const isLoading = loadingPlan === plan.key;

        return (
          <article
            key={plan.name}
            className={cn(
              "surface-panel relative flex h-full flex-col overflow-hidden p-6 md:p-8",
              isPopular && "border-primary/40",
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
              style={{
                background: isPopular
                  ? "linear-gradient(180deg, hsl(205 73% 70% / 0.18), transparent)"
                  : "linear-gradient(180deg, hsl(36 22% 94% / 0.06), transparent)",
              }}
            />

            {isPopular ? (
              <span className="relative z-10 mb-6 inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-primary-foreground">
                Most Selected
              </span>
            ) : (
              <span className="relative z-10 mb-6 inline-flex w-fit items-center rounded-full border border-border/80 bg-secondary/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {plan.maxRoles} role{plan.maxRoles > 1 ? "s" : ""}
              </span>
            )}

            <div className="relative z-10">
              <h3 className="font-display text-2xl font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
            </div>

            <div className="relative z-10 mt-8 flex items-end gap-2">
              {resolved.hasDiscount ? (
                <>
                  <span className="text-xl font-semibold text-muted-foreground/60 line-through">{plan.price}</span>
                  <span className="font-display text-5xl font-semibold text-foreground">
                    ${resolved.discountedPrice.toFixed(0)}
                  </span>
                </>
              ) : (
                <span className="font-display text-5xl font-semibold text-foreground">{plan.price}</span>
              )}
              <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>
            </div>

            <div className="relative z-10 mt-5 rounded-2xl border border-border/80 bg-background/50 p-4">
              {resolved.removeTrial ? (
                <p className="text-sm font-medium text-accent-amber">Billing starts immediately.</p>
              ) : resolved.trialDays > 0 ? (
                <p className="text-sm font-medium text-accent-teal">{resolved.trialDays}-day guided rollout included.</p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">Launch support included from day one.</p>
              )}

              {resolved.hasDiscount ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Promo applied. You save <span className="font-semibold text-foreground">${resolved.savingsAmount.toFixed(2)}</span>
                  {resolved.isRecurringDiscount ? " every month." : " on the discounted billing period."}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{resolved.summaryText}</p>
              )}
            </div>

            <ul className="relative z-10 mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check size={16} className="mt-1 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="relative z-10 mt-8">
              {signedIn && onSelectPlan ? (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.key)}
                  disabled={isLoading}
                  className={cn(
                    "w-full",
                    isPopular ? "btn-glow" : "btn-outline-glow",
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Preparing Checkout
                    </>
                  ) : resolved.removeTrial || resolved.trialDays === 0 ? (
                    "Choose Plan"
                  ) : (
                    `Start ${resolved.trialDays}-Day Rollout`
                  )}
                </button>
              ) : (
                <Link
                  to={compact ? "/pricing" : "/auth"}
                  className={cn(
                    "w-full",
                    isPopular ? "btn-glow" : "btn-outline-glow",
                  )}
                >
                  {compact ? "View Plan Details" : "Get Started"}
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
