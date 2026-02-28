import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// ── Centralized rules engine (mirrors src/lib/promoRules.ts exactly) ──

const DEFAULT_PLAN_TRIALS: Record<string, number> = {
  starter: 3,
  growth: 7,
  team: 0,
};

function getDiscountForPlan(promo: any, planKey: string): number {
  const planDiscount =
    planKey === "starter" ? (promo.starter_discount || 0)
    : planKey === "growth" ? (promo.growth_discount || 0)
    : planKey === "team" ? (promo.team_discount || 0)
    : 0;
  if (planDiscount > 0) return planDiscount;
  // Team plan gets 0 unless team_discount is explicitly set
  if (planKey === "team") return 0;
  return promo.discount_value || 0;
}

interface ResolvedCheckout {
  // Trial
  trialDays: number;
  removeTrial: boolean;
  hasCustomTrial: boolean;
  // Billing
  billingDelayDays: number;
  // Stripe trial_period_days (combines trial + delay)
  stripeTrialDays: number | null;
  // Discount
  hasDiscount: boolean;
  discountValue: number;
  discountType: string;
  stripeDuration: "once" | "repeating" | "forever";
  stripeDurationMonths: number | null;
  // Flags
  isFirstCycleOnly: boolean;
  isRecurringDiscount: boolean;
  // Promo ref
  promoId: string | null;
  promoCode: string | null;
}

function resolveCheckoutRules(promo: any | null, planKey: string): ResolvedCheckout {
  const defaultTrialDays = DEFAULT_PLAN_TRIALS[planKey] || 0;

  if (!promo) {
    return {
      trialDays: defaultTrialDays,
      removeTrial: false,
      hasCustomTrial: false,
      billingDelayDays: 0,
      stripeTrialDays: defaultTrialDays > 0 ? defaultTrialDays : null,
      hasDiscount: false,
      discountValue: 0,
      discountType: "percentage",
      stripeDuration: "once",
      stripeDurationMonths: null,
      isFirstCycleOnly: false,
      isRecurringDiscount: false,
      promoId: null,
      promoCode: null,
    };
  }

  // ── RULE 1: Trial behavior ──
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

  // ── RULE 2: Billing delay (adds to effective trial period in Stripe) ──
  const billingDelayDays = promo.billing_delay_days || 0;

  // Compute final Stripe trial_period_days
  // Billing delay adds to whatever trial remains
  const effectiveTrialDays = trialDays + billingDelayDays;
  const stripeTrialDays = effectiveTrialDays > 0 ? effectiveTrialDays : null;

  // ── RULE 3: Discount ──
  const discountValue = getDiscountForPlan(promo, planKey);
  const hasDiscount = discountValue > 0;
  const discountType = promo.discount_type || "percentage";
  const isFirstCycleOnly = promo.first_billing_cycle_only || false;
  const isRecurringDiscount = promo.recurring_discount || false;
  const discountDurationMonths = promo.discount_duration_months || null;

  // Determine Stripe coupon duration
  let stripeDuration: "once" | "repeating" | "forever" = "once";
  let stripeDurationMonths: number | null = null;

  if (isRecurringDiscount) {
    stripeDuration = "forever";
  } else if (discountDurationMonths && discountDurationMonths > 1) {
    stripeDuration = "repeating";
    stripeDurationMonths = discountDurationMonths;
  } else if (isFirstCycleOnly) {
    stripeDuration = "once";
  } else {
    // Default: treat as "once" (single application)
    stripeDuration = "once";
  }

  return {
    trialDays,
    removeTrial,
    hasCustomTrial,
    billingDelayDays,
    stripeTrialDays,
    hasDiscount,
    discountValue,
    discountType,
    stripeDuration,
    stripeDurationMonths,
    isFirstCycleOnly,
    isRecurringDiscount,
    promoId: promo.id,
    promoCode: promo.code,
  };
}

