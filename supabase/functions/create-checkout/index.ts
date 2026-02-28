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

    // Default trial periods per plan
    const defaultTrialDays: Record<string, number> = {
      "price_1T5QmBK99ArQ30pFn7FGni9h": 3,  // Starter
      "price_1T5QmTK99ArQ30pFmRrxLr1w": 7,  // Growth
    };

    const priceToKey: Record<string, string> = {
      "price_1T5QmBK99ArQ30pFn7FGni9h": "starter",
      "price_1T5QmTK99ArQ30pFmRrxLr1w": "growth",
      "price_1T5QmlK99ArQ30pFRKx2fT3z": "team",
    };
    const planKey = priceToKey[priceId] || "";

    // Start with plan defaults
    let trialPeriodDays = defaultTrialDays[priceId] || undefined;
    let discounts: any[] | undefined;
    let validatedPromoId: string | null = null;

    // ── PROMO CODE RESOLUTION (server-side rules engine) ──
    if (promoCode) {
      logStep("Validating promo code", { code: promoCode });

      const { data: promoData, error: promoError } = await supabaseAdmin
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promoError || !promoData) {
        return new Response(JSON.stringify({ error: "Invalid or inactive promo code." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
        });
      }

      // Validate date window
      const now = new Date();
      if (promoData.start_date && new Date(promoData.start_date) > now) {
        return errResp("This promo code is not yet active.");
      }
      if (promoData.end_date && new Date(promoData.end_date) < now) {
        return errResp("This promo code has expired.");
      }
      if (promoData.expires_at && new Date(promoData.expires_at) < now) {
        return errResp("This promo code has expired.");
      }
      if (promoData.max_uses && promoData.usage_count >= promoData.max_uses) {
        return errResp("This promo code has reached its usage limit.");
      }

      // New customers only check
      if (promoData.new_customers_only && customerId) {
        // Check if customer has any prior subscriptions
        const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
        if (subs.data.length > 0) {
          return errResp("This promo code is only available for new customers.");
        }
      }

      // ── RULE 1: Trial behavior ──
      if (promoData.remove_trial) {
        trialPeriodDays = undefined; // Remove trial, bill immediately
        logStep("Promo removes trial");
      } else if (promoData.trial_days && promoData.trial_days > 0) {
        trialPeriodDays = promoData.trial_days; // Override trial days
        logStep("Promo sets custom trial", { days: promoData.trial_days });
      }

      // ── RULE 2: Billing delay (acts like a trial without calling it one) ──
      if (promoData.billing_delay_days && promoData.billing_delay_days > 0) {
        // Billing delay combines with or replaces trial
        const existingTrial = trialPeriodDays || 0;
        trialPeriodDays = existingTrial + promoData.billing_delay_days;
        logStep("Promo adds billing delay", { delay: promoData.billing_delay_days, totalTrial: trialPeriodDays });
      }

      // ── RULE 3: Discount ──
      let discountVal = promoData.discount_value || 0;
      const planSpecific = planKey === "starter" ? promoData.starter_discount
        : planKey === "growth" ? promoData.growth_discount
        : planKey === "team" ? promoData.team_discount : 0;
      if (planSpecific > 0) discountVal = planSpecific;

      // Check if promo has ANY effect on this plan
      const hasTrialEffect = promoData.remove_trial || (promoData.trial_days && promoData.trial_days > 0);
      const hasBillingDelay = promoData.billing_delay_days && promoData.billing_delay_days > 0;

      if (discountVal <= 0 && !hasTrialEffect && !hasBillingDelay) {
        return errResp("This promo code does not apply to the selected plan.");
      }

      if (discountVal > 0) {
        const couponParams: any = {
          name: `Promo ${promoData.code}`,
        };

        // Determine coupon duration
        if (promoData.recurring_discount) {
          couponParams.duration = "forever";
        } else if (promoData.discount_duration_months && promoData.discount_duration_months > 1) {
          couponParams.duration = "repeating";
          couponParams.duration_in_months = promoData.discount_duration_months;
        } else if (promoData.first_billing_cycle_only) {
          couponParams.duration = "once";
        } else {
          couponParams.duration = "once";
        }

        if (promoData.discount_type === "percentage") {
          couponParams.percent_off = discountVal;
        } else {
          couponParams.amount_off = Math.round(discountVal * 100);
          couponParams.currency = "usd";
        }

        const coupon = await stripe.coupons.create(couponParams);
        discounts = [{ coupon: coupon.id }];
        logStep("Created Stripe coupon", { couponId: coupon.id, duration: couponParams.duration });
      }

      validatedPromoId = promoData.id;
    }

    // ── Build checkout session ──
    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
    };

    if (trialPeriodDays && trialPeriodDays > 0) {
      sessionParams.subscription_data = { trial_period_days: trialPeriodDays };
    }

    if (validatedPromoId) {
      sessionParams.metadata = { promo_id: validatedPromoId };
      if (!sessionParams.subscription_data) sessionParams.subscription_data = {};
      sessionParams.subscription_data.metadata = { promo_id: validatedPromoId };
    }

    if (discounts) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
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
