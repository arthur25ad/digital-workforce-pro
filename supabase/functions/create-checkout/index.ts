import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Trial periods
    const trialDays: Record<string, number> = {
      "price_1T5QmBK99ArQ30pFn7FGni9h": 3,
      "price_1T5QmTK99ArQ30pFmRrxLr1w": 7,
    };
    const trialPeriodDays = trialDays[priceId] || undefined;

    // Map priceId to plan key for plan-specific discounts
    const priceToKey: Record<string, string> = {
      "price_1T5QmBK99ArQ30pFn7FGni9h": "starter",
      "price_1T5QmTK99ArQ30pFmRrxLr1w": "growth",
      "price_1T5QmlK99ArQ30pFRKx2fT3z": "team",
    };
    const planKey = priceToKey[priceId] || "";

    // Handle promo code -> Stripe coupon
    let discounts: any[] | undefined;

    if (promoCode) {
      const { data: promoData } = await supabaseAdmin
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promoData) {
        // Determine the discount amount for this plan
        let discountVal = promoData.discount_value || 0;
        const planSpecific = planKey === "starter" ? promoData.starter_discount
          : planKey === "growth" ? promoData.growth_discount
          : planKey === "team" ? promoData.team_discount : 0;
        if (planSpecific > 0) discountVal = planSpecific;

        if (discountVal > 0) {
          // Create a Stripe coupon dynamically
          const couponParams: any = {
            name: `Promo ${promoData.code}`,
          };

          if (promoData.first_billing_cycle_only) {
            couponParams.duration = "once";
          } else {
            couponParams.duration = "forever";
          }

          if (promoData.discount_type === "percentage") {
            couponParams.percent_off = discountVal;
          } else {
            couponParams.amount_off = Math.round(discountVal * 100); // cents
            couponParams.currency = "usd";
          }

          const coupon = await stripe.coupons.create(couponParams);
          discounts = [{ coupon: coupon.id }];

          // Increment usage count
          await supabaseAdmin
            .from("promo_codes")
            .update({ usage_count: (promoData.usage_count || 0) + 1 })
            .eq("id", promoData.id);
        }
      }
    }

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
    };

    if (trialPeriodDays && !discounts) {
      sessionParams.subscription_data = { trial_period_days: trialPeriodDays };
    }

    if (discounts) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
});