// ── Main handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Owner/developer bypass
    if (user.email === "arthur25.ad@gmail.com") {
      return new Response(JSON.stringify({ error: "Owner account has free access. No checkout needed." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { priceId, promoCode } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const priceToKey: Record<string, string> = {
      "price_1T5QmBK99ArQ30pFn7FGni9h": "starter",
      "price_1T5QmTK99ArQ30pFmRrxLr1w": "growth",
      "price_1T5QmlK99ArQ30pFRKx2fT3z": "team",
    };
    const planKey = priceToKey[priceId] || "";

    // ── Validate & fetch promo if provided ──
    let promoData: any = null;

    if (promoCode) {
      logStep("Validating promo code", { code: promoCode });

      const { data: fetchedPromo, error: promoError } = await supabaseAdmin
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promoError || !fetchedPromo) {
        return errResp("Invalid or inactive promo code.");
      }

      // Validate date window
      const now = new Date();
      if (fetchedPromo.start_date && new Date(fetchedPromo.start_date) > now) {
        return errResp("This promo code is not yet active.");
      }
      if (fetchedPromo.end_date && new Date(fetchedPromo.end_date) < now) {
        return errResp("This promo code has expired.");
      }
      if (fetchedPromo.expires_at && new Date(fetchedPromo.expires_at) < now) {
        return errResp("This promo code has expired.");
      }
      if (fetchedPromo.max_uses && fetchedPromo.usage_count >= fetchedPromo.max_uses) {
        return errResp("This promo code has reached its usage limit.");
      }

      // New customers only check
      if (fetchedPromo.new_customers_only && customerId) {
        const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (subs.data.length > 0) {
          return errResp("This promo code is only available for new customers.");
        }
      }

      // Check if promo has ANY effect on this plan
      const discountVal = getDiscountForPlan(fetchedPromo, planKey);
      const hasTrialEffect = fetchedPromo.remove_trial || (fetchedPromo.trial_days && fetchedPromo.trial_days > 0);
      const hasBillingDelay = fetchedPromo.billing_delay_days && fetchedPromo.billing_delay_days > 0;

      if (discountVal <= 0 && !hasTrialEffect && !hasBillingDelay) {
        return errResp("This promo code does not apply to the selected plan.");
      }

      promoData = fetchedPromo;
    }

    // ── Resolve billing rules (single source of truth) ──
    const resolved = resolveCheckoutRules(promoData, planKey);

    logStep("RESOLVED BILLING RULES", {
      planKey,
      promoCode: resolved.promoCode,
      removeTrial: resolved.removeTrial,
      trialDays: resolved.trialDays,
      billingDelayDays: resolved.billingDelayDays,
      stripeTrialDays: resolved.stripeTrialDays,
      hasDiscount: resolved.hasDiscount,
      discountValue: resolved.discountValue,
      discountType: resolved.discountType,
      stripeDuration: resolved.stripeDuration,
      stripeDurationMonths: resolved.stripeDurationMonths,
      chargesImmediately: resolved.stripeTrialDays === null,
    });

    // ── Build Stripe checkout session from resolved result ──
    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success&plan=${planKey}`,
      cancel_url: `${req.headers.get("origin")}/pricing?checkout=cancelled${promoCode ? `&promo=${encodeURIComponent(promoCode)}` : ""}&plan=${planKey}`,
    };

    // Trial / billing delay → Stripe trial_period_days
    if (resolved.stripeTrialDays !== null && resolved.stripeTrialDays > 0) {
      sessionParams.subscription_data = { trial_period_days: resolved.stripeTrialDays };
      logStep("Stripe: setting trial_period_days", { days: resolved.stripeTrialDays });
    } else {
      logStep("Stripe: NO trial — customer charged immediately");
    }

    // Promo metadata
    if (resolved.promoId) {
      if (!sessionParams.subscription_data) sessionParams.subscription_data = {};
      sessionParams.metadata = { promo_id: resolved.promoId, promo_code: resolved.promoCode };
      sessionParams.subscription_data.metadata = { promo_id: resolved.promoId, promo_code: resolved.promoCode };
    }

    // Discount coupon
    if (resolved.hasDiscount) {
      const couponParams: any = {
        name: `Promo ${resolved.promoCode}`,
        duration: resolved.stripeDuration,
      };
      if (resolved.stripeDurationMonths) {
        couponParams.duration_in_months = resolved.stripeDurationMonths;
      }
      if (resolved.discountType === "percentage") {
        couponParams.percent_off = resolved.discountValue;
      } else {
        couponParams.amount_off = Math.round(resolved.discountValue * 100);
        couponParams.currency = "usd";
      }

      const coupon = await stripe.coupons.create(couponParams);
      sessionParams.discounts = [{ coupon: coupon.id }];
      logStep("Stripe: created coupon", { couponId: coupon.id, ...couponParams });
    }

    logStep("Stripe: final session params", {
      hasTrialPeriod: !!sessionParams.subscription_data?.trial_period_days,
      trialDays: sessionParams.subscription_data?.trial_period_days || 0,
      hasDiscount: !!sessionParams.discounts,
    });

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  function errResp(msg: string) {
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
