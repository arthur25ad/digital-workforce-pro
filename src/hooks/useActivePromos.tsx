import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  label: string;
  description: string | null;
  is_active: boolean;
  is_visible_on_homepage: boolean;
  is_visible_on_pricing: boolean;
  is_private: boolean;
  discount_type: string;
  discount_value: number;
  starter_discount: number;
  growth_discount: number;
  team_discount: number;
  first_billing_cycle_only: boolean;
  start_date: string | null;
  end_date: string | null;
  max_uses: number | null;
  usage_count: number;
}

export function useActivePromos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("is_active", true);
      setPromos((data as any as PromoCode[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const homepagePromo = promos.find(
    (p) => p.is_visible_on_homepage && !p.is_private
  );
  const pricingPromos = promos.filter(
    (p) => p.is_visible_on_pricing && !p.is_private
  );

  return { promos, homepagePromo, pricingPromos, loading };
}

export function getDiscountForPlan(
  promo: PromoCode,
  planKey: string
): number {
  const planDiscount =
    planKey === "starter"
      ? promo.starter_discount
      : planKey === "growth"
      ? promo.growth_discount
      : planKey === "team"
      ? promo.team_discount
      : 0;
  // Plan-specific override takes priority
  if (planDiscount > 0) return planDiscount;
  // Only Starter & Growth get the global fallback; Team requires an explicit override
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
