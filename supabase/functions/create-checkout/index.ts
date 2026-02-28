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

const DEFAULT_PLAN_TRIALS: Record<string, number> = {
  starter: 30,
  growth: 30,
  team: 0,
};

const PRICE_TO_KEY: Record<string, string> = {
  "price_1T5QmBK99ArQ30pFn7FGni9h": "starter",
  "price_1T5QmTK99ArQ30pFmRrxLr1w": "growth",
  "price_1T5QmlK99ArQ30pFRKx2fT3z": "team",
};

const PLAN_MAX_ROLES: Record<string, number> = {
  starter: 1,
  growth: 3,
  team: 4,
};

const ALL_ROLES = ["social-media-manager", "customer-support", "email-marketer", "calendar-assistant"];

function getDiscountForPlan(promo: any, planKey: string): number {
  const planDiscount =
    planKey === "starter" ? (promo.starter_discount || 0)
    : planKey === "growth" ? (promo.growth_discount || 0)
    : planKey === "team" ? (promo.team_discount || 0)
    : 0;
  if (planDiscount > 0) return planDiscount;
  if (planKey === "team") return 0;
  return promo.discount_value || 0;
}

interface ResolvedCheckout {
  trialDays: number;
  removeTrial: boolean;
  hasCustomTrial: boolean;
  billingDelayDays: number;
  stripeTrialDays: number | null;
  hasDiscount: boolean;
  discountValue: number;
  discountType: string;
  stripeDuration: "once" | "repeating" | "forever";
  stripeDurationMonths: number | null;
  isFirstCycleOnly: boolean;
  isRecurringDiscount: boolean;
  promoId: string | null;
  promoCode: string | null;
}

