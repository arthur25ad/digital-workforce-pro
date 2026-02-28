/**
 * Centralized Promo Rules Engine
 * 
 * Resolves a promo code into a single, deterministic result object
 * used by pricing display, checkout, and validation consistently.
 */

export interface PromoCodeData {
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
  expires_at?: string | null;
  max_uses: number | null;
  usage_count: number;
  // New billing control fields
  trial_days: number | null;
  remove_trial: boolean;
  billing_delay_days: number | null;
  discount_duration_months: number | null;
  recurring_discount: boolean;
  new_customers_only: boolean;
}

export interface ResolvedPromoResult {
  valid: boolean;
  reason?: string;

  // Trial behavior
  hasCustomTrial: boolean;
  trialDays: number;
  removeTrial: boolean;

  // Billing timing
  billingDelayDays: number;

  // Discount
  hasDiscount: boolean;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountDurationMonths: number | null; // null = based on first_billing_cycle_only or recurring
  isFirstCycleOnly: boolean;
  isRecurringDiscount: boolean;

  // Computed pricing
  originalPrice: number;
  discountedPrice: number;
  savingsAmount: number;

  // Summary
  summaryText: string;
  promoId: string | null;
}

// Default plan trial days
const DEFAULT_PLAN_TRIALS: Record<string, number> = {
  starter: 3,
  growth: 7,
  team: 0,
};

const PLAN_PRICES: Record<string, number> = {
  starter: 49,
  growth: 99,
  team: 129,
};

/**
 * Resolve a promo code into a deterministic result for a given plan.
 */
export function resolvePromoRules(
  promo: PromoCodeData | null,
  planKey: string
): ResolvedPromoResult {
  const originalPrice = PLAN_PRICES[planKey] || 0;
  const defaultTrialDays = DEFAULT_PLAN_TRIALS[planKey] || 0;

  // No promo = defaults
  if (!promo) {
    return {
      valid: true,
      hasCustomTrial: false,
      trialDays: defaultTrialDays,
      removeTrial: false,
      billingDelayDays: 0,
      hasDiscount: false,
      discountType: "percentage",
      discountValue: 0,
      discountDurationMonths: null,
      isFirstCycleOnly: false,
      isRecurringDiscount: false,
      originalPrice,
      discountedPrice: originalPrice,
      savingsAmount: 0,
      summaryText: defaultTrialDays > 0
        ? `${defaultTrialDays}-day free trial, then $${originalPrice}/mo.`
        : `$${originalPrice}/mo.`,
      promoId: null,
    };
  }

  // Validate promo eligibility
  const validation = validatePromo(promo, planKey);
  if (!validation.valid) {
    return {
      valid: false,
      reason: validation.reason,
      hasCustomTrial: false,
      trialDays: defaultTrialDays,
      removeTrial: false,
      billingDelayDays: 0,
      hasDiscount: false,
      discountType: "percentage",
      discountValue: 0,
      discountDurationMonths: null,
      isFirstCycleOnly: false,
      isRecurringDiscount: false,
      originalPrice,
      discountedPrice: originalPrice,
      savingsAmount: 0,
      summaryText: "",
      promoId: null,
    };
  }

  // Resolve trial behavior
  // Priority: remove_trial > custom trial_days > default plan trial
  let trialDays = defaultTrialDays;
  let hasCustomTrial = false;
  const removeTrial = promo.remove_trial || false;

  if (removeTrial) {
    trialDays = 0;
  } else if (promo.trial_days && promo.trial_days > 0) {
    trialDays = promo.trial_days;
    hasCustomTrial = true;
  }

  // Billing delay
  const billingDelayDays = promo.billing_delay_days || 0;

  // Resolve discount
  const discountValue = getDiscountForPlan(promo, planKey);
  const hasDiscount = discountValue > 0;
  const discountType = (promo.discount_type === "fixed" ? "fixed" : "percentage") as "percentage" | "fixed";
  const isFirstCycleOnly = promo.first_billing_cycle_only || false;
  const isRecurringDiscount = promo.recurring_discount || false;
  const discountDurationMonths = promo.discount_duration_months || null;

  // Compute pricing
  let discountedPrice = originalPrice;
  if (hasDiscount) {
    if (discountType === "percentage") {
      discountedPrice = Math.max(0, originalPrice * (1 - discountValue / 100));
    } else {
      discountedPrice = Math.max(0, originalPrice - discountValue);
    }
  }
  discountedPrice = Math.round(discountedPrice * 100) / 100;
  const savingsAmount = Math.round((originalPrice - discountedPrice) * 100) / 100;

  // Build summary text
  const summaryText = buildSummary({
    trialDays,
    removeTrial,
    hasCustomTrial,
    billingDelayDays,
    hasDiscount,
    discountType,
    discountValue,
    isFirstCycleOnly,
    isRecurringDiscount,
    discountDurationMonths,
    originalPrice,
    discountedPrice,
  });

  return {
    valid: true,
    hasCustomTrial,
    trialDays,
    removeTrial,
    billingDelayDays,
    hasDiscount,
    discountType,
    discountValue,
    discountDurationMonths,
    isFirstCycleOnly,
    isRecurringDiscount,
    originalPrice,
    discountedPrice,
    savingsAmount,
    summaryText,
    promoId: promo.id,
  };
}

