import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppContext";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { generatePostIdeas, ideaToDraft } from "@/lib/ai-generators";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, X, PenLine, BarChart3, Calendar, Eye,
  Instagram, Facebook, Linkedin, Twitter, Music2, Loader2, Sparkles, Plus,
} from "lucide-react";

const platformIcon: Record<string, any> = { Instagram, Facebook, LinkedIn: Linkedin, "X / Twitter": Twitter, TikTok: Music2 };
const socialPlatforms = ["Instagram", "Facebook", "LinkedIn", "TikTok", "X / Twitter"];

const SocialMediaDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateDraftStatus, setSocialStrategy, setPostIdeas, updatePostIdeaStatus, addSocialDraft } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ businessName: state.preferences.businessName || "", brandVoice: state.preferences.brandTone || "Professional", audience: "Small business owners", offerType: "AI workforce platform", goals: "Increase engagement and brand awareness" });
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [strategySaved, setStrategySaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const connectedSocial = socialPlatforms.filter((p) => isConnected(p));
  const tabs = ["Foundation", "Platforms", "Strategy", "AI Actions", "Approval", "Performance"];

  const handleGenerateIdeas = () => {
    setGenerating(true);
    setTimeout(() => {
      const ideas = generatePostIdeas(foundation.businessName, foundation.offerType);
      setPostIdeas(ideas);
      setGenerating(false);
      toast({ title: "Ideas generated", description: "3 new post ideas are ready to review." });
    }, 1500);
  };

  const handleDraftFromIdea = (ideaId: string) => {
    const idea = state.postIdeas.find((p) => p.id === ideaId);
    if (!idea) return;
    const draft = ideaToDraft(idea);
    addSocialDraft(draft);
    updatePostIdeaStatus(ideaId, "drafted");
    toast({ title: "Draft created", description: `New ${idea.platform} draft added.` });
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setDemoStep(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${demoStep === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>

      {demoStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 1: Set the Foundation</h3>
          <p className="text-sm text-muted-foreground">Tell us about your business so your AI can create relevant content.</p>
          {[
            { key: "businessName", label: "Business Name" },
            { key: "brandVoice", label: "Brand Voice" },
            { key: "audience", label: "Target Audience" },
            { key: "offerType", label: "Offer / Service Type" },
            { key: "goals", label: "Goals" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={foundation[key as keyof typeof foundation]} onChange={(e) => { setFoundation({ ...foundation, [key]: e.target.value }); setFoundationSaved(false); }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <button onClick={() => { setFoundationSaved(true); toast({ title: "Saved" }); setTimeout(() => setDemoStep(1), 600); }} className="btn-glow text-sm">
            {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
          </button>
        </motion.div>
      )}

      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 2: Connect Your Social Platforms</h3>
          <p className="text-sm text-muted-foreground">Link the accounts where you want content managed.</p>
          <div className="space-y-3">
            {socialPlatforms.map((p) => {
              const connected = isConnected(p);
              const conn = state.connections.find(c => c.platform === p);
              const Icon = platformIcon[p] || Instagram;
              return (
                <div key={p} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><Icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p}</p>
                      <p className="text-xs text-muted-foreground">{connected ? <span className="text-emerald-400">Connected · {conn?.accountName}</span> : "Not connected"}</p>
                    </div>
                  </div>
                  {connected ? (
                    <button onClick={() => removeConnection(p)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                  ) : (
                    <button onClick={() => setConnectModal(p)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(2)} className="btn-glow text-sm">Continue</button>
          </div>
        </motion.div>
      )}

      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 3: Set the Strategy</h3>
          <p className="text-sm text-muted-foreground">Define how your AI creates and manages content.</p>
          {[
            { key: "frequency", label: "Posting Frequency", placeholder: "3x per week" },
            { key: "themes", label: "Content Themes", placeholder: "Tips, Updates, Case studies" },
            { key: "formats", label: "Formats", placeholder: "Carousels, Single images, Stories" },
            { key: "hashtags", label: "Hashtags", placeholder: "#AI #SmallBusiness" },
            { key: "captionTone", label: "Caption Tone", placeholder: "Professional yet approachable" },
            { key: "kpis", label: "KPIs / Goals", placeholder: "Engagement rate, Reach" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={state.socialStrategy[key as keyof typeof state.socialStrategy] as string}
                onChange={(e) => { setSocialStrategy({ [key]: e.target.value }); setStrategySaved(false); }}
                placeholder={placeholder}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Require Approval Before Posting</p>
              <p className="text-xs text-muted-foreground">Review all drafts before they go live</p>
            </div>
            <button onClick={() => setSocialStrategy({ approvalRequired: !state.socialStrategy.approvalRequired })}
              className={`relative h-6 w-11 rounded-full transition-colors ${state.socialStrategy.approvalRequired ? "bg-primary" : "bg-secondary border border-border"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${state.socialStrategy.approvalRequired ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDemoStep(1)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => { setStrategySaved(true); toast({ title: "Strategy saved" }); setTimeout(() => setDemoStep(3), 400); }} className="btn-glow text-sm">
              {strategySaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Actions */}
      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">AI Content Actions</h3>
          <p className="text-sm text-muted-foreground">Let your AI generate post ideas based on your business.</p>

          <button onClick={handleGenerateIdeas} disabled={generating} className="btn-glow text-sm flex items-center gap-2">
            {generating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate 3 Post Ideas</>}
          </button>

          {state.postIdeas.length > 0 && (
            <div className="space-y-3">
              {state.postIdeas.map((idea) => (
                <div key={idea.id} className={`rounded-xl border p-4 ${idea.status === "drafted" ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-primary">{idea.platform}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${idea.status === "drafted" ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>{idea.status}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{idea.angle}</p>
                  <p className="text-xs text-muted-foreground mb-3">{idea.caption}</p>
                  {idea.status === "ready to draft" && (
                    <button onClick={() => handleDraftFromIdea(idea.id)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                      <Plus size={12} /> Create Draft
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(4)} className="btn-glow text-sm">Review Drafts</button>
          </div>
        </motion.div>
      )}

      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 4: Stay in Control</h3>
          <p className="text-sm text-muted-foreground">Review AI-generated drafts. Approve, edit, or reject.</p>
          <div className="space-y-3">
            {state.socialDrafts.map((draft) => (
              <div key={draft.id} className={`rounded-xl border p-4 transition-all ${
                draft.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" : draft.status === "rejected" ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-card"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">{draft.platform}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    draft.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : draft.status === "rejected" ? "bg-red-500/10 text-red-400" : draft.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground"
                  }`}>{draft.status}</span>
                </div>
                <p className="text-sm text-foreground mb-2">{draft.content}</p>
                <p className="text-xs text-muted-foreground mb-3">{draft.scheduledDate}</p>
                {(draft.status === "draft" || draft.status === "pending") && (
                  <div className="flex gap-2">
                    <button onClick={() => { updateDraftStatus(draft.id, "approved"); toast({ title: "Draft approved" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
                    <button onClick={() => updateDraftStatus(draft.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><X size={12} /> Reject</button>
                    <button onClick={() => updateDraftStatus(draft.id, "pending")} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><PenLine size={12} /> Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(3)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(5)} className="btn-glow text-sm">View Performance</button>
          </div>
        </motion.div>
      )}

      {demoStep === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 5: Measure What Works</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Engagement Rate", value: "4.2%", icon: BarChart3, sub: "+0.8% this week" },
              { label: "Total Drafts", value: String(state.socialDrafts.length), icon: Calendar, sub: "" },
              { label: "Approved", value: String(state.socialDrafts.filter((d) => d.status === "approved").length), icon: ThumbsUp, sub: "" },
              { label: "Pending Review", value: String(state.socialDrafts.filter((d) => d.status === "pending" || d.status === "draft").length), icon: Eye, sub: "" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <stat.icon size={18} className="text-primary mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.sub && <p className="text-xs text-emerald-400 mt-1">{stat.sub}</p>}
              </div>
            ))}
          </div>
          <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back to Foundation</button>
        </motion.div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() }); toast({ title: "Connected", description: `${connectModal} linked successfully.` }); } setConnectModal(null); }} />
    </>
  );
};

export default SocialMediaDemo;
