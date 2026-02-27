import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const OWNER_EMAIL = "arthur25.ad@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

async function verifyOwner(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Not authenticated");
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid token");
  if (data.user.email !== OWNER_EMAIL) throw new Error("Access denied");
  return data.user.email;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    await verifyOwner(req);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "dashboard";

    if (action === "verify") {
      return new Response(JSON.stringify({ authorized: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "dashboard") {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      let recentCharges: any[] = [];
      let customers: any[] = [];
      let subscriptions: any[] = [];
      let totalRevenue = 0;
      let activeSubscriptions = 0;

      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const chargesRes = await stripe.charges.list({ limit: 20 });
        recentCharges = chargesRes.data.map((c) => ({
          id: c.id, amount: c.amount, currency: c.currency, status: c.status,
          customer_email: c.billing_details?.email || c.receipt_email || "",
          description: c.description || "", created: c.created,
        }));
        totalRevenue = chargesRes.data.filter((c) => c.status === "succeeded").reduce((sum, c) => sum + c.amount, 0);
        const custRes = await stripe.customers.list({ limit: 50 });
        customers = custRes.data.map((c) => ({ id: c.id, email: c.email, name: c.name, created: c.created }));
        const subsRes = await stripe.subscriptions.list({ status: "active", limit: 50 });
        activeSubscriptions = subsRes.data.length;
        subscriptions = subsRes.data.map((s) => ({
          id: s.id, customer: s.customer, status: s.status,
          current_period_end: s.current_period_end,
          plan_amount: s.items.data[0]?.price?.unit_amount || 0,
          plan_interval: s.items.data[0]?.price?.recurring?.interval || "",
          customer_email: "",
        }));
        for (const sub of subscriptions) {
          const cust = customers.find((c) => c.id === sub.customer);
          if (cust) sub.customer_email = cust.email;
        }
      }

      const { data: promoCodes } = await supabaseAdmin.from("promo_codes").select("*").order("created_at", { ascending: false });
      const { data: supportTickets } = await supabaseAdmin.from("public_support_tickets").select("*").order("created_at", { ascending: false }).limit(50);
      const { count: totalUsers } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });

      return new Response(JSON.stringify({
        revenue: { total: totalRevenue, recent_charges: recentCharges, active_subscriptions: activeSubscriptions, total_customers: customers.length, total_users: totalUsers || 0, subscriptions },
        promo_codes: promoCodes || [],
        support_tickets: supportTickets || [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Promo code CRUD
    if (action === "create-promo") {
      const body = await req.json();
      const { data, error } = await supabaseAdmin.from("promo_codes").insert({
        code: body.code?.toUpperCase(),
        label: body.label || "",
        discount_type: body.discount_type || "percentage",
        discount_value: body.discount_value || 0,
        description: body.description || "",
        max_uses: body.max_uses || null,
        expires_at: body.expires_at || null,
        is_visible_on_homepage: body.is_visible_on_homepage || false,
        is_visible_on_pricing: body.is_visible_on_pricing || false,
        is_private: body.is_private || false,
        starter_discount: body.starter_discount || 0,
        growth_discount: body.growth_discount || 0,
        team_discount: body.team_discount || 0,
        first_billing_cycle_only: body.first_billing_cycle_only || false,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
      }).select().single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update-promo") {
      const body = await req.json();
      const updateFields: any = {};
      if (body.label !== undefined) updateFields.label = body.label;
      if (body.discount_type !== undefined) updateFields.discount_type = body.discount_type;
      if (body.discount_value !== undefined) updateFields.discount_value = body.discount_value;
      if (body.description !== undefined) updateFields.description = body.description;
      if (body.max_uses !== undefined) updateFields.max_uses = body.max_uses;
      if (body.is_active !== undefined) updateFields.is_active = body.is_active;
      if (body.is_visible_on_homepage !== undefined) updateFields.is_visible_on_homepage = body.is_visible_on_homepage;
      if (body.is_visible_on_pricing !== undefined) updateFields.is_visible_on_pricing = body.is_visible_on_pricing;
      if (body.is_private !== undefined) updateFields.is_private = body.is_private;
      if (body.starter_discount !== undefined) updateFields.starter_discount = body.starter_discount;
      if (body.growth_discount !== undefined) updateFields.growth_discount = body.growth_discount;
      if (body.team_discount !== undefined) updateFields.team_discount = body.team_discount;
      if (body.first_billing_cycle_only !== undefined) updateFields.first_billing_cycle_only = body.first_billing_cycle_only;
      if (body.start_date !== undefined) updateFields.start_date = body.start_date;
      if (body.end_date !== undefined) updateFields.end_date = body.end_date;

      const { data, error } = await supabaseAdmin.from("promo_codes").update(updateFields).eq("id", body.id).select().single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "toggle-promo") {
      const body = await req.json();
      const { data, error } = await supabaseAdmin.from("promo_codes").update({ is_active: body.is_active }).eq("id", body.id).select().single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete-promo") {
      const body = await req.json();
      const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", body.id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update-ticket-status") {
      const body = await req.json();
      const { data, error } = await supabaseAdmin.from("public_support_tickets").update({ status: body.status, admin_notes: body.admin_notes || "" }).eq("id", body.id).select().single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const status = msg === "Access denied" ? 403 : msg === "Not authenticated" ? 401 : 500;
    return new Response(JSON.stringify({ error: msg }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status });
  }
});