function validatePromo(promo: PromoCodeData, planKey: string): { valid: boolean; reason?: string } {
  if (!promo.is_active) return { valid: false, reason: "This promo code is inactive." };

  const now = new Date();
  if (promo.start_date && new Date(promo.start_date) > now) {
    return { valid: false, reason: "This promo code is not yet active." };
  }
  if (promo.end_date && new Date(promo.end_date) < now) {
    return { valid: false, reason: "This promo code has expired." };
  }
  if (promo.expires_at && new Date(promo.expires_at) < now) {
    return { valid: false, reason: "This promo code has expired." };
  }
  if (promo.max_uses && promo.usage_count >= promo.max_uses) {
    return { valid: false, reason: "This promo code has reached its usage limit." };
  }

  // Check plan-specific discount — if the promo has no effect on this plan at all
  const discountVal = getDiscountForPlan(promo, planKey);
  const hasTrialEffect = (promo.trial_days && promo.trial_days > 0) || promo.remove_trial;
  const hasBillingDelay = promo.billing_delay_days && promo.billing_delay_days > 0;

  if (discountVal <= 0 && !hasTrialEffect && !hasBillingDelay) {
    return { valid: false, reason: "This promo code does not apply to the selected plan." };
  }

  return { valid: true };
}

function getDiscountForPlan(promo: PromoCodeData, planKey: string): number {
  const planDiscount =
    planKey === "starter" ? promo.starter_discount
    : planKey === "growth" ? promo.growth_discount
    : planKey === "team" ? promo.team_discount
    : 0;
  if (planDiscount > 0) return planDiscount;
  if (planKey === "team") return 0;
  return promo.discount_value || 0;
}

function buildSummary(opts: {
  trialDays: number;
  removeTrial: boolean;
  hasCustomTrial: boolean;
  billingDelayDays: number;
  hasDiscount: boolean;
  discountType: string;
  discountValue: number;
  isFirstCycleOnly: boolean;
  isRecurringDiscount: boolean;
  discountDurationMonths: number | null;
  originalPrice: number;
  discountedPrice: number;
}): string {
  const parts: string[] = [];

  if (opts.removeTrial) {
    parts.push("No free trial — billing starts immediately");
  } else if (opts.trialDays > 0) {
    parts.push(`${opts.trialDays}-day free trial`);
  }

  if (opts.billingDelayDays > 0) {
    parts.push(`first payment delayed by ${opts.billingDelayDays} days`);
  }

  if (opts.hasDiscount) {
    const discountLabel = opts.discountType === "percentage"
      ? `${opts.discountValue}% off`
      : `$${opts.discountValue} off`;

    if (opts.isRecurringDiscount) {
      parts.push(`${discountLabel} every month`);
    } else if (opts.discountDurationMonths && opts.discountDurationMonths > 1) {
      parts.push(`${discountLabel} for ${opts.discountDurationMonths} months`);
    } else if (opts.isFirstCycleOnly) {
      parts.push(`${discountLabel} the first month`);
    } else {
      parts.push(`${discountLabel}`);
    }

    parts.push(`($${opts.discountedPrice}/mo)`);
  }

  if (parts.length === 0) return `$${opts.originalPrice}/mo`;

  // Capitalize first letter
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/**
 * Generate a human-readable admin summary for a promo code.
 */
export function generateAdminSummary(promo: Partial<PromoCodeData>): string {
  const parts: string[] = [];

  if (promo.remove_trial) {
    parts.push("removes the default free trial");
  } else if (promo.trial_days && promo.trial_days > 0) {
    parts.push(`adds a ${promo.trial_days}-day free trial`);
  }

  if (promo.billing_delay_days && promo.billing_delay_days > 0) {
    parts.push(`delays first payment by ${promo.billing_delay_days} days`);
  }

  const discountVal = promo.discount_value || 0;
  if (discountVal > 0) {
    const label = promo.discount_type === "fixed"
      ? `$${discountVal} off`
      : `${discountVal}% off`;

    if (promo.recurring_discount) {
      parts.push(`gives ${label} every month`);
    } else if (promo.discount_duration_months && promo.discount_duration_months > 1) {
      parts.push(`gives ${label} for ${promo.discount_duration_months} months`);
    } else if (promo.first_billing_cycle_only) {
      parts.push(`gives ${label} the first month only`);
    } else {
      parts.push(`gives ${label}`);
    }
  }

  // Plan overrides
  const overrides: string[] = [];
  if ((promo.starter_discount || 0) > 0) overrides.push(`Starter: ${promo.starter_discount}${promo.discount_type === "fixed" ? "$" : "%"}`);
  if ((promo.growth_discount || 0) > 0) overrides.push(`Growth: ${promo.growth_discount}${promo.discount_type === "fixed" ? "$" : "%"}`);
  if ((promo.team_discount || 0) > 0) overrides.push(`Team: ${promo.team_discount}${promo.discount_type === "fixed" ? "$" : "%"}`);
  if (overrides.length > 0) parts.push(`plan overrides: ${overrides.join(", ")}`);

  if (promo.new_customers_only) parts.push("new customers only");
  if (promo.max_uses) parts.push(`max ${promo.max_uses} uses`);
  if (promo.is_private) parts.push("private code");

  if (parts.length === 0) return "No rules configured yet.";

  const text = "This code " + parts.join(" and ") + ".";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
