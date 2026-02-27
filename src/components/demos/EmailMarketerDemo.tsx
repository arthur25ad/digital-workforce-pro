import { useState, useCallback } from "react";
import { useVantaBrainActions, useVantaBrainSuggestions } from "@/hooks/useVantaBrain";
import SmartSuggestions from "@/components/SmartSuggestions";
import { useEmailMarketingData } from "@/hooks/useEmailMarketingData";
import { useAuth } from "@/hooks/useAuth";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import WorkspaceSection from "@/components/workspace/WorkspaceSection";
import FormFieldGroup from "@/components/workspace/FormFieldGroup";
import StatCard from "@/components/workspace/StatCard";
import EmptyState from "@/components/workspace/EmptyState";
import ActivityFeed from "@/components/workspace/ActivityFeed";
import ConnectionCard from "@/components/workspace/ConnectionCard";
import {
  Check, ThumbsUp, X, Calendar, PenLine, Send, Copy,
  MailOpen, Mail, Loader2, Sparkles, Plus, Trash2, Clock, Users, FileText,
  TrendingUp, Zap, Target,
} from "lucide-react";

const senderPlatforms = [
  { name: "Gmail", icon: MailOpen }, { name: "Outlook", icon: MailOpen },
  { name: "Mailchimp", icon: Mail }, { name: "SendGrid", icon: Send }, { name: "SMTP", icon: Mail },
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
  const { getContext, recordInteraction } = useVantaBrainActions();
  const { suggestions: brainSuggestions, loading: suggestionsLoading, sendFeedback } = useVantaBrainSuggestions("email-marketer");

  const [activeTab, setActiveTab] = useState(0);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const [foundationForm, setFoundationForm] = useState({
    business_overview: brandProfile?.business_overview || "", audience_description: brandProfile?.audience_description || "",
    brand_voice: brandProfile?.brand_voice || "", offer_summary: brandProfile?.offer_summary || "",
    campaign_goals: brandProfile?.campaign_goals || "", preferred_email_style: brandProfile?.preferred_email_style || "",
    frequency_preference: brandProfile?.frequency_preference || "", keywords: brandProfile?.keywords || "",
  });
  const [foundationDirty, setFoundationDirty] = useState(false);
  const [campaignForm, setCampaignForm] = useState({ name: "", campaign_type: "newsletter", target_audience: "", objective: "" });
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [audienceForm, setAudienceForm] = useState({ list_name: "", audience_type: "general", estimated_size: 0 });
  const [showAudienceForm, setShowAudienceForm] = useState(false);

  useState(() => {
    if (brandProfile && !foundationDirty) {
      setFoundationForm({
        business_overview: brandProfile.business_overview || "", audience_description: brandProfile.audience_description || "",
        brand_voice: brandProfile.brand_voice || "", offer_summary: brandProfile.offer_summary || "",
        campaign_goals: brandProfile.campaign_goals || "", preferred_email_style: brandProfile.preferred_email_style || "",
        frequency_preference: brandProfile.frequency_preference || "", keywords: brandProfile.keywords || "",
      });
    }
  });

  const tabs = [
    { label: "Foundation", icon: <Zap size={14} /> },
    { label: "Campaigns", icon: <Target size={14} /> },
    { label: "Drafts", icon: <FileText size={14} /> },
    { label: "Calendar", icon: <Calendar size={14} /> },
    { label: "Senders", icon: <Mail size={14} /> },
    { label: "Audiences", icon: <Users size={14} /> },
    { label: "Insights", icon: <TrendingUp size={14} /> },
    { label: "Activity", icon: <Clock size={14} /> },
  ];

  const handleSaveFoundation = async () => { await updateBrandProfile(foundationForm); setFoundationDirty(false); toast({ title: "Email Foundation saved" }); };
  const handleCreateCampaign = async () => { if (!campaignForm.name.trim()) return; await addCampaign(campaignForm); setCampaignForm({ name: "", campaign_type: "newsletter", target_audience: "", objective: "" }); setShowCampaignForm(false); toast({ title: "Campaign created" }); };
  const handleGenerateDrafts = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId); if (!campaign) return;
    setGenerating(true);
    try {
      const brainContext = await getContext("email-marketer");
      const { data, error } = await supabase.functions.invoke("generate-email-draft", { body: { brandProfile, campaign, count: 3, brainContext } });
      if (error) throw error;
      for (const d of (data?.drafts || [])) { await addDraft({ campaign_id: campaignId, subject_line: d.subjectLine || "", preview_text: d.previewText || "", body_copy: d.bodyCopy || "", call_to_action: d.callToAction || "", email_type: d.emailType || "promotional" }); }
      toast({ title: `${(data?.drafts || []).length} email draft(s) generated` });
    } catch (e: any) { toast({ title: "Generation failed", description: e.message, variant: "destructive" }); }
    finally { setGenerating(false); }
  };
  const handleSchedule = async () => { if (!scheduleModal || !scheduleDate) return; await scheduleDraft(scheduleModal, new Date(scheduleDate).toISOString()); setScheduleModal(null); setScheduleDate(""); toast({ title: "Email scheduled" }); };
  const handleCreateAudience = async () => { if (!audienceForm.list_name.trim()) return; await addAudienceList(audienceForm); setAudienceForm({ list_name: "", audience_type: "general", estimated_size: 0 }); setShowAudienceForm(false); toast({ title: "Audience list created" }); };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  const scheduledDrafts = drafts.filter(d => d.status === "scheduled" && d.scheduled_date).sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime());
  const statusStyle: Record<string, string> = { draft: "bg-secondary text-muted-foreground", pending: "bg-yellow-500/10 text-yellow-400", approved: "bg-emerald-500/10 text-emerald-400", scheduled: "bg-primary/10 text-primary", sent: "bg-muted text-muted-foreground" };

  return (
    <>
      <WorkspaceShell tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <SmartSuggestions suggestions={brainSuggestions} loading={suggestionsLoading} onFeedback={sendFeedback} />
        {/* Foundation */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <FormFieldGroup title="Business & Audience" description="Core context for your email campaigns" icon={<Zap size={16} />}
              fields={[
                { key: "business_overview", label: "Business Overview", placeholder: "What does your business do?" },
                { key: "audience_description", label: "Who You Serve", placeholder: "Your target audience" },
                { key: "brand_voice", label: "Brand Voice", placeholder: "Professional, friendly, bold..." },
                { key: "offer_summary", label: "Primary Offers", placeholder: "Your main products or services" },
              ]}
              values={foundationForm} onChange={(k, v) => { setFoundationForm({...foundationForm, [k]: v}); setFoundationDirty(true); }} />
            <FormFieldGroup title="Campaign Strategy" description="Guide AI email creation" icon={<Target size={16} />}
              fields={[
                { key: "campaign_goals", label: "Marketing Goals", placeholder: "Drive sales, grow list..." },
                { key: "preferred_email_style", label: "Email Style", placeholder: "Clean and scannable..." },
                { key: "frequency_preference", label: "Send Frequency", placeholder: "Weekly, monthly..." },
                { key: "keywords", label: "Keywords / Themes", placeholder: "Keywords that define your brand" },
              ]}
              values={foundationForm} onChange={(k, v) => { setFoundationForm({...foundationForm, [k]: v}); setFoundationDirty(true); }} />
            <button onClick={handleSaveFoundation} className="btn-glow text-sm">
              {!foundationDirty ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Foundation"}
            </button>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === 1 && (
          <WorkspaceSection title="Your Campaigns" description="Plan campaigns, then generate email drafts."
            action={<button onClick={() => setShowCampaignForm(true)} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> New Campaign</button>}>
            {showCampaignForm && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Campaign Name</label><input value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} placeholder="Spring Sale" className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label><select value={campaignForm.campaign_type} onChange={e => setCampaignForm({...campaignForm, campaign_type: e.target.value})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none">{campaignTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Target Audience</label><input value={campaignForm.target_audience} onChange={e => setCampaignForm({...campaignForm, target_audience: e.target.value})} placeholder="All subscribers" className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Objective</label><input value={campaignForm.objective} onChange={e => setCampaignForm({...campaignForm, objective: e.target.value})} placeholder="Drive product awareness" className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" /></div>
                </div>
                <div className="flex gap-2"><button onClick={handleCreateCampaign} className="btn-glow text-sm">Create</button><button onClick={() => setShowCampaignForm(false)} className="btn-outline-glow text-sm">Cancel</button></div>
              </div>
            )}
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="rounded-xl border border-border/50 bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div><span className="text-sm font-medium text-foreground">{c.name}</span><span className="ml-2 text-xs text-muted-foreground capitalize">{c.campaign_type}</span></div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{c.status}</span>
                  </div>
                  {c.objective && <p className="text-xs text-muted-foreground mb-3">Goal: {c.objective}</p>}
                  <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={() => handleGenerateDrafts(c.id)} disabled={generating} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">{generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate 3 Emails</button>
                    {c.status === "draft" && <button onClick={() => updateCampaignStatus(c.id, "active")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Activate</button>}
                    <span className="text-xs text-muted-foreground ml-auto">{drafts.filter(d => d.campaign_id === c.id).length} draft(s)</span>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && <EmptyState icon={<Target size={20} />} message="No campaigns yet. Create one to get started." />}
            </div>
          </WorkspaceSection>
        )}

        {/* Drafts */}
        {activeTab === 2 && (
          <WorkspaceSection title="Email Drafts" description="Review, approve, edit, or schedule your AI-generated emails.">
            {drafts.length === 0 ? <EmptyState icon={<FileText size={20} />} message="No drafts yet. Generate emails from a campaign." /> : (
              <div className="space-y-4">
                {drafts.map(d => (
                  <div key={d.id} className={`rounded-xl border p-4 transition-all ${d.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : d.status === "scheduled" ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{d.subject_line || "Untitled"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[d.status] || "bg-secondary text-muted-foreground"}`}>{d.status}</span>
                    </div>
                    {d.preview_text && <p className="text-xs text-muted-foreground mb-2">Preview: {d.preview_text}</p>}
                    <div className="rounded-lg bg-secondary/30 p-3 mb-3"><p className="text-xs text-foreground whitespace-pre-line line-clamp-4">{d.body_copy}</p>{d.call_to_action && <p className="text-xs text-primary mt-2 font-medium">CTA: {d.call_to_action}</p>}</div>
                    {d.scheduled_date && <p className="text-xs text-muted-foreground mb-2"><Clock size={10} className="inline mr-1" />Scheduled: {new Date(d.scheduled_date).toLocaleString()}</p>}
                    <div className="flex flex-wrap gap-2">
                      {(d.status === "draft" || d.status === "pending") && (<><button onClick={() => updateDraftStatus(d.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button><button onClick={() => { setScheduleModal(d.id); setScheduleDate(""); }} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Calendar size={12} /> Schedule</button></>)}
                      {d.status === "approved" && <button onClick={() => updateDraftStatus(d.id, "sent")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Send size={12} /> Mark Sent</button>}
                      <button onClick={() => duplicateDraft(d.id)} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Copy size={12} /> Duplicate</button>
                      <button onClick={() => deleteDraft(d.id)} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Calendar */}
        {activeTab === 3 && (
          <WorkspaceSection title="Upcoming Emails" description="See what's going out next.">
            {scheduledDrafts.length > 0 ? (
              <div className="space-y-3">{scheduledDrafts.map(d => {
                const campaign = campaigns.find(c => c.id === d.campaign_id);
                return (<div key={d.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4"><div><p className="text-sm font-medium text-foreground">{d.subject_line}</p>{campaign && <p className="text-xs text-muted-foreground">{campaign.name}</p>}</div><p className="text-sm text-primary">{new Date(d.scheduled_date!).toLocaleDateString()}</p></div>);
              })}</div>
            ) : <EmptyState icon={<Calendar size={20} />} message="No emails scheduled yet." />}
          </WorkspaceSection>
        )}

        {/* Senders */}
        {activeTab === 4 && (
          <WorkspaceSection title="Email Senders" description="Connect the platforms where you send campaigns.">
            <div className="space-y-3">{senderPlatforms.map(p => { const conn = getSenderConnection(p.name); return <ConnectionCard key={p.name} name={p.name} icon={<p.icon size={20} />} connected={isSenderConnected(p.name)} accountName={conn?.account_name} connectedAt={conn?.connected_at} onConnect={() => setConnectModal(p.name)} onDisconnect={() => disconnectSender(p.name)} />; })}</div>
          </WorkspaceSection>
        )}

        {/* Audiences */}
        {activeTab === 5 && (
          <WorkspaceSection title="Audience Lists" description="Organize your email recipients."
            action={<button onClick={() => setShowAudienceForm(true)} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> New List</button>}>
            {showAudienceForm && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">List Name</label><input value={audienceForm.list_name} onChange={e => setAudienceForm({...audienceForm, list_name: e.target.value})} placeholder="VIP Customers" className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label><select value={audienceForm.audience_type} onChange={e => setAudienceForm({...audienceForm, audience_type: e.target.value})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none"><option value="general">General</option><option value="subscribers">Subscribers</option><option value="customers">Customers</option><option value="leads">Leads</option><option value="vip">VIP</option></select></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Est. Size</label><input type="number" value={audienceForm.estimated_size} onChange={e => setAudienceForm({...audienceForm, estimated_size: parseInt(e.target.value) || 0})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" /></div>
                </div>
                <div className="flex gap-2"><button onClick={handleCreateAudience} className="btn-glow text-sm">Create</button><button onClick={() => setShowAudienceForm(false)} className="btn-outline-glow text-sm">Cancel</button></div>
              </div>
            )}
            <div className="space-y-3">
              {audienceLists.map(l => (
                <div key={l.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-3"><Users size={18} className="text-primary" /><div><p className="text-sm font-medium text-foreground">{l.list_name}</p><p className="text-xs text-muted-foreground">{l.audience_type} · ~{l.estimated_size || 0} contacts</p></div></div>
                  <button onClick={() => deleteAudienceList(l.id)} className="text-xs text-muted-foreground hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
              {audienceLists.length === 0 && <EmptyState icon={<Users size={20} />} message="No audience lists yet." />}
            </div>
          </WorkspaceSection>
        )}

        {/* Insights */}
        {activeTab === 6 && (
          <WorkspaceSection title="Campaign Insights" description="Track your email marketing progress.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Campaigns" value={campaigns.length} icon={<Target size={18} />} />
              <StatCard label="Drafts" value={drafts.length} icon={<PenLine size={18} />} />
              <StatCard label="Scheduled" value={drafts.filter(d => d.status === "scheduled").length} icon={<Calendar size={18} />} accent="text-yellow-400" />
              <StatCard label="Sent" value={drafts.filter(d => d.status === "sent").length} icon={<Send size={18} />} accent="text-emerald-400" />
            </div>
          </WorkspaceSection>
        )}

        {/* Activity */}
        {activeTab === 7 && (
          <WorkspaceSection title="Recent Activity" description="Your email marketing history.">
            <ActivityFeed activities={activities} emptyMessage="No activity yet." />
          </WorkspaceSection>
        )}
      </WorkspaceShell>

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
            <h3 className="font-display text-lg font-semibold text-foreground">Schedule Email</h3>
            <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            <div className="flex gap-2"><button onClick={handleSchedule} className="btn-glow text-sm">Schedule</button><button onClick={() => setScheduleModal(null)} className="btn-outline-glow text-sm">Cancel</button></div>
          </div>
        </div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) connectSender(connectModal, accountName); setConnectModal(null); }} />
    </>
  );
};

export default EmailMarketerDemo;