function resolveCheckoutRules(promo: any | null, planKey: string): ResolvedCheckout {
  const defaultTrialDays = DEFAULT_PLAN_TRIALS[planKey] || 0;

  if (!promo) {
    return {
      trialDays: defaultTrialDays, removeTrial: false, hasCustomTrial: false,
      billingDelayDays: 0, stripeTrialDays: defaultTrialDays > 0 ? defaultTrialDays : null,
      hasDiscount: false, discountValue: 0, discountType: "percentage",
      stripeDuration: "once", stripeDurationMonths: null,
      isFirstCycleOnly: false, isRecurringDiscount: false,
      promoId: null, promoCode: null,
    };
  }

  let trialDays = defaultTrialDays;
  let hasCustomTrial = false;
  const removeTrial = promo.remove_trial || false;
  if (removeTrial) { trialDays = 0; }
  else if (promo.trial_days && promo.trial_days > 0) { trialDays = promo.trial_days; hasCustomTrial = true; }

  const billingDelayDays = promo.billing_delay_days || 0;
  const effectiveTrialDays = trialDays + billingDelayDays;
  const stripeTrialDays = effectiveTrialDays > 0 ? effectiveTrialDays : null;
  const discountValue = getDiscountForPlan(promo, planKey);
  const hasDiscount = discountValue > 0;
  const discountType = promo.discount_type || "percentage";
  const isFirstCycleOnly = promo.first_billing_cycle_only || false;
  const isRecurringDiscount = promo.recurring_discount || false;
  const discountDurationMonths = promo.discount_duration_months || null;

  let stripeDuration: "once" | "repeating" | "forever" = "once";
  let stripeDurationMonths: number | null = null;
  if (isRecurringDiscount) { stripeDuration = "forever"; }
  else if (discountDurationMonths && discountDurationMonths > 1) { stripeDuration = "repeating"; stripeDurationMonths = discountDurationMonths; }

  return {
    trialDays, removeTrial, hasCustomTrial, billingDelayDays, stripeTrialDays,
    hasDiscount, discountValue, discountType, stripeDuration, stripeDurationMonths,
    isFirstCycleOnly, isRecurringDiscount, promoId: promo.id, promoCode: promo.code,
  };
}

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

    if (user.email === "arthur25.ad@gmail.com") {
      return errResp("Owner account has free access. No checkout needed.");
    }

    const { priceId, promoCode, isPlanSwitch } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) customerId = customers.data[0].id;

    const planKey = PRICE_TO_KEY[priceId] || "";

    // ── PLAN SWITCH: Update existing subscription in-place ──
    if (isPlanSwitch && customerId) {
      logStep("Plan switch requested", { planKey, customerId });

      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 5 });
      const trialSubs = await stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 5 });
      const allActiveSubs = [...subs.data, ...trialSubs.data];

      if (allActiveSubs.length > 0) {
        const currentSub = allActiveSubs[0];
        const currentItemId = currentSub.items.data[0]?.id;

        if (currentItemId) {
          // Build update params
          const updateParams: any = {
            items: [{ id: currentItemId, price: priceId }],
            proration_behavior: "create_prorations",
          };

          // Apply promo coupon if provided during plan switch
          if (promoCode) {
            logStep("Applying promo to plan switch", { promoCode });
            const { data: fetchedPromo } = await supabaseAdmin
              .from("promo_codes")
              .select("*")
              .eq("code", promoCode.toUpperCase())
              .eq("is_active", true)
              .maybeSingle();

            if (fetchedPromo) {
              const discountValue = getDiscountForPlan(fetchedPromo, planKey);
              if (discountValue > 0) {
                const isRecurring = fetchedPromo.recurring_discount || false;
                const durationMonths = fetchedPromo.discount_duration_months || null;
                const couponParams: any = {
                  name: `Promo ${promoCode}`,
                  duration: isRecurring ? "forever" : (durationMonths && durationMonths > 1 ? "repeating" : "once"),
                };
                if (durationMonths && durationMonths > 1) couponParams.duration_in_months = durationMonths;
                if ((fetchedPromo.discount_type || "percentage") === "percentage") {
                  couponParams.percent_off = discountValue;
                } else {
                  couponParams.amount_off = Math.round(discountValue * 100);
                  couponParams.currency = "usd";
                }
                const coupon = await stripe.coupons.create(couponParams);
                updateParams.coupon = coupon.id;
                logStep("Coupon applied to switch", { couponId: coupon.id });
              }
            }
          }

          const updatedSub = await stripe.subscriptions.update(currentSub.id, updateParams);

          // Cancel duplicate subscriptions
          for (let i = 1; i < allActiveSubs.length; i++) {
            try {
              await stripe.subscriptions.update(allActiveSubs[i].id, { cancel_at_period_end: true });
              logStep("Marked duplicate for cancellation", { subId: allActiveSubs[i].id });
            } catch (e: any) {
              logStep("Could not cancel duplicate", { error: e.message });
            }
          }

          // Update profile to match new plan
          const maxRoles = PLAN_MAX_ROLES[planKey] || 0;
          const isTeam = planKey === "team";
          const profileUpdate: Record<string, any> = {
            active_package: planKey,
            subscription_status: "active",
          };
          if (isTeam) {
            profileUpdate.unlocked_roles = [...ALL_ROLES];
          }
          // For downgrades, we'll trim roles on the frontend after sync
          await supabaseAdmin.from("profiles").update(profileUpdate).eq("id", user.id);
          logStep("Profile updated", { planKey, maxRoles });

          // Determine if role re-selection is needed
          const { data: profileData } = await supabaseAdmin.from("profiles").select("unlocked_roles").eq("id", user.id).single();
          const currentRoleCount = profileData?.unlocked_roles?.length || 0;
          const needsRoleReselection = !isTeam && currentRoleCount > maxRoles;

          return new Response(JSON.stringify({
            success: true,
            switched: true,
            newPlanKey: planKey,
            needsRoleReselection,
            maxRoles,
            message: `Your plan has been updated to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}.`,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      logStep("No active subscription found, falling back to checkout");
    }

    // ── Standard checkout flow ──
    let promoData: any = null;
    if (promoCode) {
      logStep("Validating promo code", { code: promoCode });
      const { data: fetchedPromo, error: promoError } = await supabaseAdmin
        .from("promo_codes").select("*")
        .eq("code", promoCode.toUpperCase()).eq("is_active", true).maybeSingle();

      if (promoError || !fetchedPromo) return errResp("Invalid or inactive promo code.");
      const now = new Date();
      if (fetchedPromo.start_date && new Date(fetchedPromo.start_date) > now) return errResp("This promo code is not yet active.");
      if (fetchedPromo.end_date && new Date(fetchedPromo.end_date) < now) return errResp("This promo code has expired.");
      if (fetchedPromo.expires_at && new Date(fetchedPromo.expires_at) < now) return errResp("This promo code has expired.");
      if (fetchedPromo.max_uses && fetchedPromo.usage_count >= fetchedPromo.max_uses) return errResp("This promo code has reached its usage limit.");
      if (fetchedPromo.new_customers_only && customerId) {
        const existingSubs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (existingSubs.data.length > 0) return errResp("This promo code is only available for new customers.");
      }
      const discountVal = getDiscountForPlan(fetchedPromo, planKey);
      const hasTrialEffect = fetchedPromo.remove_trial || (fetchedPromo.trial_days && fetchedPromo.trial_days > 0);
      const hasBillingDelay = fetchedPromo.billing_delay_days && fetchedPromo.billing_delay_days > 0;
      if (discountVal <= 0 && !hasTrialEffect && !hasBillingDelay) return errResp("This promo code does not apply to the selected plan.");
      promoData = fetchedPromo;
    }

    const resolved = resolveCheckoutRules(promoData, planKey);
    logStep("RESOLVED BILLING RULES", { planKey, promoCode: resolved.promoCode, stripeTrialDays: resolved.stripeTrialDays, hasDiscount: resolved.hasDiscount, discountValue: resolved.discountValue });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?checkout=success&plan=${planKey}`,
      cancel_url: `${origin}/pricing?checkout=cancelled${promoCode ? `&promo=${encodeURIComponent(promoCode)}` : ""}&plan=${planKey}`,
    };

    if (resolved.stripeTrialDays !== null && resolved.stripeTrialDays > 0) {
      sessionParams.subscription_data = { trial_period_days: resolved.stripeTrialDays };
    }
    if (resolved.promoId) {
      if (!sessionParams.subscription_data) sessionParams.subscription_data = {};
      sessionParams.metadata = { promo_id: resolved.promoId, promo_code: resolved.promoCode };
      sessionParams.subscription_data.metadata = { promo_id: resolved.promoId, promo_code: resolved.promoCode };
    }
    if (resolved.hasDiscount) {
      const couponParams: any = { name: `Promo ${resolved.promoCode}`, duration: resolved.stripeDuration };
      if (resolved.stripeDurationMonths) couponParams.duration_in_months = resolved.stripeDurationMonths;
      if (resolved.discountType === "percentage") { couponParams.percent_off = resolved.discountValue; }
      else { couponParams.amount_off = Math.round(resolved.discountValue * 100); couponParams.currency = "usd"; }
      const coupon = await stripe.coupons.create(couponParams);
      sessionParams.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
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
