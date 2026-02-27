import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, DollarSign, Tag, Megaphone, LifeBuoy, Users, TrendingUp, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Eye, EyeOff, Clock } from "lucide-react";
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
  const [promoCode, setPromoCode] = useState("");
  const [promoLabel, setPromoLabel] = useState("");
  const [promoType, setPromoType] = useState("percentage");
  const [promoValue, setPromoValue] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoMaxUses, setPromoMaxUses] = useState("");
  const [promoVisibleHomepage, setPromoVisibleHomepage] = useState(false);
  const [promoVisiblePricing, setPromoVisiblePricing] = useState(false);
  const [promoPrivate, setPromoPrivate] = useState(false);
  const [promoStarterDiscount, setPromoStarterDiscount] = useState("");
  const [promoGrowthDiscount, setPromoGrowthDiscount] = useState("");
  const [promoTeamDiscount, setPromoTeamDiscount] = useState("");
  const [promoFirstCycleOnly, setPromoFirstCycleOnly] = useState(false);
  const [creatingPromo, setCreatingPromo] = useState(false);

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
    if (!promoCode.trim() || !promoValue) return;
    setCreatingPromo(true);
    try {
      await callAction("create-promo", {
        code: promoCode.trim(),
        label: promoLabel,
        discount_type: promoType,
        discount_value: parseFloat(promoValue),
        description: promoDesc,
        max_uses: promoMaxUses ? parseInt(promoMaxUses) : null,
        is_visible_on_homepage: promoVisibleHomepage,
        is_visible_on_pricing: promoVisiblePricing,
        is_private: promoPrivate,
        starter_discount: promoStarterDiscount ? parseFloat(promoStarterDiscount) : 0,
        growth_discount: promoGrowthDiscount ? parseFloat(promoGrowthDiscount) : 0,
        team_discount: promoTeamDiscount ? parseFloat(promoTeamDiscount) : 0,
        first_billing_cycle_only: promoFirstCycleOnly,
      });
      setPromoCode(""); setPromoLabel(""); setPromoValue(""); setPromoDesc(""); setPromoMaxUses("");
      setPromoVisibleHomepage(false); setPromoVisiblePricing(false); setPromoPrivate(false);
      setPromoStarterDiscount(""); setPromoGrowthDiscount(""); setPromoTeamDiscount("");
      setPromoFirstCycleOnly(false);
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

  const handleUpdateTicketStatus = async (id: string, status: string) => {
    await callAction("update-ticket-status", { id, status });
    toast({ title: `Ticket marked as ${status}` });
    fetchData();
  };

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

          {/* Promo Codes Tab */}
          <TabsContent value="promos" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Create Promo Code</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {/* Section 1: Code identity */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Code Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="promo-code" className="text-[11px] text-muted-foreground mb-1 block">Promo code (what users type)</Label>
                      <Input id="promo-code" placeholder="e.g. SAVE20" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="font-mono" />
                    </div>
                    <div>
                      <Label htmlFor="promo-label" className="text-[11px] text-muted-foreground mb-1 block">Banner headline (shown publicly)</Label>
                      <Input id="promo-label" placeholder="e.g. Limited Time Offer" value={promoLabel} onChange={(e) => setPromoLabel(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="promo-desc" className="text-[11px] text-muted-foreground mb-1 block">Internal note (staff only)</Label>
                      <Input id="promo-desc" placeholder="e.g. Q1 launch campaign" value={promoDesc} onChange={(e) => setPromoDesc(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Default discount */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Default Discount</p>
                  <p className="text-[11px] text-muted-foreground mb-2">Applied to all plans unless overridden below</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Discount type</Label>
                      <Select value={promoType} onValueChange={setPromoType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Discount amount</Label>
                      <Input placeholder={promoType === "percentage" ? "e.g. 20" : "e.g. 10"} type="number" value={promoValue} onChange={(e) => setPromoValue(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Max total uses (leave empty = unlimited)</Label>
                      <Input placeholder="e.g. 100" type="number" value={promoMaxUses} onChange={(e) => setPromoMaxUses(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 3: Plan-specific overrides */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Per-Plan Discount Overrides</p>
                  <p className="text-[11px] text-muted-foreground mb-2">Leave blank to use the default discount above. Fill in to give a specific plan a different discount.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Starter ({promoType === "percentage" ? "%" : "$"})</Label>
                      <Input placeholder="—" type="number" value={promoStarterDiscount} onChange={(e) => setPromoStarterDiscount(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Growth ({promoType === "percentage" ? "%" : "$"})</Label>
                      <Input placeholder="—" type="number" value={promoGrowthDiscount} onChange={(e) => setPromoGrowthDiscount(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Team ({promoType === "percentage" ? "%" : "$"})</Label>
                      <Input placeholder="—" type="number" value={promoTeamDiscount} onChange={(e) => setPromoTeamDiscount(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Section 4: Visibility & behavior toggles */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Visibility & Behavior</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/10 border border-border/30">
                      <Switch checked={promoVisibleHomepage} onCheckedChange={setPromoVisibleHomepage} id="hp" className="mt-0.5" />
                      <div>
                        <Label htmlFor="hp" className="text-xs font-medium block">Homepage banner</Label>
                        <span className="text-[10px] text-muted-foreground">Show green promo strip on homepage</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/10 border border-border/30">
                      <Switch checked={promoVisiblePricing} onCheckedChange={setPromoVisiblePricing} id="pr" className="mt-0.5" />
                      <div>
                        <Label htmlFor="pr" className="text-xs font-medium block">Pricing badge</Label>
                        <span className="text-[10px] text-muted-foreground">Show promo available on pricing page</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/10 border border-border/30">
                      <Switch checked={promoPrivate} onCheckedChange={setPromoPrivate} id="pv" className="mt-0.5" />
                      <div>
                        <Label htmlFor="pv" className="text-xs font-medium block">Private / hidden</Label>
                        <span className="text-[10px] text-muted-foreground">Only works when manually entered</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/10 border border-border/30">
                      <Switch checked={promoFirstCycleOnly} onCheckedChange={setPromoFirstCycleOnly} id="fc" className="mt-0.5" />
                      <div>
                        <Label htmlFor="fc" className="text-xs font-medium block">First month only</Label>
                        <span className="text-[10px] text-muted-foreground">Discount applies to 1st billing cycle, then full price</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCreatePromo} disabled={creatingPromo || !promoCode || !promoValue} size="sm">
                  <Plus size={14} className="mr-1" /> Create Promo Code
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Existing Promo Codes</CardTitle></CardHeader>
              <CardContent>
                {data?.promo_codes.length ? (
                  <div className="space-y-3">
                    {data.promo_codes.map((p: any) => (
                      <div key={p.id} className="py-3 px-4 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant={p.is_active ? "default" : "secondary"} className="text-[10px] font-mono">{p.code}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {p.discount_type === "percentage" ? `${p.discount_value}% off` : `$${p.discount_value} off`}
                            </span>
                            {p.label && <span className="text-xs text-muted-foreground">— {p.label}</span>}
                            {p.first_billing_cycle_only && (
                              <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400"><Clock size={10} className="mr-1" />1st month only</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{p.usage_count} uses</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePromo(p.id, p.is_active)} title={p.is_active ? "Deactivate" : "Activate"}>
                              {p.is_active ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeletePromo(p.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        {/* Visibility toggles */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <button
                            onClick={() => handleToggleField(p.id, "is_visible_on_homepage", !p.is_visible_on_homepage)}
                            className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_visible_on_homepage ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-border/40 text-muted-foreground"}`}
                          >
                            {p.is_visible_on_homepage ? <Eye size={10} /> : <EyeOff size={10} />} Homepage banner
                          </button>
                          <button
                            onClick={() => handleToggleField(p.id, "is_visible_on_pricing", !p.is_visible_on_pricing)}
                            className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_visible_on_pricing ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-border/40 text-muted-foreground"}`}
                          >
                            {p.is_visible_on_pricing ? <Eye size={10} /> : <EyeOff size={10} />} Pricing badge
                          </button>
                          <button
                            onClick={() => handleToggleField(p.id, "is_private", !p.is_private)}
                            className={`flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 border transition-colors ${p.is_private ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-border/40 text-muted-foreground"}`}
                          >
                            {p.is_private ? <EyeOff size={10} /> : <Eye size={10} />} {p.is_private ? "Hidden / private" : "Public"}
                          </button>
                          {/* Plan-specific badges */}
                          {(p.starter_discount > 0 || p.growth_discount > 0 || p.team_discount > 0) && (
                            <span className="text-[10px] text-muted-foreground">
                              Overrides: {p.starter_discount > 0 ? `Starter: ${p.starter_discount}` : ""} {p.growth_discount > 0 ? `Growth: ${p.growth_discount}` : ""} {p.team_discount > 0 ? `Team: ${p.team_discount}` : ""}
                            </span>
                          )}
                        </div>
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
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t.user_name} · {t.user_email}</span>
                          <div className="flex gap-1">
                            {t.status !== "resolved" && (
                              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleUpdateTicketStatus(t.id, "resolved")}>
                                Resolve
                              </Button>
                            )}
                            {t.status === "open" && (
                              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleUpdateTicketStatus(t.id, "in_progress")}>
                                In Progress
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No support tickets</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Card className="bg-card/50 border-border/50">
    <CardContent className="flex items-center gap-3 pt-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default StaffPortalPage;
