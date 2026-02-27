import { useState, useCallback } from "react";
import { useVantaBrainActions, useVantaBrainSuggestions } from "@/hooks/useVantaBrain";
import SmartSuggestions from "@/components/SmartSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData, SocialDraft } from "@/hooks/useWorkspaceData";
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
  Check, ThumbsUp, X, PenLine, Calendar, Eye,
  Instagram, Facebook, Linkedin, Twitter, Music2, Loader2, Sparkles, Plus, Clock,
  BarChart3, Zap, FileText, TrendingUp,
} from "lucide-react";

const platformIcon: Record<string, any> = { Instagram, Facebook, LinkedIn: Linkedin, "X / Twitter": Twitter, TikTok: Music2 };
const socialPlatforms = ["Instagram", "Facebook", "LinkedIn", "TikTok", "X / Twitter"];

interface GeneratedIdea {
  ideaTitle: string; platform: string; contentAngle: string; hook: string; caption: string; cta: string; format: string; drafted?: boolean;
}

const SocialMediaDemo = () => {
  const { workspace, brandProfile, updateBrandProfile, updateWorkspace } = useAuth();
  const { drafts, isConnected, getConnection, connectPlatform, disconnectPlatform, addDraft, updateDraftStatus, updateDraftSchedule, logActivity, activities } = useWorkspaceData();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const { getContext, recordInteraction } = useVantaBrainActions();
  const { suggestions: brainSuggestions, loading: suggestionsLoading, sendFeedback } = useVantaBrainSuggestions("social-media-manager");
  const [activeTab, setActiveTab] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [brandSaved, setBrandSaved] = useState(false);

  const [brain, setBrain] = useState({
    businessName: workspace?.business_name || "",
    offerType: brandProfile?.offer_type || "",
    targetAudience: brandProfile?.target_audience || "",
    brandVoice: brandProfile?.brand_voice || "",
    contentGoals: brandProfile?.content_goals || "",
    contentThemes: (brandProfile?.content_themes || []).join(", "),
    preferredPlatforms: brandProfile?.preferred_platforms || [] as string[],
    postingFrequency: brandProfile?.posting_frequency || "",
    hashtags: (brandProfile?.hashtags || []).join(", "),
  });

  const tabs = [
    { label: "Business Brain", icon: <Zap size={14} /> },
    { label: "Platforms", icon: <Instagram size={14} /> },
    { label: "Generate", icon: <Sparkles size={14} /> },
    { label: "Drafts", icon: <FileText size={14} /> },
    { label: "Calendar", icon: <Calendar size={14} /> },
    { label: "Insights", icon: <TrendingUp size={14} /> },
    { label: "Activity", icon: <Clock size={14} /> },
  ];

  const handleSaveBrain = async () => {
    await updateWorkspace({ business_name: brain.businessName });
    await updateBrandProfile({
      offer_type: brain.offerType, target_audience: brain.targetAudience, brand_voice: brain.brandVoice,
      content_goals: brain.contentGoals, content_themes: brain.contentThemes.split(",").map(s => s.trim()).filter(Boolean),
      preferred_platforms: brain.preferredPlatforms, posting_frequency: brain.postingFrequency,
      hashtags: brain.hashtags.split(",").map(s => s.trim()).filter(Boolean),
    });
    setBrandSaved(true);
    toast({ title: "Business Brain saved" });
    await logActivity("brain_updated", "Updated Business Brain");
  };

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      const brainContext = await getContext("social-media-manager");
      const { data, error } = await supabase.functions.invoke("generate-social-ideas", {
        body: { brainContext, brandProfile: { businessName: brain.businessName || workspace?.business_name, offerType: brain.offerType || brandProfile?.offer_type, targetAudience: brain.targetAudience || brandProfile?.target_audience, brandVoice: brain.brandVoice || brandProfile?.brand_voice, contentGoals: brain.contentGoals || brandProfile?.content_goals, contentThemes: brain.contentThemes.split(",").map(s => s.trim()).filter(Boolean), preferredPlatforms: brain.preferredPlatforms } },
      });
      if (error) throw error;
      if (data?.error) { toast({ title: "AI Error", description: data.error, variant: "destructive" }); }
      else {
        setIdeas(data.ideas || []);
        toast({ title: "Ideas generated", description: "3 new post ideas ready to review." });
        await logActivity("ideas_generated", "Generated 3 post ideas");
        await recordInteraction({ roleScope: "social-media-manager", interactionType: "generation", actionTaken: "Generated 3 social post ideas" });
      }
    } catch (err: any) { toast({ title: "Generation failed", description: err.message || "Please try again.", variant: "destructive" }); }
    finally { setGenerating(false); }
  };

  const handleDraftFromIdea = async (idea: GeneratedIdea, index: number) => {
    if (!workspace) return;
    const draft = await addDraft({ workspace_id: workspace.id, platform: idea.platform, idea_title: idea.ideaTitle, hook: idea.hook, caption: idea.caption, cta: idea.cta, format: idea.format, status: "draft", scheduled_date: null });
    if (draft) { setIdeas(prev => prev.map((p, i) => (i === index ? { ...p, drafted: true } : p))); toast({ title: "Draft created" }); }
  };

  const scheduledDrafts = drafts.filter(d => d.status === "scheduled" && d.scheduled_date);
  const pendingDrafts = drafts.filter(d => d.status === "draft" || d.status === "pending");
  const approvedDrafts = drafts.filter(d => d.status === "approved");

  return (
    <>
      <WorkspaceShell tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* VANTABRAIN Suggestions */}
        <SmartSuggestions suggestions={brainSuggestions} loading={suggestionsLoading} onFeedback={sendFeedback} />
        {/* Business Brain */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <FormFieldGroup
              title="Brand Identity"
              description="Core info about your business"
              icon={<Zap size={16} />}
              fields={[
                { key: "businessName", label: "Business Name", placeholder: "Your business name" },
                { key: "offerType", label: "What You Sell", placeholder: "Products or services" },
                { key: "targetAudience", label: "Who You Serve", placeholder: "Your ideal customer" },
                { key: "brandVoice", label: "Brand Voice", placeholder: "Professional, friendly, bold..." },
              ]}
              values={brain as any}
              onChange={(k, v) => { setBrain({ ...brain, [k]: v }); setBrandSaved(false); }}
            />
            <FormFieldGroup
              title="Content Strategy"
              description="Guide AI-generated content"
              icon={<TrendingUp size={16} />}
              fields={[
                { key: "contentGoals", label: "Main Goals", placeholder: "Grow followers, drive sales..." },
                { key: "contentThemes", label: "Content Themes", placeholder: "Comma-separated topics" },
                { key: "postingFrequency", label: "Posting Frequency", placeholder: "Daily, 3x/week..." },
                { key: "hashtags", label: "Hashtags / Keywords", placeholder: "Comma-separated hashtags" },
              ]}
              values={brain as any}
              onChange={(k, v) => { setBrain({ ...brain, [k]: v }); setBrandSaved(false); }}
            />
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Preferred Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {socialPlatforms.map(p => (
                  <button key={p} onClick={() => setBrain({ ...brain, preferredPlatforms: brain.preferredPlatforms.includes(p) ? brain.preferredPlatforms.filter(x => x !== p) : [...brain.preferredPlatforms, p] })}
                    className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${brain.preferredPlatforms.includes(p) ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border/50 hover:border-primary/20"}`}>{p}</button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveBrain} className="btn-glow text-sm">
              {brandSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Business Brain"}
            </button>
          </div>
        )}

        {/* Platforms */}
        {activeTab === 1 && (
          <WorkspaceSection title="Connected Platforms" description="Link the accounts where you want content managed.">
            <div className="space-y-3">
              {socialPlatforms.map(p => {
                const Icon = platformIcon[p] || Instagram;
                const conn = getConnection(p);
                return (
                  <ConnectionCard key={p} name={p} icon={<Icon size={20} />} connected={isConnected(p)}
                    accountName={conn?.account_name} connectedAt={conn?.connected_at}
                    onConnect={() => setConnectModal(p)} onDisconnect={() => disconnectPlatform(p)} />
                );
              })}
            </div>
          </WorkspaceSection>
        )}

        {/* Generate */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <WorkspaceSection title="AI Content Ideas" description="Generate structured post ideas based on your Business Brain."
              action={
                <button onClick={handleGenerateIdeas} disabled={generating} className="btn-glow text-sm flex items-center gap-2">
                  {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate 3 Ideas</>}
                </button>
              }
            >
              {ideas.length === 0 ? (
                <EmptyState icon={<Sparkles size={20} />} message="Click 'Generate 3 Ideas' to create AI-powered post concepts." />
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {ideas.map((idea, i) => (
                    <div key={i} className={`rounded-xl border p-5 space-y-3 transition-all ${idea.drafted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card hover:border-primary/20"}`}>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">{idea.platform}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${idea.drafted ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                          {idea.drafted ? "Drafted ✓" : idea.format}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">{idea.ideaTitle}</h4>
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground"><span className="text-foreground/60 font-medium">Hook:</span> {idea.hook}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2"><span className="text-foreground/60 font-medium">Caption:</span> {idea.caption}</p>
                      </div>
                      {!idea.drafted && (
                        <button onClick={() => handleDraftFromIdea(idea, i)} className="w-full flex items-center justify-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                          <Plus size={12} /> Create Draft
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </WorkspaceSection>
          </div>
        )}

        {/* Drafts */}
        {activeTab === 3 && (
          <WorkspaceSection title="Your Drafts" description="Review, approve, or schedule your content.">
            {drafts.length === 0 ? (
              <EmptyState icon={<FileText size={20} />} message="No drafts yet. Generate ideas first!"
                action={<button onClick={() => setActiveTab(2)} className="text-xs text-primary hover:underline">Go to Generate Ideas</button>} />
            ) : (
              <div className="space-y-3">
                {drafts.map(draft => <DraftCard key={draft.id} draft={draft} onStatusChange={updateDraftStatus} onSchedule={updateDraftSchedule} />)}
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Calendar */}
        {activeTab === 4 && (
          <WorkspaceSection title="Upcoming Posts" description="See what's going out next.">
            {scheduledDrafts.length === 0 ? (
              <EmptyState icon={<Calendar size={20} />} message="No scheduled posts yet. Approve and schedule drafts first." />
            ) : (
              <div className="space-y-3">
                {scheduledDrafts.sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime()).map(d => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Calendar size={18} /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.idea_title}</p>
                        <p className="text-xs text-muted-foreground">{d.platform} · {new Date(d.scheduled_date!).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">Scheduled</span>
                  </div>
                ))}
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Insights */}
        {activeTab === 5 && (
          <WorkspaceSection title="Content Insights" description="Track your content creation progress.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Drafts" value={drafts.length} icon={<FileText size={18} />} />
              <StatCard label="Pending Review" value={pendingDrafts.length} icon={<PenLine size={18} />} />
              <StatCard label="Approved" value={approvedDrafts.length} icon={<ThumbsUp size={18} />} />
              <StatCard label="Scheduled" value={scheduledDrafts.length} icon={<Calendar size={18} />} />
            </div>
            {drafts.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-5 mt-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Content by Platform</h4>
                <div className="space-y-2">
                  {Object.entries(drafts.reduce((acc, d) => { acc[d.platform] = (acc[d.platform] || 0) + 1; return acc; }, {} as Record<string, number>)).sort(([,a],[,b]) => b - a).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                      <span className="text-sm text-foreground">{platform}</span>
                      <span className="text-xs font-medium text-primary">{count} drafts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Activity */}
        {activeTab === 6 && (
          <WorkspaceSection title="Recent Activity" description="Your content creation history.">
            <ActivityFeed activities={activities} emptyMessage="No activity yet. Start using your AI Social Manager!" />
          </WorkspaceSection>
        )}
      </WorkspaceShell>

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { connectPlatform(connectModal, accountName); toast({ title: "Connected", description: `${connectModal} linked successfully.` }); } setConnectModal(null); }} />
    </>
  );
};

const DraftCard = ({ draft, onStatusChange, onSchedule }: { draft: SocialDraft; onStatusChange: (id: string, status: string) => void; onSchedule: (id: string, date: string) => void }) => {
  const [scheduling, setScheduling] = useState(false);
  const [schedDate, setSchedDate] = useState("");

  const statusStyle: Record<string, string> = {
    draft: "bg-secondary text-muted-foreground", pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-emerald-500/10 text-emerald-400", rejected: "bg-red-500/10 text-red-400",
    scheduled: "bg-primary/10 text-primary", published: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      draft.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
      draft.status === "rejected" ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-card"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{draft.platform}</span>
          <span className="text-sm font-medium text-foreground">{draft.idea_title}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[draft.status] || ""}`}>{draft.status}</span>
      </div>
      {draft.hook && <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{draft.hook}</p>}
      {draft.caption && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{draft.caption}</p>}
      <div className="flex flex-wrap gap-2">
        {(draft.status === "draft" || draft.status === "pending") && (
          <>
            <button onClick={() => { onStatusChange(draft.id, "approved"); toast({ title: "Draft approved" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
            <button onClick={() => onStatusChange(draft.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><X size={12} /> Reject</button>
          </>
        )}
        {draft.status === "approved" && !scheduling && (
          <button onClick={() => setScheduling(true)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Clock size={12} /> Schedule</button>
        )}
        {scheduling && (
          <div className="flex items-center gap-2">
            <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none" />
            <button onClick={() => { if (schedDate) { onSchedule(draft.id, new Date(schedDate).toISOString()); toast({ title: "Scheduled" }); setScheduling(false); } }}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">Confirm</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaDemo;
