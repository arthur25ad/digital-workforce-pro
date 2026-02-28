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

function safeTimestamp(ts: any): string | null {
  if (!ts) return null;
  try {
    const num = typeof ts === "number" ? ts : Number(ts);
    if (isNaN(num) || num <= 0) return null;
    return new Date(num * 1000).toISOString();
  } catch {
    return null;
  }
}

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

    // Owner/developer bypass
    if (user.email === "arthur25.ad@gmail.com") {
      logStep("Owner account detected, granting full access");
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "owner_bypass",
        price_id: "owner_bypass",
        subscription_end: null,
        subscription_start: null,
        current_period_start: null,
        subscription_status: "active",
        cancel_at_period_end: false,
        current_amount: null,
        upcoming_amount: null,
        currency: null,
        discount_label: null,
        discount_amount: null,
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
    logStep("Customer found", { customerId });

    // List subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      // Check for canceled but still accessible subscriptions
      const canceledSub = subscriptions.data.find(s => s.status === "canceled");
      logStep("No active subscription found", { totalSubs: subscriptions.data.length, hasCanceled: !!canceledSub });
      return new Response(JSON.stringify({
        subscribed: false,
        product_id: null,
        price_id: null,
        subscription_end: null,
        subscription_start: null,
        current_period_start: null,
        subscription_status: canceledSub?.status || null,
        cancel_at_period_end: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Retrieve the full subscription object to ensure all fields are present
    const fullSub = await stripe.subscriptions.retrieve(activeSub.id);
    
    // Log raw field values for debugging
    logStep("Raw subscription fields", {
      id: fullSub.id,
      status: fullSub.status,
      current_period_start: fullSub.current_period_start,
      current_period_end: fullSub.current_period_end,
      start_date: fullSub.start_date,
      cancel_at_period_end: fullSub.cancel_at_period_end,
      created: fullSub.created,
    });

    const subscriptionEnd = safeTimestamp(fullSub.current_period_end);
    const currentPeriodStart = safeTimestamp(fullSub.current_period_start);
    const subscriptionStart = safeTimestamp(fullSub.start_date) || safeTimestamp(fullSub.created);
    const subscriptionStatus = fullSub.status;
    const cancelAtPeriodEnd = fullSub.cancel_at_period_end ?? false;

    const priceItem = fullSub.items?.data?.[0]?.price;
    const productId = priceItem?.product ?? null;
    const priceId = priceItem?.id ?? null;
    const currentAmount: number | null = priceItem?.unit_amount ?? null;
    const currency: string | null = priceItem?.currency ?? null;

    // Check discount
    let discountAmount: number | null = null;
    let discountLabel: string | null = null;
    const discount = fullSub.discount;
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

    // Try upcoming invoice for accurate next charge amount
    let upcomingAmount: number | null = null;
    try {
      const upcoming = await stripe.invoices.retrieveUpcoming({ customer: customerId });
      if (upcoming && upcoming.amount_due != null) {
        upcomingAmount = upcoming.amount_due;
        logStep("Upcoming invoice found", { amount_due: upcoming.amount_due });
      }
    } catch (e: any) {
      logStep("No upcoming invoice", { reason: e?.message || "unknown" });
      // If no upcoming invoice, use current amount minus discount as estimate
      if (currentAmount !== null) {
        upcomingAmount = discountAmount ? (currentAmount - discountAmount) : currentAmount;
      }
    }

    logStep("Returning subscription data", {
      productId, priceId, subscriptionEnd, currentPeriodStart, subscriptionStart,
      status: subscriptionStatus, currentAmount, upcomingAmount, discountLabel,
    });

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
