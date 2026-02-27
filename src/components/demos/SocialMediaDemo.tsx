import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppContext";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import {
  Check, ThumbsUp, X, PenLine, BarChart3, Calendar, Eye,
  Instagram, Facebook, Linkedin, Twitter, Music2,
} from "lucide-react";

const platformIcon: Record<string, any> = { Instagram, Facebook, LinkedIn: Linkedin, "X / Twitter": Twitter, TikTok: Music2 };
const socialPlatforms = ["Instagram", "Facebook", "LinkedIn", "TikTok", "X / Twitter"];

const SocialMediaDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateDraftStatus, setSocialStrategy } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ businessName: state.preferences.businessName || "", brandVoice: state.preferences.brandTone || "Professional", audience: "Small business owners", offerType: "AI workforce platform", goals: "Increase engagement and brand awareness" });
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [strategySaved, setStrategySaved] = useState(false);

  const connectedSocial = socialPlatforms.filter((p) => isConnected(p));
  const tabs = ["Foundation", "Platforms", "Strategy", "Approval", "Performance"];

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
          <p className="text-sm text-muted-foreground">Tell us about your business so your AI Social Media Manager can create relevant, on-brand content.</p>
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
          <div className="flex items-center gap-3">
            <button onClick={() => { setFoundationSaved(true); setTimeout(() => setDemoStep(1), 800); }} className="btn-glow text-sm">
              {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
            </button>
          </div>
        </motion.div>
      )}

      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 2: Connect Your Social Platforms</h3>
          <p className="text-sm text-muted-foreground">Link the accounts where you want content managed. Your AI employee will draft and schedule posts for these platforms.</p>
          <div className="space-y-3">
            {socialPlatforms.map((p) => {
              const connected = isConnected(p);
              const Icon = platformIcon[p] || Instagram;
              return (
                <div key={p} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><Icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p}</p>
                      <p className="text-xs text-muted-foreground">{connected ? "Connected" : "Not connected"}</p>
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
            { key: "kpis", label: "KPIs / Goals", placeholder: "Engagement rate, Reach, Follower growth" },
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
            <button onClick={() => { setStrategySaved(true); setTimeout(() => setDemoStep(3), 500); }} className="btn-glow text-sm">
              {strategySaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
            </button>
          </div>
        </motion.div>
      )}

      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 4: Stay in Control</h3>
          <p className="text-sm text-muted-foreground">Review AI-generated drafts. Approve, edit, or reject before anything goes live.</p>
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
                    <button onClick={() => updateDraftStatus(draft.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"><ThumbsUp size={12} /> Approve</button>
                    <button onClick={() => updateDraftStatus(draft.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"><X size={12} /> Reject</button>
                    <button onClick={() => updateDraftStatus(draft.id, "pending")} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"><PenLine size={12} /> Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(4)} className="btn-glow text-sm">View Performance</button>
          </div>
        </motion.div>
      )}

      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 5: Measure What Works</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Engagement Rate", value: "4.2%", icon: BarChart3, sub: "+0.8% this week" },
              { label: "Scheduled Posts", value: String(state.socialDrafts.filter((d) => d.status !== "rejected").length), icon: Calendar, sub: "" },
              { label: "Approved Drafts", value: String(state.socialDrafts.filter((d) => d.status === "approved").length), icon: ThumbsUp, sub: "" },
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
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Weekly Recap</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {state.socialDrafts.filter(d => d.status === "approved").length} posts approved and scheduled this week</p>
              <p>• Top platform: Instagram (highest engagement)</p>
              <p>• Content themes performing well: Business tips, Product updates</p>
              <p>• Recommendation: Increase posting frequency on LinkedIn</p>
            </div>
          </div>
          <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back to Foundation</button>
        </motion.div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() }); setConnectModal(null); }} />
    </>
  );
};

export default SocialMediaDemo;
