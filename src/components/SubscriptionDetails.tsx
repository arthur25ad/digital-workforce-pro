import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getPackageByPriceId, PACKAGES } from "@/lib/packages";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  CreditCard, ArrowUpRight, AlertCircle, CheckCircle2,
  Crown, RefreshCw, ExternalLink, Shield, Users, Calendar,
  DollarSign, Clock, Sparkles, ArrowRight, XCircle,
} from "lucide-react";

interface SubscriptionData {
  subscribed: boolean;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
  subscription_start: string | null;
  current_period_start: string | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean;
  current_amount: number | null;
  upcoming_amount: number | null;
  currency: string | null;
  discount_label: string | null;
  discount_amount: number | null;
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle2 }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Active", icon: CheckCircle2 },
  trialing: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Free Trial", icon: Sparkles },
  past_due: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Past Due", icon: AlertCircle },
  canceled: { bg: "bg-red-500/10", text: "text-red-400", label: "Canceled", icon: XCircle },
  incomplete: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Incomplete", icon: Clock },
};

const planEmployees: Record<string, number> = { starter: 1, growth: 3, team: 4 };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(cents: number | null, currency?: string | null) {
  if (cents === null || cents === undefined) return "—";
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "usd" }).format(amount);
}

const SubscriptionDetails = () => {
  const { profile } = useAuth();
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<SubscriptionData>("check-subscription");
      if (error) throw error;
      setSubData(data);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) fetchSubscription();
  }, [profile?.id]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Could not open billing portal.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const pkg = subData?.price_id && subData.price_id !== "owner_bypass"
    ? getPackageByPriceId(subData.price_id)
    : null;

  const isOwnerBypass = subData?.price_id === "owner_bypass";
  const isSubscribed = subData?.subscribed === true;
  const status = subData?.subscription_status || (isSubscribed ? "active" : null);
  const statusStyle = status ? (statusConfig[status] || statusConfig.active) : null;
  const StatusIcon = statusStyle?.icon || CheckCircle2;
  const planKey = pkg?.key || profile?.active_package || "free";
  const planName = isOwnerBypass ? "Team" : pkg?.name || (planKey.charAt(0).toUpperCase() + planKey.slice(1));
  const includedEmployees = planEmployees[planKey] || 0;

  // Price display: prefer upcoming_amount (most accurate with promos), fall back to current_amount
  const displayAmount = subData?.upcoming_amount ?? subData?.current_amount;
  const baseAmount = subData?.current_amount;
  const hasDiscount = !!subData?.discount_label;
  const isDiscounted = hasDiscount && displayAmount !== null && baseAmount !== null && displayAmount < baseAmount;

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-muted/30 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border border-border/20 bg-background/40 p-4">
                <div className="h-3 w-20 rounded bg-muted/20 animate-pulse mb-2" />
                <div className="h-5 w-28 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        id="subscription"
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/15 border border-border/20">
            <CreditCard size={28} className="text-muted-foreground/40" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            No Active Subscription
          </h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
            You don't currently have an active plan. Choose a plan to unlock AI employees and start automating your business.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))",
              boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)",
            }}
          >
            Choose a Plan <ArrowRight size={14} />
          </Link>
          <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-border/15 bg-background/20 px-4 py-3 text-left max-w-sm mx-auto">
            <Shield size={13} className="shrink-0 text-muted-foreground/40 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
              We do not offer refunds, but you may cancel your subscription at any time.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      id="subscription"
      className="space-y-4"
    >
      {/* ── Current Plan Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-6 md:p-8"
        style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.06), hsl(262 60% 58% / 0.04), transparent)" }}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: "hsl(217 91% 60%)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Crown size={26} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="font-display text-2xl font-bold text-foreground">{planName} Plan</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <CheckCircle2 size={9} /> Current
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {pkg?.description || "Your active subscription plan"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          {statusStyle && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} shrink-0`}>
              <StatusIcon size={12} />
              {statusStyle.label}
              {subData?.cancel_at_period_end && (
                <span className="text-[10px] opacity-70 ml-0.5">· Cancels at period end</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Billing Details Grid ── */}
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/20 px-6 py-3.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Billing Details</span>
          <button
            onClick={fetchSubscription}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/10">
          {/* Current Price */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">Current Price</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-foreground">
                {isOwnerBypass ? "Free" : formatCurrency(displayAmount, subData?.currency)}
              </span>
              {!isOwnerBypass && <span className="text-xs text-muted-foreground">/month</span>}
            </div>
            {isDiscounted && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-muted-foreground/40 line-through">{formatCurrency(baseAmount, subData?.currency)}</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">{subData?.discount_label}</span>
              </div>
            )}
            {hasDiscount && !isDiscounted && (
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">{subData?.discount_label}</span>
              </div>
            )}
          </div>

          {/* Current Period */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">Current Period</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(subData?.current_period_start)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              to {formatDate(subData?.subscription_end)}
            </p>
          </div>

          {/* Next Billing Date */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">Next Billing</span>
            </div>
            {subData?.cancel_at_period_end ? (
              <>
                <p className="text-sm font-semibold text-red-400">No renewal</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">Access ends {formatDate(subData?.subscription_end)}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">{formatDate(subData?.subscription_end)}</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">Auto-renews</p>
              </>
            )}
          </div>

          {/* Subscribed Since */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">Subscribed Since</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{formatDate(subData?.subscription_start)}</p>
          </div>

          {/* AI Employees */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">AI Employees</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {profile?.unlocked_roles?.length || 0} of {includedEmployees} active
            </p>
          </div>

          {/* Plan Includes */}
          <div className="bg-card/60 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={13} className="text-muted-foreground/40" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground/50 font-medium">Plan Includes</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{includedEmployees} AI employee{includedEmployees !== 1 ? "s" : ""}</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              {planKey === "team" ? "Full AI team" : `Up to ${includedEmployees}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      {!isOwnerBypass && (
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 md:p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4 block">Manage</span>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/change-plan"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg flex-1 sm:flex-none"
              style={{
                background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))",
                boxShadow: "0 4px 20px hsl(217 91% 60% / 0.2)",
              }}
            >
              <ArrowUpRight size={15} />
              Change Plan
            </Link>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/60 px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50 flex-1 sm:flex-none"
            >
              <ExternalLink size={14} />
              {portalLoading ? "Opening…" : "Manage Billing"}
            </button>
            {!subData?.cancel_at_period_end && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex-1 sm:flex-none"
              >
                <XCircle size={14} />
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Refund policy ── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border/15 bg-background/20 px-4 py-3">
        <Shield size={12} className="shrink-0 text-muted-foreground/35 mt-0.5" />
        <p className="text-[11px] text-muted-foreground/45 leading-relaxed">
          We do not offer refunds, but you may cancel your subscription at any time. Your access will remain active until the end of the current billing period.
        </p>
      </div>
    </motion.div>
  );
};

export default SubscriptionDetails;
