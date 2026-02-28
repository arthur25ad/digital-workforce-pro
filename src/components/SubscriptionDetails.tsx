import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getPackageByPriceId, PACKAGES, PACKAGE_ORDER } from "@/lib/packages";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  CreditCard, ArrowUpRight, AlertCircle, CheckCircle2,
  Crown, RefreshCw, ExternalLink, Shield,
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
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Active" },
  trialing: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Trial" },
  past_due: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Past Due" },
  canceled: { bg: "bg-red-500/10", text: "text-red-400", label: "Canceled" },
  incomplete: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Incomplete" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  const statusStyle = status ? (statusColors[status] || statusColors.active) : null;
  const planName = isOwnerBypass ? "Team (Owner)" : pkg?.name || profile?.active_package?.charAt(0).toUpperCase() + (profile?.active_package?.slice(1) || "");
  const planPrice = pkg?.price || (isOwnerBypass ? "$129" : null);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-muted/30 animate-pulse" />
          <div className="h-5 w-48 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-4 w-full rounded bg-muted/20 animate-pulse" />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard size={16} className="text-primary" />
          </div>
          <span className="font-display text-sm font-semibold text-foreground">Subscription Details</span>
        </div>
        <button
          onClick={fetchSubscription}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      <div className="p-6 md:p-8">
        {isSubscribed ? (
          <>
            {/* Plan + Status row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Crown size={22} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-foreground">{planName}</span>
                    {planPrice && <span className="text-sm text-muted-foreground">{planPrice}/mo</span>}
                  </div>
                  <span className="inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary">
                    <CheckCircle2 size={10} /> Current Plan
                  </span>
                </div>
              </div>
              {statusStyle && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                  {subData?.cancel_at_period_end && (
                    <span className="text-[10px] opacity-70 ml-1">· Cancels at period end</span>
                  )}
                </span>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-border/20 bg-background/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-1">Subscribed Since</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(subData?.subscription_start)}</p>
              </div>
              <div className="rounded-xl border border-border/20 bg-background/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-1">Current Period</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(subData?.current_period_start)} — {formatDate(subData?.subscription_end)}
                </p>
              </div>
              <div className="rounded-xl border border-border/20 bg-background/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-1">Next Billing Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {subData?.cancel_at_period_end ? "No renewal (canceled)" : formatDate(subData?.subscription_end)}
                </p>
              </div>
              <div className="rounded-xl border border-border/20 bg-background/40 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-1">AI Employees</p>
                <p className="text-sm font-semibold text-foreground">{profile?.unlocked_roles?.length || 0} active</p>
              </div>
            </div>

            {/* Actions */}
            {!isOwnerBypass && (
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
                >
                  <ExternalLink size={14} />
                  {portalLoading ? "Opening…" : "Manage Subscription"}
                </button>
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))",
                    boxShadow: "0 0 20px hsl(217 91% 60% / 0.15)",
                  }}
                >
                  <ArrowUpRight size={14} />
                  Upgrade / Downgrade
                </button>
                {!subData?.cancel_at_period_end && (
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}

            {/* Refund policy */}
            <div className="flex items-start gap-2.5 rounded-xl border border-border/20 bg-background/30 px-4 py-3">
              <Shield size={14} className="shrink-0 text-muted-foreground/50 mt-0.5" />
              <p className="text-xs text-muted-foreground/70">
                We do not offer refunds, but you may cancel your subscription at any time. Your access will remain active until the end of the current billing period.
              </p>
            </div>
          </>
        ) : (
          /* No active subscription */
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/20">
              <AlertCircle size={24} className="text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              No Active Subscription
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              You don't currently have an active subscription. Choose a plan to unlock AI employees and start automating your business.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(262 60% 58%))",
                boxShadow: "0 0 20px hsl(217 91% 60% / 0.15)",
              }}
            >
              Choose a Plan <ArrowUpRight size={14} />
            </Link>
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border/20 bg-background/30 px-4 py-3 text-left max-w-md mx-auto">
              <Shield size={14} className="shrink-0 text-muted-foreground/50 mt-0.5" />
              <p className="text-xs text-muted-foreground/70">
                We do not offer refunds, but you may cancel your subscription at any time.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionDetails;
