import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppContext";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { generateSuggestedReply, generateTicketSummary } from "@/lib/ai-generators";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, AlertTriangle, MessageSquare, BarChart3,
  MailOpen, Facebook, Instagram, Globe, Upload, FileText, Plus,
  Loader2, Sparkles, AlignLeft,
} from "lucide-react";

const supportPlatforms = [
  { name: "Gmail", icon: MailOpen },
  { name: "Outlook", icon: MailOpen },
  { name: "Facebook Messages", icon: Facebook },
  { name: "Instagram DMs", icon: Instagram },
  { name: "Website Chat", icon: Globe },
];

const CustomerSupportDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateTicketStatus, updateTicketReply, updateTicketSummary, addKnowledge } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ overview: "", products: "", principles: "Fast, accurate, empathetic", brandTone: state.preferences.brandTone || "Professional", policies: "" });
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState("");
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  const tabs = ["Foundation", "Knowledge", "Communications", "Review", "Insights"];

  const handleGenerateReply = (ticketId: string) => {
    const ticket = state.supportTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    setGeneratingReply(ticketId);
    setTimeout(() => {
      const reply = generateSuggestedReply(ticket, foundation.brandTone);
      updateTicketReply(ticketId, reply);
      setGeneratingReply(null);
      toast({ title: "Reply generated", description: "New suggested reply is ready." });
    }, 1200);
  };

  const handleSummarize = (ticketId: string) => {
    const ticket = state.supportTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    setGeneratingSummary(ticketId);
    setTimeout(() => {
      const summary = generateTicketSummary(ticket);
      updateTicketSummary(ticketId, summary);
      setGeneratingSummary(null);
      toast({ title: "Summary created" });
    }, 800);
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 1: Start in Minutes</h3>
          <p className="text-sm text-muted-foreground">Provide your business context so your AI can draft accurate responses.</p>
          {[
            { key: "overview", label: "Business Overview" },
            { key: "products", label: "Products / Services" },
            { key: "principles", label: "Support Principles" },
            { key: "brandTone", label: "Brand Tone" },
            { key: "policies", label: "Refund / Policy Guidelines" },
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 2: Feed Your Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">Add documents and policies so your AI drafts accurately.</p>
          <div className="space-y-2">
            {state.supportKnowledge.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div className="flex items-center gap-2"><FileText size={14} className="text-primary" /><span className="text-sm text-foreground">{item}</span></div>
                <Check size={14} className="text-emerald-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newKnowledge} onChange={(e) => setNewKnowledge(e.target.value)} placeholder="Add document name..."
              className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            <button onClick={() => { if (newKnowledge.trim()) { addKnowledge(newKnowledge.trim()); setNewKnowledge(""); toast({ title: "Added" }); } }} className="btn-glow !px-4 text-sm"><Plus size={14} /></button>
          </div>
          <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-6 text-center">
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Drag & drop files or click to upload</p>
          </div>
          <div className="flex gap-3"><button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(2)} className="btn-glow text-sm">Continue</button></div>
        </motion.div>
      )}

      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 3: Set Up Communications</h3>
          <p className="text-sm text-muted-foreground">Connect the channels where customers reach you.</p>
          <div className="space-y-3">
            {supportPlatforms.map((p) => {
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
          <div className="flex gap-3"><button onClick={() => setDemoStep(1)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(3)} className="btn-glow text-sm">Continue</button></div>
        </motion.div>
      )}

      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 4: AI-Assisted Review</h3>
          <p className="text-sm text-muted-foreground">Your AI drafts responses. You approve, edit, or escalate.</p>
          <div className="space-y-4">
            {state.supportTickets.map((ticket) => (
              <div key={ticket.id} className={`rounded-xl border p-4 transition-all ${ticket.status === "replied" ? "border-emerald-500/30 bg-emerald-500/5" : ticket.status === "escalated" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div><span className="text-sm font-medium text-foreground">{ticket.subject}</span><p className="text-xs text-muted-foreground">{ticket.customer} · {ticket.time}</p></div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ticket.status === "replied" ? "bg-emerald-500/10 text-emerald-400" : ticket.status === "escalated" ? "bg-orange-500/10 text-orange-400" : ticket.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>{ticket.status === "open" ? ticket.priority : ticket.status}</span>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 mb-2"><p className="text-xs text-muted-foreground mb-1">Customer:</p><p className="text-sm text-foreground">{ticket.message}</p></div>
                {ticket.summary && <div className="rounded-lg bg-accent/10 border border-accent/20 p-2 mb-2"><p className="text-xs text-muted-foreground">Summary: <span className="text-foreground">{ticket.summary}</span></p></div>}
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3"><p className="text-xs text-primary/60 mb-1">AI Suggested Reply:</p><p className="text-sm text-foreground">{ticket.suggestedReply}</p></div>
                <div className="flex flex-wrap gap-2">
                  {ticket.status === "open" && (
                    <>
                      <button onClick={() => { updateTicketStatus(ticket.id, "replied"); toast({ title: "Reply sent" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve & Send</button>
                      <button onClick={() => updateTicketStatus(ticket.id, "escalated")} className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20"><AlertTriangle size={12} /> Escalate</button>
                    </>
                  )}
                  <button onClick={() => handleGenerateReply(ticket.id)} disabled={generatingReply === ticket.id} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    {generatingReply === ticket.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} New Reply
                  </button>
                  <button onClick={() => handleSummarize(ticket.id)} disabled={generatingSummary === ticket.id} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    {generatingSummary === ticket.id ? <Loader2 size={12} className="animate-spin" /> : <AlignLeft size={12} />} Summarize
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3"><button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(4)} className="btn-glow text-sm">View Insights</button></div>
        </motion.div>
      )}

      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 5: Use Insights to Improve</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tickets", value: String(state.supportTickets.length), icon: MessageSquare },
              { label: "Replied", value: String(state.supportTickets.filter(t => t.status === "replied").length), icon: ThumbsUp },
              { label: "Escalated", value: String(state.supportTickets.filter(t => t.status === "escalated").length), icon: AlertTriangle },
              { label: "Avg Response", value: "< 2 min", icon: BarChart3 },
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

export default CustomerSupportDemo;
