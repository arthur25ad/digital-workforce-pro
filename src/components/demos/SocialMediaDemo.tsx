import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceData, SocialDraft } from "@/hooks/useWorkspaceData";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, X, PenLine, BarChart3, Calendar, Eye,
  Instagram, Facebook, Linkedin, Twitter, Music2, Loader2, Sparkles, Plus, Clock,
} from "lucide-react";

const platformIcon: Record<string, any> = { Instagram, Facebook, LinkedIn: Linkedin, "X / Twitter": Twitter, TikTok: Music2 };
const socialPlatforms = ["Instagram", "Facebook", "LinkedIn", "TikTok", "X / Twitter"];

interface GeneratedIdea {
  ideaTitle: string;
  platform: string;
  contentAngle: string;
  hook: string;
  caption: string;
  cta: string;
  format: string;
  drafted?: boolean;
}

const SocialMediaDemo = () => {
  const { workspace, brandProfile, updateBrandProfile, updateWorkspace } = useAuth();
  const { drafts, isConnected, getConnection, connectPlatform, disconnectPlatform, addDraft, updateDraftStatus, updateDraftSchedule, logActivity } = useWorkspaceData();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [brandSaved, setBrandSaved] = useState(false);

  // Brand Brain local state
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

  const tabs = ["Business Brain", "Platforms", "Generate Ideas", "Drafts", "Calendar", "Activity"];

  const handleSaveBrain = async () => {
    await updateWorkspace({ business_name: brain.businessName });
    await updateBrandProfile({
      offer_type: brain.offerType,
      target_audience: brain.targetAudience,
      brand_voice: brain.brandVoice,
      content_goals: brain.contentGoals,
      content_themes: brain.contentThemes.split(",").map((s) => s.trim()).filter(Boolean),
      preferred_platforms: brain.preferredPlatforms,
      posting_frequency: brain.postingFrequency,
      hashtags: brain.hashtags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setBrandSaved(true);
    toast({ title: "Business Brain saved" });
    await logActivity("brain_updated", "Updated Business Brain");
    setTimeout(() => setDemoStep(1), 600);
  };

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-ideas", {
        body: {
          brandProfile: {
            businessName: brain.businessName || workspace?.business_name,
            offerType: brain.offerType || brandProfile?.offer_type,
            targetAudience: brain.targetAudience || brandProfile?.target_audience,
            brandVoice: brain.brandVoice || brandProfile?.brand_voice,
            contentGoals: brain.contentGoals || brandProfile?.content_goals,
            contentThemes: brain.contentThemes.split(",").map((s) => s.trim()).filter(Boolean),
            preferredPlatforms: brain.preferredPlatforms,
          },
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
      } else {
        setIdeas(data.ideas || []);
        toast({ title: "Ideas generated", description: "3 new post ideas ready to review." });
        await logActivity("ideas_generated", "Generated 3 post ideas");
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDraftFromIdea = async (idea: GeneratedIdea, index: number) => {
    if (!workspace) return;
    const draft = await addDraft({
      workspace_id: workspace.id,
      platform: idea.platform,
      idea_title: idea.ideaTitle,
      hook: idea.hook,
      caption: idea.caption,
      cta: idea.cta,
      format: idea.format,
      status: "draft",
      scheduled_date: null,
    });
    if (draft) {
      setIdeas((prev) => prev.map((p, i) => (i === index ? { ...p, drafted: true } : p)));
      toast({ title: "Draft created", description: `New ${idea.platform} draft added.` });
    }
  };

  const scheduledDrafts = drafts.filter((d) => d.status === "scheduled" && d.scheduled_date);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setDemoStep(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${demoStep === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>

      {/* Business Brain */}
      {demoStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Business Brain</h3>
          <p className="text-sm text-muted-foreground">Teach your AI about your business so it creates relevant content.</p>
          {[
            { key: "businessName", label: "Business Name" },
            { key: "offerType", label: "What You Sell" },
            { key: "targetAudience", label: "Who You Serve" },
            { key: "brandVoice", label: "Brand Voice" },
            { key: "contentGoals", label: "Main Goals" },
            { key: "contentThemes", label: "Content Themes (comma separated)" },
            { key: "postingFrequency", label: "Posting Frequency" },
            { key: "hashtags", label: "Hashtags / Keywords (comma separated)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={brain[key as keyof typeof brain] as string} onChange={(e) => { setBrain({ ...brain, [key]: e.target.value }); setBrandSaved(false); }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Preferred Platforms</label>
            <div className="flex flex-wrap gap-2">
              {socialPlatforms.map((p) => (
                <button key={p} onClick={() => setBrain({ ...brain, preferredPlatforms: brain.preferredPlatforms.includes(p) ? brain.preferredPlatforms.filter((x) => x !== p) : [...brain.preferredPlatforms, p] })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${brain.preferredPlatforms.includes(p) ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border/50"}`}>{p}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveBrain} className="btn-glow text-sm">
            {brandSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Business Brain"}
          </button>
        </motion.div>
      )}

      {/* Platforms */}
      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Connected Platforms</h3>
          <p className="text-sm text-muted-foreground">Link the accounts where you want content managed.</p>
          <div className="space-y-3">
            {socialPlatforms.map((p) => {
              const connected = isConnected(p);
              const conn = getConnection(p);
              const Icon = platformIcon[p] || Instagram;
              return (
                <div key={p} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><Icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p}</p>
                      <p className="text-xs text-muted-foreground">
                        {connected ? (
                          <span className="text-emerald-400">Connected · {conn?.account_name}
                            {conn?.connected_at && <span className="text-muted-foreground ml-1">· {new Date(conn.connected_at).toLocaleDateString()}</span>}
                          </span>
                        ) : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {connected ? (
                    <button onClick={() => disconnectPlatform(p)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                  ) : (
                    <button onClick={() => setConnectModal(p)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Generate Ideas */}
      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">AI Content Ideas</h3>
          <p className="text-sm text-muted-foreground">Generate structured post ideas based on your Business Brain.</p>

          <button onClick={handleGenerateIdeas} disabled={generating} className="btn-glow text-sm flex items-center gap-2">
            {generating ? <><Loader2 size={14} className="animate-spin" /> Generating with AI...</> : <><Sparkles size={14} /> Generate 3 Post Ideas</>}
          </button>

          {ideas.length > 0 && (
            <div className="space-y-4">
              {ideas.map((idea, i) => (
                <div key={i} className={`rounded-xl border p-5 ${idea.drafted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary">{idea.platform}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${idea.drafted ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                      {idea.drafted ? "Drafted" : idea.format}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{idea.ideaTitle}</h4>
                  <p className="text-xs text-muted-foreground mb-1"><span className="text-foreground/70">Angle:</span> {idea.contentAngle}</p>
                  <p className="text-xs text-muted-foreground mb-1"><span className="text-foreground/70">Hook:</span> {idea.hook}</p>
                  <p className="text-xs text-muted-foreground mb-1"><span className="text-foreground/70">Caption:</span> {idea.caption}</p>
                  <p className="text-xs text-muted-foreground mb-3"><span className="text-foreground/70">CTA:</span> {idea.cta}</p>
                  {!idea.drafted && (
                    <button onClick={() => handleDraftFromIdea(idea, i)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                      <Plus size={12} /> Create Draft
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Drafts */}
      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Your Drafts</h3>
          <p className="text-sm text-muted-foreground">Review, approve, or schedule your content.</p>
          {drafts.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No drafts yet. Generate ideas first!</p>
              <button onClick={() => setDemoStep(2)} className="mt-3 text-xs text-primary hover:underline">Go to Generate Ideas</button>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <DraftCard key={draft.id} draft={draft} onStatusChange={updateDraftStatus} onSchedule={updateDraftSchedule} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Calendar */}
      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Posts</h3>
          <p className="text-sm text-muted-foreground">See what's going out next.</p>
          {scheduledDrafts.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No scheduled posts yet. Approve and schedule drafts first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledDrafts.sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime()).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.idea_title}</p>
                      <p className="text-xs text-muted-foreground">{d.platform} · {new Date(d.scheduled_date!).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Scheduled</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Activity */}
      {demoStep === 5 && <ActivityTab />}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { connectPlatform(connectModal, accountName); toast({ title: "Connected", description: `${connectModal} linked successfully.` }); } setConnectModal(null); }} />
    </>
  );
};

const DraftCard = ({ draft, onStatusChange, onSchedule }: { draft: SocialDraft; onStatusChange: (id: string, status: string) => void; onSchedule: (id: string, date: string) => void }) => {
  const [scheduling, setScheduling] = useState(false);
  const [schedDate, setSchedDate] = useState("");

  const statusColor: Record<string, string> = {
    draft: "bg-secondary text-muted-foreground border border-border",
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400",
    scheduled: "bg-primary/10 text-primary",
    published: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      draft.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
      draft.status === "rejected" ? "border-red-500/30 bg-red-500/5" :
      "border-border/50 bg-card"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-primary">{draft.platform}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[draft.status] || ""}`}>{draft.status}</span>
      </div>
      <h4 className="text-sm font-medium text-foreground mb-1">{draft.idea_title}</h4>
      {draft.hook && <p className="text-xs text-muted-foreground mb-1">{draft.hook}</p>}
      {draft.caption && <p className="text-xs text-muted-foreground mb-3">{draft.caption}</p>}
      {(draft.status === "draft" || draft.status === "pending") && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { onStatusChange(draft.id, "approved"); toast({ title: "Draft approved" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
          <button onClick={() => onStatusChange(draft.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><X size={12} /> Reject</button>
          <button onClick={() => onStatusChange(draft.id, "pending")} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><PenLine size={12} /> Edit</button>
        </div>
      )}
      {draft.status === "approved" && !scheduling && (
        <button onClick={() => setScheduling(true)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
          <Clock size={12} /> Schedule
        </button>
      )}
      {scheduling && (
        <div className="flex items-center gap-2 mt-2">
          <input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none" />
          <button onClick={() => { if (schedDate) { onSchedule(draft.id, new Date(schedDate).toISOString()); toast({ title: "Scheduled" }); setScheduling(false); } }}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">Confirm</button>
        </div>
      )}
    </div>
  );
};

const ActivityTab = () => {
  const { activities } = useWorkspaceData();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
      {activities.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No activity yet. Start using your AI Social Manager!</p>
        </div>
      ) : (
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
      )}
    </motion.div>
  );
};


export default SocialMediaDemo;
