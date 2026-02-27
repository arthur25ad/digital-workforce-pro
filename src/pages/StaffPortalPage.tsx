import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, DollarSign, Tag, Megaphone, LifeBuoy, Users, TrendingUp, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const OWNER_EMAIL = "arthur25.ad@gmail.com";

interface DashboardData {
  revenue: {
    total: number;
    recent_charges: any[];
    active_subscriptions: number;
    total_customers: number;
    total_users: number;
    subscriptions: any[];
  };
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
  const [promoType, setPromoType] = useState("percentage");
  const [promoValue, setPromoValue] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoMaxUses, setPromoMaxUses] = useState("");
  const [creatingPromo, setCreatingPromo] = useState(false);

  const verifyAccess = useCallback(async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke("staff-portal", {
        body: null,
        headers: {},
      });
      // Use query param approach
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("No session");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-portal?action=verify`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Access denied");
      const json = await res.json();
      if (json.authorized) {
        setAuthorized(true);
      } else {
        throw new Error("Not authorized");
      }
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
    } catch (e) {
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.email !== OWNER_EMAIL) {
      navigate("/dashboard");
      return;
    }
    verifyAccess();
  }, [user, profile, authLoading, navigate, verifyAccess]);

  useEffect(() => {
    if (authorized) fetchData();
  }, [authorized, fetchData]);

  const callAction = async (action: string, body: any) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return null;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-portal?action=${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    return res.json();
  };

  const handleCreatePromo = async () => {
    if (!promoCode.trim() || !promoValue) return;
    setCreatingPromo(true);
    try {
      await callAction("create-promo", {
        code: promoCode.trim(),
        discount_type: promoType,
        discount_value: parseFloat(promoValue),
        description: promoDesc,
        max_uses: promoMaxUses ? parseInt(promoMaxUses) : null,
      });
      setPromoCode(""); setPromoValue(""); setPromoDesc(""); setPromoMaxUses("");
      toast({ title: "Promo code created" });
      fetchData();
    } catch { toast({ title: "Failed to create promo", variant: "destructive" }); }
    finally { setCreatingPromo(false); }
  };

  const handleTogglePromo = async (id: string, currentActive: boolean) => {
    await callAction("toggle-promo", { id, is_active: !currentActive });
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
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="CODE" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="font-mono" />
                  <Select value={promoType} onValueChange={setPromoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Value" type="number" value={promoValue} onChange={(e) => setPromoValue(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <Input placeholder="Description (optional)" value={promoDesc} onChange={(e) => setPromoDesc(e.target.value)} />
                  <Input placeholder="Max uses (optional)" type="number" value={promoMaxUses} onChange={(e) => setPromoMaxUses(e.target.value)} />
                </div>
                <Button onClick={handleCreatePromo} disabled={creatingPromo || !promoCode || !promoValue} className="mt-3" size="sm">
                  <Plus size={14} className="mr-1" /> Create
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-sm">Existing Promo Codes</CardTitle></CardHeader>
              <CardContent>
                {data?.promo_codes.length ? (
                  <div className="space-y-2">
                    {data.promo_codes.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30 text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant={p.is_active ? "default" : "secondary"} className="text-[10px] font-mono">{p.code}</Badge>
                          <span className="text-muted-foreground">
                            {p.discount_type === "percentage" ? `${p.discount_value}% off` : `$${p.discount_value} off`}
                          </span>
                          {p.description && <span className="text-xs text-muted-foreground hidden md:inline">— {p.description}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{p.usage_count} uses</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTogglePromo(p.id, p.is_active)}>
                            {p.is_active ? <ToggleRight size={16} className="text-primary" /> : <ToggleLeft size={16} />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeletePromo(p.id)}>
                            <Trash2 size={14} />
                          </Button>
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
                <p className="text-xs text-muted-foreground mt-3">More marketing analytics and campaign tracking will be available in future updates.</p>
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
                            <span className="font-medium text-sm">{t.subject || "No subject"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(t.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{t.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t.user_email || t.user_name || "Anonymous"}</span>
                          <div className="flex gap-1.5">
                            {t.status !== "open" && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "open")}>Open</Button>
                            )}
                            {t.status !== "in_progress" && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "in_progress")}>In Progress</Button>
                            )}
                            {t.status !== "resolved" && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateTicketStatus(t.id, "resolved")}>Resolve</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No support tickets yet</p>}
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
    <CardContent className="pt-5 pb-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default StaffPortalPage;
