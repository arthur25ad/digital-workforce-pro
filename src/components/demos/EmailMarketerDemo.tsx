import { useState } from "react";
import { motion } from "framer-motion";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useAuth } from "@/hooks/useAuth";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, X, Calendar, BarChart3, PenLine, Eye, Send, Copy,
  MailOpen, Mail, Loader2, Sparkles, Plus, Trash2, Clock, Users, FileText,
} from "lucide-react";

const senderPlatforms = [
  { name: "Gmail", icon: MailOpen },
  { name: "Outlook", icon: MailOpen },
  { name: "Mailchimp", icon: Mail },
  { name: "SendGrid", icon: Send },
  { name: "SMTP", icon: Mail },
];

const campaignTypes = ["newsletter", "promotional", "welcome", "follow-up", "announcement"];

const EmailMarketerDemo = () => {
  const {
    brandProfile, campaigns, drafts, audienceLists, connections, activities, loading,
    updateBrandProfile, addCampaign, updateCampaignStatus,
    addDraft, updateDraftStatus, duplicateDraft, scheduleDraft, deleteDraft,
    addAudienceList, deleteAudienceList,
    connectSender, disconnectSender, isSenderConnected, getSenderConnection,
    logActivity,
  } = useEmailMarketingData();
  const { session } = useAuth();

  const [tab, setTab] = useState(0);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  // Foundation form
  const [foundationForm, setFoundationForm] = useState({
    business_overview: brandProfile?.business_overview || "",
    audience_description: brandProfile?.audience_description || "",
    brand_voice: brandProfile?.brand_voice || "",
    offer_summary: brandProfile?.offer_summary || "",
    campaign_goals: brandProfile?.campaign_goals || "",
    preferred_email_style: brandProfile?.preferred_email_style || "",
    frequency_preference: brandProfile?.frequency_preference || "",
    keywords: brandProfile?.keywords || "",
  });
  const [foundationDirty, setFoundationDirty] = useState(false);

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({ name: "", campaign_type: "newsletter", target_audience: "", objective: "" });
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  // Audience form
  const [audienceForm, setAudienceForm] = useState({ list_name: "", audience_type: "general", estimated_size: 0 });
  const [showAudienceForm, setShowAudienceForm] = useState(false);

  // Sync foundation form with loaded data
  const syncFoundation = () => {
    if (brandProfile && !foundationDirty) {
      setFoundationForm({
        business_overview: brandProfile.business_overview || "",
        audience_description: brandProfile.audience_description || "",
        brand_voice: brandProfile.brand_voice || "",
        offer_summary: brandProfile.offer_summary || "",
        campaign_goals: brandProfile.campaign_goals || "",
        preferred_email_style: brandProfile.preferred_email_style || "",
        frequency_preference: brandProfile.frequency_preference || "",
        keywords: brandProfile.keywords || "",
      });
    }
  };

  // biome-ignore: run sync once brandProfile loads
  useState(() => { syncFoundation(); });

  const tabs = ["Foundation", "Campaigns", "Drafts", "Calendar", "Senders", "Audiences", "Insights", "Activity"];

  const handleSaveFoundation = async () => {
    await updateBrandProfile(foundationForm);
    setFoundationDirty(false);
    toast({ title: "Email Foundation saved" });
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name.trim()) return;
    await addCampaign(campaignForm);
    setCampaignForm({ name: "", campaign_type: "newsletter", target_audience: "", objective: "" });
    setShowCampaignForm(false);
    toast({ title: "Campaign created" });
  };

  const handleGenerateDrafts = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email-draft", {
        body: { brandProfile, campaign, count: 3 },
      });
      if (error) throw error;
      const generated = data?.drafts || [];
      for (const d of generated) {
        await addDraft({
          campaign_id: campaignId,
          subject_line: d.subjectLine || "",
          preview_text: d.previewText || "",
          body_copy: d.bodyCopy || "",
          call_to_action: d.callToAction || "",
          email_type: d.emailType || "promotional",
        });
      }
      toast({ title: `${generated.length} email draft(s) generated` });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Try again", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleModal || !scheduleDate) return;
    await scheduleDraft(scheduleModal, new Date(scheduleDate).toISOString());
    setScheduleModal(null);
    setScheduleDate("");
    toast({ title: "Email scheduled" });
  };

  const handleCreateAudience = async () => {
    if (!audienceForm.list_name.trim()) return;
    await addAudienceList(audienceForm);
    setAudienceForm({ list_name: "", audience_type: "general", estimated_size: 0 });
    setShowAudienceForm(false);
    toast({ title: "Audience list created" });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;
  }

  const scheduledDrafts = drafts.filter((d) => d.status === "scheduled" && d.scheduled_date).sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime());

  return (
    <>
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {/* Foundation */}
      {tab === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Email Foundation</h3>
          <p className="text-sm text-muted-foreground">Help your AI understand your business before it writes campaigns.</p>
          {[
            { key: "business_overview", label: "Business Overview", placeholder: "What does your business do?" },
            { key: "audience_description", label: "Who You Serve", placeholder: "Your target audience" },
            { key: "brand_voice", label: "Brand Voice", placeholder: "Professional, friendly, bold..." },
            { key: "offer_summary", label: "Primary Offers", placeholder: "Your main products or services" },
            { key: "campaign_goals", label: "Marketing Goals", placeholder: "Drive sales, grow list, retain customers..." },
            { key: "preferred_email_style", label: "Preferred Email Style", placeholder: "Clean and scannable, rich and visual..." },
            { key: "frequency_preference", label: "Send Frequency", placeholder: "Weekly, bi-weekly, monthly..." },
            { key: "keywords", label: "Keywords / Themes", placeholder: "Keywords that define your brand" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input
                value={foundationForm[key as keyof typeof foundationForm]}
                onChange={(e) => { setFoundationForm({ ...foundationForm, [key]: e.target.value }); setFoundationDirty(true); }}
                placeholder={placeholder}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
              />
            </div>
          ))}
          <button onClick={handleSaveFoundation} className="btn-glow text-sm">
            {!foundationDirty ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Foundation"}
          </button>
        </motion.div>
      )}

      {/* Campaigns */}
      {tab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Your Campaigns</h3>
              <p className="text-sm text-muted-foreground">Plan campaigns, then generate email drafts.</p>
            </div>
            <button onClick={() => setShowCampaignForm(true)} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> New Campaign</button>
          </div>

          {showCampaignForm && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <input value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Campaign Name"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <select value={campaignForm.campaign_type} onChange={(e) => setCampaignForm({ ...campaignForm, campaign_type: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none">
                {campaignTypes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input value={campaignForm.target_audience} onChange={(e) => setCampaignForm({ ...campaignForm, target_audience: e.target.value })} placeholder="Target Audience"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <input value={campaignForm.objective} onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })} placeholder="Campaign Objective"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleCreateCampaign} className="btn-glow text-sm">Create Campaign</button>
                <button onClick={() => setShowCampaignForm(false)} className="btn-outline-glow text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.campaign_type}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    c.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                    c.status === "completed" ? "bg-primary/10 text-primary" :
                    "bg-secondary text-muted-foreground"
                  }`}>{c.status}</span>
                </div>
                {c.target_audience && <p className="text-xs text-muted-foreground mb-1">Audience: {c.target_audience}</p>}
                {c.objective && <p className="text-xs text-muted-foreground mb-3">Goal: {c.objective}</p>}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleGenerateDrafts(c.id)} disabled={generating}
                    className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate 3 Emails
                  </button>
                  {c.status === "draft" && (
                    <button onClick={() => updateCampaignStatus(c.id, "active")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20">
                      <Check size={12} /> Activate
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{drafts.filter((d) => d.campaign_id === c.id).length} draft(s)</p>
              </div>
            ))}
            {campaigns.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No campaigns yet. Create one to get started.</p>}
          </div>
        </motion.div>
      )}

      {/* Drafts */}
      {tab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Email Drafts</h3>
          <p className="text-sm text-muted-foreground">Review, approve, edit, or schedule your AI-generated emails.</p>
          <div className="space-y-4">
            {drafts.map((d) => (
              <div key={d.id} className={`rounded-xl border p-4 transition-all ${
                d.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
                d.status === "scheduled" ? "border-primary/30 bg-primary/5" :
                d.status === "sent" ? "border-muted bg-muted/5" :
                "border-border/50 bg-card"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{d.subject_line || "Untitled"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    d.status === "scheduled" ? "bg-primary/10 text-primary" :
                    d.status === "sent" ? "bg-muted text-muted-foreground" :
                    d.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-secondary text-muted-foreground"
                  }`}>{d.status}</span>
                </div>
                {d.preview_text && <p className="text-xs text-muted-foreground mb-1">Preview: {d.preview_text}</p>}
                <div className="rounded-lg bg-secondary/50 p-3 mb-3">
                  <p className="text-xs text-foreground whitespace-pre-line">{d.body_copy}</p>
                  {d.call_to_action && <p className="text-xs text-primary mt-2 font-medium">CTA: {d.call_to_action}</p>}
                </div>
                {d.scheduled_date && <p className="text-xs text-muted-foreground mb-2"><Clock size={10} className="inline mr-1" />Scheduled: {new Date(d.scheduled_date).toLocaleString()}</p>}
                <div className="flex flex-wrap gap-2">
                  {(d.status === "draft" || d.status === "pending") && (
                    <>
                      <button onClick={() => updateDraftStatus(d.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
                      <button onClick={() => { setScheduleModal(d.id); setScheduleDate(""); }} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Calendar size={12} /> Schedule</button>
                    </>
                  )}
                  {d.status === "approved" && (
                    <button onClick={() => updateDraftStatus(d.id, "sent")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Send size={12} /> Mark Sent</button>
                  )}
                  <button onClick={() => duplicateDraft(d.id)} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Copy size={12} /> Duplicate</button>
                  <button onClick={() => deleteDraft(d.id)} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            ))}
            {drafts.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No drafts yet. Generate emails from a campaign.</p>}
          </div>
        </motion.div>
      )}

      {/* Calendar */}
      {tab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Emails</h3>
          <p className="text-sm text-muted-foreground">See what's going out next.</p>
          {scheduledDrafts.length > 0 ? (
            <div className="space-y-3">
              {scheduledDrafts.map((d) => {
                const campaign = campaigns.find((c) => c.id === d.campaign_id);
                return (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.subject_line}</p>
                      {campaign && <p className="text-xs text-muted-foreground">{campaign.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary">{new Date(d.scheduled_date!).toLocaleDateString()}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">Scheduled</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No emails scheduled yet.</p>
          )}
        </motion.div>
      )}

      {/* Senders */}
      {tab === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Connect Your Email Sender</h3>
          <p className="text-sm text-muted-foreground">Connect the platforms where you send campaigns.</p>
          <div className="space-y-3">
            {senderPlatforms.map((p) => {
              const connected = isSenderConnected(p.name);
              const conn = getSenderConnection(p.name);
              return (
                <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><p.icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{connected ? <span className="text-emerald-400">Connected · {conn?.account_name}</span> : "Not connected"}</p>
                    </div>
                  </div>
                  {connected
                    ? <button onClick={() => disconnectSender(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                    : <button onClick={() => setConnectModal(p.name)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Audiences */}
      {tab === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Audience Lists</h3>
              <p className="text-sm text-muted-foreground">Organize your email recipients.</p>
            </div>
            <button onClick={() => setShowAudienceForm(true)} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> New List</button>
          </div>

          {showAudienceForm && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <input value={audienceForm.list_name} onChange={(e) => setAudienceForm({ ...audienceForm, list_name: e.target.value })} placeholder="List Name"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <select value={audienceForm.audience_type} onChange={(e) => setAudienceForm({ ...audienceForm, audience_type: e.target.value })}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none">
                <option value="general">General</option>
                <option value="subscribers">Subscribers</option>
                <option value="customers">Customers</option>
                <option value="leads">Leads</option>
                <option value="vip">VIP</option>
              </select>
              <input type="number" value={audienceForm.estimated_size} onChange={(e) => setAudienceForm({ ...audienceForm, estimated_size: parseInt(e.target.value) || 0 })} placeholder="Estimated Size"
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleCreateAudience} className="btn-glow text-sm">Create List</button>
                <button onClick={() => setShowAudienceForm(false)} className="btn-outline-glow text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {audienceLists.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.list_name}</p>
                    <p className="text-xs text-muted-foreground">{l.audience_type} · ~{l.estimated_size || 0} contacts</p>
                  </div>
                </div>
                <button onClick={() => deleteAudienceList(l.id)} className="text-xs text-muted-foreground hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
            {audienceLists.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No audience lists yet.</p>}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {tab === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Campaign Insights</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Campaigns", value: String(campaigns.length), icon: FileText, color: "text-primary" },
              { label: "Drafts", value: String(drafts.length), icon: PenLine, color: "text-primary" },
              { label: "Scheduled", value: String(drafts.filter((d) => d.status === "scheduled").length), icon: Calendar, color: "text-yellow-400" },
              { label: "Sent", value: String(drafts.filter((d) => d.status === "sent").length), icon: Send, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                <s.icon size={18} className={`${s.color} mb-2`} />
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          {campaigns.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Top Campaign Types</h4>
              <div className="space-y-2">
                {Object.entries(campaigns.reduce((acc, c) => { acc[c.campaign_type] = (acc[c.campaign_type] || 0) + 1; return acc; }, {} as Record<string, number>))
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-foreground capitalize">{type}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Activity */}
      {tab === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
          )}
        </motion.div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Schedule Email</h3>
            <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={handleSchedule} className="btn-glow text-sm">Schedule</button>
              <button onClick={() => setScheduleModal(null)} className="btn-outline-glow text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConnectPlatformModal
        open={!!connectModal}
        onClose={() => setConnectModal(null)}
        platformName={connectModal || ""}
        onConnect={(accountName) => {
          if (connectModal) connectSender(connectModal, accountName);
          setConnectModal(null);
        }}
      />
    </>
  );
};

export default EmailMarketerDemo;
