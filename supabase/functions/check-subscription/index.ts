import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    // Owner/developer bypass — always return full access
    if (user.email === "arthur25.ad@gmail.com") {
      logStep("Owner account detected, granting full access");
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "owner_bypass",
        price_id: "owner_bypass",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    // Check for both active and trialing subscriptions (trials auto-bill after)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 5,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;
    let subscriptionStart = null;
    let currentPeriodStart = null;
    let subscriptionStatus = null;
    let cancelAtPeriodEnd = false;

    if (activeSub) {
      subscriptionStatus = activeSub.status;
      cancelAtPeriodEnd = activeSub.cancel_at_period_end ?? false;
      try {
        if (activeSub.current_period_end) {
          subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
        }
        if (activeSub.current_period_start) {
          currentPeriodStart = new Date(activeSub.current_period_start * 1000).toISOString();
        }
        if (activeSub.start_date) {
          subscriptionStart = new Date(activeSub.start_date * 1000).toISOString();
        }
      } catch {
        logStep("Could not parse date fields");
      }
      productId = activeSub.items.data[0]?.price?.product ?? null;
      priceId = activeSub.items.data[0]?.price?.id ?? null;

      // Get current billing amount from the subscription item
      const priceObj = activeSub.items.data[0]?.price;
      let currentAmount: number | null = null;
      let currency: string | null = null;
      if (priceObj) {
        currentAmount = priceObj.unit_amount; // in cents
        currency = priceObj.currency;
      }

      // Check for active discount / coupon on the subscription
      let discountAmount: number | null = null;
      let discountLabel: string | null = null;
      const discount = activeSub.discount;
      if (discount && discount.coupon) {
        const coupon = discount.coupon;
        if (coupon.percent_off) {
          discountLabel = `${coupon.percent_off}% off`;
          if (currentAmount) {
            discountAmount = Math.round(currentAmount * (coupon.percent_off / 100));
          }
        } else if (coupon.amount_off) {
          discountLabel = `$${(coupon.amount_off / 100).toFixed(2)} off`;
          discountAmount = coupon.amount_off;
        }
      }

      // Try to get next invoice amount (most accurate for promo pricing)
      let upcomingAmount: number | null = null;
      try {
        const upcoming = await stripe.invoices.retrieveUpcoming({ customer: customerId });
        if (upcoming) {
          upcomingAmount = upcoming.amount_due; // in cents
        }
      } catch {
        logStep("No upcoming invoice available");
      }

      logStep("Active/trialing subscription found", { productId, priceId, status: activeSub.status, currentAmount, discountLabel, upcomingAmount });

      return new Response(JSON.stringify({
        subscribed: true,
        product_id: productId,
        price_id: priceId,
        subscription_end: subscriptionEnd,
        subscription_start: subscriptionStart,
        current_period_start: currentPeriodStart,
        subscription_status: subscriptionStatus,
        cancel_at_period_end: cancelAtPeriodEnd,
        current_amount: currentAmount,
        upcoming_amount: upcomingAmount,
        currency: currency,
        discount_label: discountLabel,
        discount_amount: discountAmount,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      subscribed: !!activeSub,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      subscription_start: subscriptionStart,
      current_period_start: currentPeriodStart,
      subscription_status: subscriptionStatus,
      cancel_at_period_end: cancelAtPeriodEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
