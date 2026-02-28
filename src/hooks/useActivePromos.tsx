import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PromoCodeData } from "@/lib/promoRules";
export type { PromoCodeData };
export type PromoCode = PromoCodeData;

/** Check if a promo is currently eligible for display */
function isPromoEligible(p: PromoCode): boolean {
  const now = new Date();
  if (p.start_date && new Date(p.start_date) > now) return false;
  if (p.end_date && new Date(p.end_date) < now) return false;
  if (p.max_uses && p.usage_count >= p.max_uses) return false;
  return true;
}

export function useActivePromos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // RLS only returns non-private, publicly visible, active promos
      const { data } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("is_active", true);
      setPromos((data as any as PromoCode[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const eligible = promos.filter(isPromoEligible);

  const homepagePromo = eligible.find(
    (p) => p.is_visible_on_homepage && !p.is_private
  );
  const pricingPromos = eligible.filter(
    (p) => p.is_visible_on_pricing && !p.is_private
  );

  return { promos: eligible, homepagePromo, pricingPromos, loading };
}

export { resolvePromoRules, generateAdminSummary } from "@/lib/promoRules";

export function getDiscountForPlan(
  promo: PromoCode,
  planKey: string
): number {
  const planDiscount =
    planKey === "starter" ? promo.starter_discount
    : planKey === "growth" ? promo.growth_discount
    : planKey === "team" ? promo.team_discount
    : 0;
  if (planDiscount > 0) return planDiscount;
  if (planKey === "team") return 0;
  return promo.discount_value;
}

export function applyDiscount(
  priceInDollars: number,
  discountValue: number,
  discountType: string
): number {
  if (discountType === "percentage") {
    return Math.max(0, priceInDollars * (1 - discountValue / 100));
  }
  return Math.max(0, priceInDollars - discountValue);
}

export function formatDiscountLabel(promo: PromoCode, planKey?: string): string {
  const val = planKey ? getDiscountForPlan(promo, planKey) : promo.discount_value;
  if (val <= 0) return "";
  if (promo.discount_type === "percentage") return `${val}% off`;
  return `$${val} off`;
}
