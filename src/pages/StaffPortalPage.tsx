import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, DollarSign, Tag, Megaphone, LifeBuoy, Users, TrendingUp, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Eye, EyeOff, Clock, Pencil, X, Save, Zap, Timer, Ban, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { generateAdminSummary, type PromoCodeData } from "@/lib/promoRules";

const OWNER_EMAIL = "arthur25.ad@gmail.com";

interface DashboardData {
  revenue: { total: number; recent_charges: any[]; active_subscriptions: number; total_customers: number; total_users: number; subscriptions: any[] };
  promo_codes: any[];
  support_tickets: any[];
}

const StaffPortalPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Promo form state
  const [promoForm, setPromoForm] = useState({
    code: "",
    label: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    // Visibility
    is_visible_on_homepage: false,
    is_visible_on_pricing: false,
    is_private: false,
    // Plan overrides
    starter_discount: "",
    growth_discount: "",
    team_discount: "",
    // Billing control toggles
    enable_trial: false,
    trial_days: "",
    remove_trial: false,
    enable_discount: true,
    first_billing_cycle_only: false,
    discount_duration_months: "",
    recurring_discount: false,
    enable_billing_delay: false,
    billing_delay_days: "",
    new_customers_only: false,
  });
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const resetPromoForm = () => setPromoForm({
    code: "", label: "", description: "", discount_type: "percentage", discount_value: "", max_uses: "",
    is_visible_on_homepage: false, is_visible_on_pricing: false, is_private: false,
    starter_discount: "", growth_discount: "", team_discount: "",
    enable_trial: false, trial_days: "", remove_trial: false,
    enable_discount: true, first_billing_cycle_only: false, discount_duration_months: "", recurring_discount: false,
    enable_billing_delay: false, billing_delay_days: "", new_customers_only: false,
  });

  const verifyAccess = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("No session");
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-portal?action=verify`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Access denied");
      const json = await res.json();
      if (json.authorized) setAuthorized(true);
      else throw new Error("Not authorized");
    } catch {
      setAuthorized(false);
      navigate("/dashboard");
    } finally {
      setVerifying(false);
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) return;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-portal?action=dashboard`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.email !== OWNER_EMAIL) { navigate("/dashboard"); return; }
    verifyAccess();
  }, [user, profile, authLoading, navigate, verifyAccess]);

  useEffect(() => { if (authorized) fetchData(); }, [authorized, fetchData]);

  const callAction = async (action: string, body: any) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return null;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-portal?action=${action}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    return res.json();
  };

  const handleCreatePromo = async () => {
    if (!promoForm.code.trim()) return;
    setCreatingPromo(true);
    try {
      await callAction("create-promo", {
        code: promoForm.code.trim(),
        label: promoForm.label,
        discount_type: promoForm.discount_type,
        discount_value: promoForm.enable_discount ? (parseFloat(promoForm.discount_value) || 0) : 0,
        description: promoForm.description,
        max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
        is_visible_on_homepage: promoForm.is_visible_on_homepage,
        is_visible_on_pricing: promoForm.is_visible_on_pricing,
        is_private: promoForm.is_private,
        starter_discount: promoForm.starter_discount ? parseFloat(promoForm.starter_discount) : 0,
        growth_discount: promoForm.growth_discount ? parseFloat(promoForm.growth_discount) : 0,
        team_discount: promoForm.team_discount ? parseFloat(promoForm.team_discount) : 0,
        first_billing_cycle_only: promoForm.first_billing_cycle_only,
        trial_days: promoForm.enable_trial ? (parseInt(promoForm.trial_days) || null) : null,
        remove_trial: promoForm.remove_trial,
        billing_delay_days: promoForm.enable_billing_delay ? (parseInt(promoForm.billing_delay_days) || null) : null,
        discount_duration_months: promoForm.discount_duration_months ? parseInt(promoForm.discount_duration_months) : null,
        recurring_discount: promoForm.recurring_discount,
        new_customers_only: promoForm.new_customers_only,
      });
      resetPromoForm();
      toast({ title: "Promo code created" });
      fetchData();
    } catch { toast({ title: "Failed to create promo", variant: "destructive" }); }
    finally { setCreatingPromo(false); }
  };

  const handleTogglePromo = async (id: string, currentActive: boolean) => {
    await callAction("toggle-promo", { id, is_active: !currentActive });
    fetchData();
  };

  const handleToggleField = async (id: string, field: string, value: boolean) => {
    await callAction("update-promo", { id, [field]: value });
    fetchData();
  };

  const handleDeletePromo = async (id: string) => {
    await callAction("delete-promo", { id });
    toast({ title: "Promo deleted" });
    fetchData();
  };

  const startEditPromo = (p: any) => {
    setEditingPromoId(p.id);
    setEditForm({
      label: p.label || "",
      discount_type: p.discount_type || "percentage",
      discount_value: p.discount_value?.toString() || "0",
      description: p.description || "",
      max_uses: p.max_uses?.toString() || "",
      starter_discount: p.starter_discount?.toString() || "0",
      growth_discount: p.growth_discount?.toString() || "0",
      team_discount: p.team_discount?.toString() || "0",
      first_billing_cycle_only: p.first_billing_cycle_only || false,
      is_visible_on_homepage: p.is_visible_on_homepage || false,
      is_visible_on_pricing: p.is_visible_on_pricing || false,
      is_private: p.is_private || false,
      trial_days: p.trial_days?.toString() || "",
      remove_trial: p.remove_trial || false,
      billing_delay_days: p.billing_delay_days?.toString() || "",
      discount_duration_months: p.discount_duration_months?.toString() || "",
      recurring_discount: p.recurring_discount || false,
      new_customers_only: p.new_customers_only || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPromoId) return;
    try {
      await callAction("update-promo", {
        id: editingPromoId,
        label: editForm.label,
        discount_type: editForm.discount_type,
        discount_value: parseFloat(editForm.discount_value) || 0,
        description: editForm.description,
        max_uses: editForm.max_uses ? parseInt(editForm.max_uses) : null,
        starter_discount: parseFloat(editForm.starter_discount) || 0,
        growth_discount: parseFloat(editForm.growth_discount) || 0,
        team_discount: parseFloat(editForm.team_discount) || 0,
        first_billing_cycle_only: editForm.first_billing_cycle_only,
        is_visible_on_homepage: editForm.is_visible_on_homepage,
        is_visible_on_pricing: editForm.is_visible_on_pricing,
        is_private: editForm.is_private,
        trial_days: editForm.trial_days ? parseInt(editForm.trial_days) : null,
        remove_trial: editForm.remove_trial,
        billing_delay_days: editForm.billing_delay_days ? parseInt(editForm.billing_delay_days) : null,
        discount_duration_months: editForm.discount_duration_months ? parseInt(editForm.discount_duration_months) : null,
        recurring_discount: editForm.recurring_discount,
        new_customers_only: editForm.new_customers_only,
      });
      toast({ title: "Promo updated" });
      setEditingPromoId(null);
      fetchData();
    } catch {
      toast({ title: "Failed to update promo", variant: "destructive" });
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: string) => {
    await callAction("update-ticket-status", { id, status });
    toast({ title: `Ticket marked as ${status}` });
    fetchData();
  };

  // Build live summary from create form
  const liveCreateSummary = generateAdminSummary({
    discount_type: promoForm.discount_type,
    discount_value: promoForm.enable_discount ? (parseFloat(promoForm.discount_value) || 0) : 0,
    first_billing_cycle_only: promoForm.first_billing_cycle_only,
    trial_days: promoForm.enable_trial ? (parseInt(promoForm.trial_days) || 0) : null,
    remove_trial: promoForm.remove_trial,
    billing_delay_days: promoForm.enable_billing_delay ? (parseInt(promoForm.billing_delay_days) || 0) : null,
    discount_duration_months: promoForm.discount_duration_months ? parseInt(promoForm.discount_duration_months) : null,
    recurring_discount: promoForm.recurring_discount,
    new_customers_only: promoForm.new_customers_only,
    max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
    is_private: promoForm.is_private,
    starter_discount: promoForm.starter_discount ? parseFloat(promoForm.starter_discount) : 0,
    growth_discount: promoForm.growth_discount ? parseFloat(promoForm.growth_discount) : 0,
    team_discount: promoForm.team_discount ? parseFloat(promoForm.team_discount) : 0,
  } as any);

  if (authLoading || verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authorized) return null;

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (ts: number | string) => {
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft size={20} /></Link>
            <Shield size={22} className="text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Staff Portal</h1>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">INTERNAL</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData} disabled={loadingData}>
            <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} />
            <span className="ml-1.5 text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard icon={<DollarSign size={18} />} label="Total Revenue" value={data ? formatCurrency(data.revenue.total) : "—"} />
          <SummaryCard icon={<Users size={18} />} label="Total Users" value={data?.revenue.total_users?.toString() || "—"} />
          <SummaryCard icon={<TrendingUp size={18} />} label="Active Subs" value={data?.revenue.active_subscriptions?.toString() || "—"} />
          <SummaryCard icon={<LifeBuoy size={18} />} label="Open Tickets" value={data ? data.support_tickets.filter((t: any) => t.status === "open").length.toString() : "—"} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/50">
            <TabsTrigger value="revenue" className="text-xs gap-1.5"><DollarSign size={14} />Revenue</TabsTrigger>
            <TabsTrigger value="promos" className="text-xs gap-1.5"><Tag size={14} />Promo Codes</TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs gap-1.5"><Megaphone size={14} />Marketing</TabsTrigger>
            <TabsTrigger value="support" className="text-xs gap-1.5"><LifeBuoy size={14} />Support</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Active Subscriptions</CardTitle></CardHeader>
              <CardContent>
                {data?.revenue.subscriptions.length ? (
                  <div className="space-y-3">
                    {data.revenue.subscriptions.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30 text-sm">
                        <div>
                          <span className="font-medium">{s.customer_email || "Unknown"}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{formatCurrency(s.plan_amount)}/{s.plan_interval}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Renews {formatDate(s.current_period_end)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No active subscriptions</p>}
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Recent Charges</CardTitle></CardHeader>
              <CardContent>
                {data?.revenue.recent_charges.length ? (
                  <div className="space-y-2">
                    {data.revenue.recent_charges.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30 text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant={c.status === "succeeded" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                          <span>{c.customer_email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-medium">{formatCurrency(c.amount)}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(c.created)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No charges yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════ PROMO CODES TAB (Upgraded) ══════════ */}
          <TabsContent value="promos" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles size={16} className="text-primary" />Create Promo Code</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {/* Live summary */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[11px] font-medium text-primary mb-0.5">Preview</p>
                  <p className="text-xs text-foreground/80">{liveCreateSummary}</p>
                </div>

                {/* Section 1: Code identity */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Code Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Promo code</Label>
                      <Input placeholder="e.g. SAVE20" value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} className="font-mono" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Banner headline</Label>
                      <Input placeholder="e.g. Limited Time Offer" value={promoForm.label} onChange={(e) => setPromoForm({ ...promoForm, label: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Internal note</Label>
                      <Input placeholder="e.g. Q1 launch campaign" value={promoForm.description} onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Billing Rules */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Billing Rules</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Add free trial */}
                    <ToggleCard
                      icon={<Zap size={14} />}
                      label="Add free trial"
                      description="Give a custom trial period"
                      checked={promoForm.enable_trial}
                      onCheckedChange={(v) => setPromoForm({ ...promoForm, enable_trial: v, remove_trial: v ? false : promoForm.remove_trial })}
                      disabled={promoForm.remove_trial}
                    >
                      {promoForm.enable_trial && (
                        <div className="mt-2">
                          <Label className="text-[10px] text-muted-foreground mb-0.5 block">Trial days</Label>
                          <Input className="h-7 text-xs" type="number" placeholder="e.g. 14" value={promoForm.trial_days} onChange={(e) => setPromoForm({ ...promoForm, trial_days: e.target.value })} />
                        </div>
                      )}
                    </ToggleCard>

                    {/* Remove trial */}
                    <ToggleCard
                      icon={<Ban size={14} />}
                      label="Remove trial"
                      description="Bill immediately, skip default trial"
                      checked={promoForm.remove_trial}
                      onCheckedChange={(v) => setPromoForm({ ...promoForm, remove_trial: v, enable_trial: v ? false : promoForm.enable_trial })}
                      disabled={promoForm.enable_trial}
                    />

                    {/* Delay first payment */}
                    <ToggleCard
                      icon={<Timer size={14} />}
                      label="Delay first payment"
                      description="Push first charge forward"
                      checked={promoForm.enable_billing_delay}
                      onCheckedChange={(v) => setPromoForm({ ...promoForm, enable_billing_delay: v })}
                    >
                      {promoForm.enable_billing_delay && (
                        <div className="mt-2">
                          <Label className="text-[10px] text-muted-foreground mb-0.5 block">Delay days</Label>
                          <Input className="h-7 text-xs" type="number" placeholder="e.g. 7" value={promoForm.billing_delay_days} onChange={(e) => setPromoForm({ ...promoForm, billing_delay_days: e.target.value })} />
                        </div>
                      )}
                    </ToggleCard>
                  </div>
                </div>

                {/* Section 3: Discount */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs font-semibold text-foreground">Discount</p>
                    <Switch checked={promoForm.enable_discount} onCheckedChange={(v) => setPromoForm({ ...promoForm, enable_discount: v })} className="scale-75" />
                  </div>
                  {promoForm.enable_discount && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-1 block">Discount type</Label>
                          <Select value={promoForm.discount_type} onValueChange={(v) => setPromoForm({ ...promoForm, discount_type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed amount ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-1 block">Amount</Label>
                          <Input placeholder={promoForm.discount_type === "percentage" ? "e.g. 20" : "e.g. 10"} type="number" value={promoForm.discount_value} onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground mb-1 block">Duration</Label>
                          <Select
                            value={promoForm.recurring_discount ? "forever" : promoForm.discount_duration_months ? "multi" : promoForm.first_billing_cycle_only ? "once" : "once"}
                            onValueChange={(v) => {
                              if (v === "once") setPromoForm({ ...promoForm, first_billing_cycle_only: true, recurring_discount: false, discount_duration_months: "" });
                              else if (v === "multi") setPromoForm({ ...promoForm, first_billing_cycle_only: false, recurring_discount: false, discount_duration_months: promoForm.discount_duration_months || "3" });
                              else setPromoForm({ ...promoForm, first_billing_cycle_only: false, recurring_discount: true, discount_duration_months: "" });
                            }}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once">First month only</SelectItem>
                              <SelectItem value="multi">Multiple months</SelectItem>
                              <SelectItem value="forever">Every month (forever)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {!promoForm.recurring_discount && !promoForm.first_billing_cycle_only && promoForm.discount_duration_months && (
                        <div className="max-w-[200px]">
                          <Label className="text-[11px] text-muted-foreground mb-1 block">Number of months</Label>
                          <Input className="h-8 text-xs" type="number" placeholder="e.g. 3" value={promoForm.discount_duration_months} onChange={(e) => setPromoForm({ ...promoForm, discount_duration_months: e.target.value })} />
                        </div>
                      )}
                      {/* Plan-specific overrides */}
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-2">Per-plan overrides (leave blank to use default)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-0.5 block">Starter</Label>
                            <Input className="h-7 text-xs" placeholder="—" type="number" value={promoForm.starter_discount} onChange={(e) => setPromoForm({ ...promoForm, starter_discount: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-0.5 block">Growth</Label>
                            <Input className="h-7 text-xs" placeholder="—" type="number" value={promoForm.growth_discount} onChange={(e) => setPromoForm({ ...promoForm, growth_discount: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-0.5 block">Team</Label>
                            <Input className="h-7 text-xs" placeholder="—" type="number" value={promoForm.team_discount} onChange={(e) => setPromoForm({ ...promoForm, team_discount: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Visibility & Restrictions */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Visibility & Restrictions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <ToggleChip label="Homepage banner" checked={promoForm.is_visible_on_homepage} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_visible_on_homepage: v })} />
                    <ToggleChip label="Pricing badge" checked={promoForm.is_visible_on_pricing} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_visible_on_pricing: v })} />
                    <ToggleChip label="Private code" checked={promoForm.is_private} onCheckedChange={(v) => setPromoForm({ ...promoForm, is_private: v })} />
                    <ToggleChip label="New customers only" checked={promoForm.new_customers_only} onCheckedChange={(v) => setPromoForm({ ...promoForm, new_customers_only: v })} />
                    <div>
                      <Label className="text-[10px] text-muted-foreground mb-0.5 block">Max uses</Label>
                      <Input className="h-7 text-xs" placeholder="Unlimited" type="number" value={promoForm.max_uses} onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreatePromo} disabled={creatingPromo || !promoForm.code} size="sm">
                  <Plus size={14} className="mr-1" /> Create Promo Code
                </Button>
              </CardContent>
            </Card>

            {/* Existing Promo Codes */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Existing Promo Codes</CardTitle></CardHeader>
              <CardContent>
                {data?.promo_codes.length ? (
                  <div className="space-y-3">
                    {data.promo_codes.map((p: any) => (
                      <div key={p.id} className="py-3 px-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                        {editingPromoId === p.id ? (
                          <EditPromoForm
                            p={p}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            onSave={handleSaveEdit}
                            onCancel={() => setEditingPromoId(null)}
                          />
                        ) : (
                          <ViewPromoRow
                            p={p}
                            onEdit={() => startEditPromo(p)}
                            onToggle={() => handleTogglePromo(p.id, p.is_active)}
                            onDelete={() => handleDeletePromo(p.id)}
                            onToggleField={handleToggleField}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No promo codes yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Active Promo Codes</p>
                  <p className="text-2xl font-bold">{data?.promo_codes.filter((p: any) => p.is_active).length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl font-bold">{data?.revenue.total_customers || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground mb-1">Registered Users</p>
                  <p className="text-2xl font-bold">{data?.revenue.total_users || 0}</p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Growth Overview</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {data?.revenue.active_subscriptions || 0} active subscriptions generating{" "}
                  {data ? formatCurrency(data.revenue.total) : "$0.00"} in total revenue across{" "}
                  {data?.revenue.total_customers || 0} Stripe customers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  Support Tickets
                  <Badge variant="outline" className="text-[10px]">{data?.support_tickets.length || 0} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.support_tickets.length ? (
                  <div className="space-y-3">
                    {data.support_tickets.map((t: any) => (
                      <div key={t.id} className="py-3 px-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={t.status === "open" ? "destructive" : t.status === "in_progress" ? "default" : "secondary"} className="text-[10px]">
                              {t.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                            <span className="text-sm font-medium">{t.subject}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(t.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.message}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">From: {t.user_name} ({t.user_email})</span>
                          <div className="ml-auto flex gap-1">
                            {t.status !== "in_progress" && <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "in_progress")}>In Progress</Button>}
                            {t.status !== "resolved" && <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "resolved")}>Resolve</Button>}
                            {t.status !== "closed" && <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "closed")}>Close</Button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No tickets yet</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ── Reusable sub-components ──

const SummaryCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card className="bg-card/50 border-border/50">
    <CardContent className="pt-5 pb-4 flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const ToggleCard = ({ icon, label, description, checked, onCheckedChange, disabled, children }: {
  icon: React.ReactNode; label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean; children?: React.ReactNode;
}) => (
  <div className={`p-3 rounded-lg border transition-colors ${checked ? "border-primary/40 bg-primary/5" : "border-border/30 bg-muted/10"} ${disabled ? "opacity-40" : ""}`}>
    <div className="flex items-start gap-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="mt-0.5 scale-90" />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-primary">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
        {children}
      </div>
    </div>
  </div>
);

const ToggleChip = ({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/10 border border-border/30">
    <Switch checked={checked} onCheckedChange={onCheckedChange} className="scale-75" />
    <span className="text-[11px]">{label}</span>
  </div>
);

const ViewPromoRow = ({ p, onEdit, onToggle, onDelete, onToggleField }: any) => {
  const summary = generateAdminSummary(p as PromoCodeData);
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant={p.is_active ? "default" : "secondary"} className="text-[10px] font-mono">{p.code}</Badge>
          {p.label && <span className="text-xs text-muted-foreground">— {p.label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{p.usage_count} uses</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title="Edit"><Pencil size={14} /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle} title={p.is_active ? "Deactivate" : "Activate"}>
            {p.is_active ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 size={14} /></Button>
        </div>
      </div>
      {/* Plain-English summary */}
      <p className="text-[11px] text-foreground/70 italic">{summary}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => onToggleField(p.id, "is_visible_on_homepage", !p.is_visible_on_homepage)}
          className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_visible_on_homepage ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-border/40 text-muted-foreground"}`}>
          {p.is_visible_on_homepage ? <Eye size={10} /> : <EyeOff size={10} />} Homepage
        </button>
        <button onClick={() => onToggleField(p.id, "is_visible_on_pricing", !p.is_visible_on_pricing)}
          className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_visible_on_pricing ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-border/40 text-muted-foreground"}`}>
          {p.is_visible_on_pricing ? <Eye size={10} /> : <EyeOff size={10} />} Pricing
        </button>
        <button onClick={() => onToggleField(p.id, "is_private", !p.is_private)}
          className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_private ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-border/40 text-muted-foreground"}`}>
          {p.is_private ? <EyeOff size={10} /> : <Eye size={10} />} {p.is_private ? "Private" : "Public"}
        </button>
      </div>
    </>
  );
};

const EditPromoForm = ({ p, editForm, setEditForm, onSave, onCancel }: any) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Badge variant="default" className="text-[10px] font-mono">{p.code}</Badge>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}><X size={14} /></Button>
        <Button variant="default" size="sm" className="h-7 text-[11px] px-2 gap-1" onClick={onSave}><Save size={12} />Save</Button>
      </div>
    </div>
    {/* Basic info */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Banner headline</Label>
        <Input className="h-8 text-xs" value={editForm.label} onChange={(e: any) => setEditForm({ ...editForm, label: e.target.value })} />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Internal note</Label>
        <Input className="h-8 text-xs" value={editForm.description} onChange={(e: any) => setEditForm({ ...editForm, description: e.target.value })} />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Max uses</Label>
        <Input className="h-8 text-xs" type="number" value={editForm.max_uses} onChange={(e: any) => setEditForm({ ...editForm, max_uses: e.target.value })} placeholder="Unlimited" />
      </div>
    </div>
    {/* Billing rules */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.remove_trial} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, remove_trial: v })} className="scale-75" />
        <span className="text-[10px]">Remove trial</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Trial days:</span>
        <Input className="h-6 text-[10px] w-14" type="number" value={editForm.trial_days} onChange={(e: any) => setEditForm({ ...editForm, trial_days: e.target.value })} placeholder="—" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Delay days:</span>
        <Input className="h-6 text-[10px] w-14" type="number" value={editForm.billing_delay_days} onChange={(e: any) => setEditForm({ ...editForm, billing_delay_days: e.target.value })} placeholder="—" />
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.new_customers_only} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, new_customers_only: v })} className="scale-75" />
        <span className="text-[10px]">New only</span>
      </div>
    </div>
    {/* Discount */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Discount type</Label>
        <Select value={editForm.discount_type} onValueChange={(v: string) => setEditForm({ ...editForm, discount_type: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed ($)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Amount</Label>
        <Input className="h-8 text-xs" type="number" value={editForm.discount_value} onChange={(e: any) => setEditForm({ ...editForm, discount_value: e.target.value })} />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Duration months</Label>
        <Input className="h-8 text-xs" type="number" value={editForm.discount_duration_months} onChange={(e: any) => setEditForm({ ...editForm, discount_duration_months: e.target.value })} placeholder="—" />
      </div>
    </div>
    {/* Plan overrides */}
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Starter override</Label>
        <Input className="h-7 text-xs" type="number" value={editForm.starter_discount} onChange={(e: any) => setEditForm({ ...editForm, starter_discount: e.target.value })} />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Growth override</Label>
        <Input className="h-7 text-xs" type="number" value={editForm.growth_discount} onChange={(e: any) => setEditForm({ ...editForm, growth_discount: e.target.value })} />
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground mb-0.5 block">Team override</Label>
        <Input className="h-7 text-xs" type="number" value={editForm.team_discount} onChange={(e: any) => setEditForm({ ...editForm, team_discount: e.target.value })} />
      </div>
    </div>
    {/* Toggles row */}
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.is_visible_on_homepage} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, is_visible_on_homepage: v })} className="scale-75" />
        <span className="text-[10px]">Homepage</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.is_visible_on_pricing} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, is_visible_on_pricing: v })} className="scale-75" />
        <span className="text-[10px]">Pricing</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.is_private} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, is_private: v })} className="scale-75" />
        <span className="text-[10px]">Private</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.first_billing_cycle_only} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, first_billing_cycle_only: v })} className="scale-75" />
        <span className="text-[10px]">1st month only</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Switch checked={editForm.recurring_discount} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, recurring_discount: v })} className="scale-75" />
        <span className="text-[10px]">Recurring</span>
      </div>
    </div>
  </div>
);

export default StaffPortalPage;
