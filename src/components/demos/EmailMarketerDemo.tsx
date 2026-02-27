import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppContext";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { generateCampaignDraft, generateSubjectVariations } from "@/lib/ai-generators";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, X, Calendar, BarChart3, PenLine, Eye, Send,
  MailOpen, Mail, Loader2, Sparkles,
} from "lucide-react";

const emailPlatforms = [
  { name: "Gmail", icon: MailOpen },
  { name: "Outlook", icon: MailOpen },
  { name: "Mailchimp", icon: Mail },
  { name: "Klaviyo", icon: Mail },
  { name: "HubSpot", icon: Mail },
];

const EmailMarketerDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateCampaignStatus, setEmailStrategy, addEmailCampaign, updateCampaignSubjectVariations, setCampaignSubject } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ brand: state.preferences.businessName || "", audience: "", sells: "", tone: state.preferences.brandTone || "Professional", goals: "" });
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [strategySaved, setStrategySaved] = useState(false);
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [generatingSubjects, setGeneratingSubjects] = useState<string | null>(null);

  const tabs = ["Foundation", "Email Tools", "Strategy", "AI Actions", "Review", "Performance"];

  const handleGenerateCampaign = () => {
    setGeneratingCampaign(true);
    setTimeout(() => {
      const campaign = generateCampaignDraft(foundation.brand);
      addEmailCampaign(campaign);
      setGeneratingCampaign(false);
      toast({ title: "Campaign draft created", description: `"${campaign.name}" added.` });
    }, 1500);
  };

  const handleGenerateSubjects = (campaignId: string) => {
    const campaign = state.emailCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    setGeneratingSubjects(campaignId);
    setTimeout(() => {
      const variations = generateSubjectVariations(campaign.subject);
      updateCampaignSubjectVariations(campaignId, variations);
      setGeneratingSubjects(null);
      toast({ title: "Subject variations ready" });
    }, 1000);
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 1: Explain Your Business</h3>
          <p className="text-sm text-muted-foreground">Help your AI understand what you sell and how to write for your brand.</p>
          {[
            { key: "brand", label: "Brand Name" },
            { key: "audience", label: "Target Audience" },
            { key: "sells", label: "What You Sell" },
            { key: "tone", label: "Email Tone" },
            { key: "goals", label: "Campaign Goals" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={foundation[key as keyof typeof foundation]} onChange={(e) => { setFoundation({ ...foundation, [key]: e.target.value }); setFoundationSaved(false); }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <button onClick={() => { setFoundationSaved(true); toast({ title: "Saved" }); setTimeout(() => setDemoStep(1), 500); }} className="btn-glow text-sm">
            {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
          </button>
        </motion.div>
      )}

      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 2: Plug Your Email Tools</h3>
          <p className="text-sm text-muted-foreground">Connect the platforms where you send campaigns.</p>
          <div className="space-y-3">
            {emailPlatforms.map((p) => {
              const connected = isConnected(p.name);
              const conn = state.connections.find(c => c.platform === p.name);
              return (
                <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><p.icon size={20} /></div>
                    <div><p className="text-sm font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{connected ? <span className="text-emerald-400">Connected · {conn?.accountName}</span> : "Not connected"}</p></div>
                  </div>
                  {connected ? <button onClick={() => removeConnection(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                    : <button onClick={() => setConnectModal(p.name)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3"><button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(2)} className="btn-glow text-sm">Continue</button></div>
        </motion.div>
      )}

      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 3: Set the Email Strategy</h3>
          <p className="text-sm text-muted-foreground">Define campaign types, segments, and sending rules.</p>
          {[
            { key: "campaignTypes", label: "Campaign Types", placeholder: "Newsletters, Promotions, Welcome series" },
            { key: "flows", label: "Flows / Automations", placeholder: "Welcome, Post-purchase, Re-engagement" },
            { key: "frequency", label: "Sending Frequency", placeholder: "Weekly newsletters, 2x monthly promos" },
            { key: "segments", label: "Audience Segments", placeholder: "New subscribers, Active users" },
            { key: "kpis", label: "KPIs", placeholder: "Open rate, Click rate, Conversion" },
            { key: "offerTypes", label: "Offer Types", placeholder: "Discounts, Free trials, Early access" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={state.emailStrategy[key as keyof typeof state.emailStrategy]} onChange={(e) => { setEmailStrategy({ [key]: e.target.value }); setStrategySaved(false); }}
                placeholder={placeholder} className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
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
          <h3 className="font-display text-lg font-semibold text-foreground">AI Email Actions</h3>
          <p className="text-sm text-muted-foreground">Generate campaign drafts and subject line variations.</p>

          <button onClick={handleGenerateCampaign} disabled={generatingCampaign} className="btn-glow text-sm flex items-center gap-2">
            {generatingCampaign ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Campaign Draft</>}
          </button>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(4)} className="btn-glow text-sm">Review Campaigns</button>
          </div>
        </motion.div>
      )}

      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 4: Stay in Control</h3>
          <p className="text-sm text-muted-foreground">Review AI-drafted campaigns before they send.</p>
          <div className="space-y-4">
            {state.emailCampaigns.map((campaign) => (
              <div key={campaign.id} className={`rounded-xl border p-4 transition-all ${
                campaign.status === "approved" || campaign.status === "scheduled" ? "border-emerald-500/30 bg-emerald-500/5" : campaign.status === "rejected" ? "border-red-500/30 bg-red-500/5" : "border-border/50 bg-card"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{campaign.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    campaign.status === "approved" || campaign.status === "scheduled" ? "bg-emerald-500/10 text-emerald-400" : campaign.status === "rejected" ? "bg-red-500/10 text-red-400" : campaign.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground"
                  }`}>{campaign.status}</span>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 mb-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground">{campaign.subject}</span></p>
                  <p className="text-xs text-muted-foreground">Preview: <span className="text-foreground">{campaign.previewText}</span></p>
                  <p className="text-xs text-muted-foreground">To: <span className="text-foreground">{campaign.recipients}</span></p>
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{campaign.body}</p>
                </div>

                {/* Subject variations */}
                {campaign.subjectVariations && campaign.subjectVariations.length > 0 && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
                    <p className="text-xs text-primary/60 mb-2">Subject Variations — click to use:</p>
                    <div className="space-y-1">
                      {campaign.subjectVariations.map((v, i) => (
                        <button key={i} onClick={() => { setCampaignSubject(campaign.id, v); toast({ title: "Subject updated" }); }}
                          className="block w-full text-left rounded px-2 py-1 text-xs text-foreground hover:bg-primary/10 transition-colors">{v}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(campaign.status === "draft" || campaign.status === "pending") && (
                    <>
                      <button onClick={() => { updateCampaignStatus(campaign.id, "approved"); toast({ title: "Campaign approved" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
                      <button onClick={() => updateCampaignStatus(campaign.id, "scheduled")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Calendar size={12} /> Schedule</button>
                      <button onClick={() => updateCampaignStatus(campaign.id, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"><X size={12} /> Reject</button>
                    </>
                  )}
                  <button onClick={() => handleGenerateSubjects(campaign.id)} disabled={generatingSubjects === campaign.id} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    {generatingSubjects === campaign.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Subject Variations
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3"><button onClick={() => setDemoStep(3)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(5)} className="btn-glow text-sm">View Performance</button></div>
        </motion.div>
      )}

      {demoStep === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 5: Review Performance</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Campaigns", value: String(state.emailCampaigns.length), icon: PenLine },
              { label: "Scheduled", value: String(state.emailCampaigns.filter(c => c.status === "scheduled" || c.status === "approved").length), icon: Send },
              { label: "Open Rate", value: "24.3%", icon: Eye },
              { label: "Click Rate", value: "3.8%", icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <stat.icon size={18} className="text-primary mb-2" /><p className="font-display text-2xl font-bold text-foreground">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back to Foundation</button>
        </motion.div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() }); toast({ title: "Connected", description: `${connectModal} linked.` }); } setConnectModal(null); }} />
    </>
  );
};

export default EmailMarketerDemo;
