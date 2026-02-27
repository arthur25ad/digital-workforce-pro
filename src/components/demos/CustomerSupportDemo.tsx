import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerSupportData, SupportTicket, SupportDraft } from "@/hooks/useCustomerSupportData";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Check, ThumbsUp, AlertTriangle, MessageSquare, BarChart3,
  MailOpen, Facebook, Instagram, Globe, Upload, FileText, Plus,
  Loader2, Sparkles, PenLine, Send, X, Clock, Eye, ArrowUp, Trash2,
} from "lucide-react";

const supportChannels = [
  { name: "Gmail", icon: MailOpen },
  { name: "Outlook", icon: MailOpen },
  { name: "Facebook Messages", icon: Facebook },
  { name: "Instagram DMs", icon: Instagram },
  { name: "Website Chat", icon: Globe },
];

const CustomerSupportDemo = () => {
  const { workspace } = useAuth();
  const {
    knowledgeBase, knowledgeItems, tickets, drafts, connections, activities, loading,
    updateKnowledgeBase, addKnowledgeItem, removeKnowledgeItem,
    addTicket, updateTicketStatus,
    addSupportDraft, updateDraftStatus, updateDraftReply,
    connectChannel, disconnectChannel, isChannelConnected, getChannelConnection,
    logSupportActivity, fetchActivities, fetchTickets, fetchDrafts,
  } = useCustomerSupportData();

  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState("");
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    customerName: "", customerMessage: "", channel: "email", issueType: "", urgency: "medium",
  });

  // Foundation local state
  const [foundation, setFoundation] = useState({
    business_overview: "",
    products_services: "",
    support_principles: "",
    brand_tone: "",
    refund_policy: "",
    shipping_policy: "",
    escalation_rules: "",
    support_hours: "",
    sop_notes: "",
  });
  const [foundationLoaded, setFoundationLoaded] = useState(false);

  // Sync foundation from KB when it loads
  if (knowledgeBase && !foundationLoaded) {
    setFoundation({
      business_overview: knowledgeBase.business_overview || "",
      products_services: knowledgeBase.products_services || "",
      support_principles: knowledgeBase.support_principles || "",
      brand_tone: knowledgeBase.brand_tone || "",
      refund_policy: knowledgeBase.refund_policy || "",
      shipping_policy: knowledgeBase.shipping_policy || "",
      escalation_rules: knowledgeBase.escalation_rules || "",
      support_hours: knowledgeBase.support_hours || "",
      sop_notes: knowledgeBase.sop_notes || "",
    });
    setFoundationLoaded(true);
  }

  const tabs = ["Foundation", "Knowledge", "Communications", "Queue", "Review", "Insights", "Activity"];

  const handleSaveFoundation = async () => {
    await updateKnowledgeBase(foundation);
    setFoundationSaved(true);
    toast({ title: "Support Foundation saved" });
    await logSupportActivity("foundation_updated", "Updated Support Foundation");
    await fetchActivities();
    setTimeout(() => setDemoStep(1), 600);
  };

  const handleAddTicket = async () => {
    if (!workspace || !newTicket.customerName.trim() || !newTicket.customerMessage.trim()) {
      toast({ title: "Fill in customer name and message", variant: "destructive" });
      return;
    }
    const ticket = await addTicket({
      workspace_id: workspace.id,
      channel: newTicket.channel,
      customer_name: newTicket.customerName,
      customer_message: newTicket.customerMessage,
      issue_type: newTicket.issueType,
      urgency: newTicket.urgency,
      sentiment: "neutral",
      status: "new",
    });
    if (ticket) {
      setNewTicket({ customerName: "", customerMessage: "", channel: "email", issueType: "", urgency: "medium" });
      toast({ title: "Ticket created" });
    }
  };

  const handleGenerateReply = async (ticket: SupportTicket) => {
    setGeneratingReply(ticket.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-support-reply", {
        body: { ticket, knowledgeBase, knowledgeItems },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }
      const reply = data.reply;
      const draft = await addSupportDraft({
        workspace_id: workspace!.id,
        ticket_id: ticket.id,
        issue_summary: reply.issueSummary || "",
        suggested_reply: reply.suggestedReply || "",
        confidence_level: reply.confidenceLevel || "medium",
        escalation_flag: reply.escalationFlag || false,
        referenced_policy: reply.referencedPolicy || "",
        status: "draft",
      });
      if (draft) {
        await updateTicketStatus(ticket.id, "drafting");
        toast({ title: "Reply generated", description: "AI suggested reply is ready for review." });
        await logSupportActivity("reply_generated", `Generated reply for ${ticket.customer_name}`);
        await fetchActivities();
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setGeneratingReply(null);
    }
  };

  const handleApproveDraft = async (draft: SupportDraft) => {
    await updateDraftStatus(draft.id, "approved");
    if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "pending");
    toast({ title: "Draft approved" });
    await logSupportActivity("draft_approved", "Approved a support draft");
    await fetchActivities();
  };

  const handleEscalateDraft = async (draft: SupportDraft) => {
    await updateDraftStatus(draft.id, "escalated");
    if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "escalated");
    toast({ title: "Ticket escalated" });
    await logSupportActivity("ticket_escalated", "Escalated a support ticket");
    await fetchActivities();
  };

  const handleMarkSent = async (draft: SupportDraft) => {
    await updateDraftStatus(draft.id, "sent");
    if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "resolved");
    toast({ title: "Marked as sent" });
    await logSupportActivity("draft_sent", "Marked reply as sent");
    await fetchActivities();
  };

  const handleSaveEdit = async (draftId: string) => {
    await updateDraftReply(draftId, editText);
    setEditingDraft(null);
    setEditText("");
    toast({ title: "Draft updated" });
    await logSupportActivity("draft_edited", "Edited a support draft");
    await fetchActivities();
  };

  const getDraftForTicket = (ticketId: string) => drafts.find((d) => d.ticket_id === ticketId);

  const urgencyColor: Record<string, string> = {
    high: "bg-red-500/10 text-red-400",
    medium: "bg-yellow-500/10 text-yellow-400",
    low: "bg-emerald-500/10 text-emerald-400",
  };

  const statusColor: Record<string, string> = {
    new: "bg-primary/10 text-primary",
    drafting: "bg-yellow-500/10 text-yellow-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    escalated: "bg-orange-500/10 text-orange-400",
    resolved: "bg-emerald-500/10 text-emerald-400",
    draft: "bg-secondary text-muted-foreground border border-border",
    approved: "bg-emerald-500/10 text-emerald-400",
    edited: "bg-primary/10 text-primary",
    sent: "bg-emerald-500/10 text-emerald-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setDemoStep(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${demoStep === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{tab}</button>
        ))}
      </div>

      {/* Foundation */}
      {demoStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Support Foundation</h3>
          <p className="text-sm text-muted-foreground">Teach your AI how your business handles customer support.</p>
          {[
            { key: "business_overview", label: "Business Overview" },
            { key: "products_services", label: "Products / Services" },
            { key: "support_principles", label: "Support Principles" },
            { key: "brand_tone", label: "Brand Tone" },
            { key: "refund_policy", label: "Refund / Return Policy" },
            { key: "shipping_policy", label: "Shipping / Delivery Policy" },
            { key: "escalation_rules", label: "Escalation Rules" },
            { key: "support_hours", label: "Support Hours" },
            { key: "sop_notes", label: "Notes / Special Instructions" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={foundation[key as keyof typeof foundation]}
                onChange={(e) => { setFoundation({ ...foundation, [key]: e.target.value }); setFoundationSaved(false); }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <button onClick={handleSaveFoundation} className="btn-glow text-sm">
            {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
          </button>
        </motion.div>
      )}

      {/* Knowledge Base */}
      {demoStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Feed Your Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">Add documents and policies so your AI drafts accurately.</p>
          <div className="space-y-2">
            {knowledgeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  <span className="text-sm text-foreground">{item.title}</span>
                  <span className="text-[10px] text-muted-foreground">{item.item_type}</span>
                </div>
                <button onClick={() => removeKnowledgeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newKnowledge} onChange={(e) => setNewKnowledge(e.target.value)} placeholder="Add document name..."
              className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            <button onClick={async () => {
              if (newKnowledge.trim()) {
                await addKnowledgeItem(newKnowledge.trim());
                setNewKnowledge("");
                toast({ title: "Added to knowledge base" });
              }
            }} className="btn-glow !px-4 text-sm"><Plus size={14} /></button>
          </div>
          <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-6 text-center">
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Drag & drop files or click to upload (coming soon)</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(2)} className="btn-glow text-sm">Continue</button>
          </div>
        </motion.div>
      )}

      {/* Communications */}
      {demoStep === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Set Up Communications</h3>
          <p className="text-sm text-muted-foreground">Connect the channels where customers reach you.</p>
          <div className="space-y-3">
            {supportChannels.map((p) => {
              const connected = isChannelConnected(p.name);
              const conn = getChannelConnection(p.name);
              return (
                <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><p.icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
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
                    <button onClick={() => disconnectChannel(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                  ) : (
                    <button onClick={() => setConnectModal(p.name)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDemoStep(1)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => setDemoStep(3)} className="btn-glow text-sm">Continue</button>
          </div>
        </motion.div>
      )}

      {/* Support Queue */}
      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Support Queue</h3>
          <p className="text-sm text-muted-foreground">Add incoming messages and generate AI-suggested replies.</p>

          {/* Add ticket form */}
          <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">New Incoming Message</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer Name</label>
                <input value={newTicket.customerName} onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Channel</label>
                <select value={newTicket.channel} onChange={(e) => setNewTicket({ ...newTicket, channel: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="social">Social Media</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Issue Type</label>
                <input value={newTicket.issueType} onChange={(e) => setNewTicket({ ...newTicket, issueType: e.target.value })} placeholder="e.g. Billing, Product, Shipping"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Urgency</label>
                <select value={newTicket.urgency} onChange={(e) => setNewTicket({ ...newTicket, urgency: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Customer Message</label>
              <textarea value={newTicket.customerMessage} onChange={(e) => setNewTicket({ ...newTicket, customerMessage: e.target.value })} rows={3}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none" />
            </div>
            <button onClick={handleAddTicket} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> Add Ticket</button>
          </div>

          {/* Ticket list */}
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No tickets yet. Add an incoming message above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const draft = getDraftForTicket(ticket.id);
                return (
                  <div key={ticket.id} className={`rounded-xl border p-4 transition-all ${
                    ticket.status === "resolved" ? "border-emerald-500/30 bg-emerald-500/5" :
                    ticket.status === "escalated" ? "border-orange-500/30 bg-orange-500/5" :
                    "border-border/50 bg-card"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-foreground">{ticket.customer_name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{ticket.channel} · {ticket.issue_type || "General"}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyColor[ticket.urgency] || ""}`}>{ticket.urgency}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[ticket.status] || ""}`}>{ticket.status}</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 mb-2">
                      <p className="text-xs text-muted-foreground mb-1">Customer:</p>
                      <p className="text-sm text-foreground">{ticket.customer_message}</p>
                    </div>
                    {!draft && ticket.status !== "resolved" && (
                      <button onClick={() => handleGenerateReply(ticket)} disabled={generatingReply === ticket.id}
                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        {generatingReply === ticket.id ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> Generate Reply</>}
                      </button>
                    )}
                    {draft && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[draft.status] || ""}`}>Draft: {draft.status}</span>
                        <button onClick={() => setDemoStep(4)} className="ml-2 text-primary hover:underline">View in Review →</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Review */}
      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">You Review, AI Drafts</h3>
          <p className="text-sm text-muted-foreground">Approve, edit, or escalate AI-generated replies.</p>
          {drafts.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No drafts yet. Generate replies from the Queue tab.</p>
              <button onClick={() => setDemoStep(3)} className="mt-3 text-xs text-primary hover:underline">Go to Queue</button>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => {
                const ticket = tickets.find((t) => t.id === draft.ticket_id);
                const isEditing = editingDraft === draft.id;
                return (
                  <div key={draft.id} className={`rounded-xl border p-5 ${
                    draft.status === "approved" || draft.status === "sent" ? "border-emerald-500/30 bg-emerald-500/5" :
                    draft.status === "escalated" ? "border-orange-500/30 bg-orange-500/5" :
                    "border-border/50 bg-card"
                  }`}>
                    {ticket && (
                      <div className="rounded-lg bg-secondary/50 p-3 mb-3">
                        <p className="text-xs text-muted-foreground mb-1">From: {ticket.customer_name} · {ticket.channel}</p>
                        <p className="text-sm text-foreground">{ticket.customer_message}</p>
                      </div>
                    )}
                    {draft.issue_summary && (
                      <p className="text-xs text-muted-foreground mb-2"><span className="text-foreground/70">Summary:</span> {draft.issue_summary}</p>
                    )}
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(draft.id)} className="btn-glow !px-3 !py-1.5 text-xs">Save</button>
                          <button onClick={() => setEditingDraft(null)} className="btn-outline-glow !px-3 !py-1.5 text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3">
                        <p className="text-xs text-primary/60 mb-1">AI Suggested Reply:</p>
                        <p className="text-sm text-foreground">{draft.suggested_reply}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[draft.status] || ""}`}>{draft.status}</span>
                      {draft.confidence_level && (
                        <span className="text-[10px] text-muted-foreground">Confidence: {draft.confidence_level}</span>
                      )}
                      {draft.escalation_flag && (
                        <span className="flex items-center gap-1 text-[10px] text-orange-400"><AlertTriangle size={10} /> Escalation suggested</span>
                      )}
                      {draft.referenced_policy && (
                        <span className="text-[10px] text-muted-foreground">Policy: {draft.referenced_policy.substring(0, 60)}...</span>
                      )}
                    </div>
                    {(draft.status === "draft" || draft.status === "edited") && !isEditing && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={() => handleApproveDraft(draft)} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
                        <button onClick={() => { setEditingDraft(draft.id); setEditText(draft.suggested_reply || ""); }} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><PenLine size={12} /> Edit</button>
                        <button onClick={() => handleEscalateDraft(draft)} className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20"><AlertTriangle size={12} /> Escalate</button>
                      </div>
                    )}
                    {draft.status === "approved" && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleMarkSent(draft)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Send size={12} /> Mark Sent</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Insights */}
      {demoStep === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Use Insights to Improve</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Tickets", value: String(tickets.length), icon: MessageSquare },
              { label: "Drafts Ready", value: String(drafts.filter((d) => d.status === "draft" || d.status === "edited").length), icon: PenLine },
              { label: "Escalated", value: String(tickets.filter((t) => t.status === "escalated").length), icon: AlertTriangle },
              { label: "Resolved", value: String(tickets.filter((t) => t.status === "resolved").length), icon: Check },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <stat.icon size={18} className="text-primary mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Common issue types */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h4 className="text-sm font-semibold text-foreground mb-3">Common Issue Types</h4>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet. Add tickets to see trends.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(tickets.reduce((acc, t) => {
                  const type = t.issue_type || "General";
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <span className="text-sm text-foreground">{type}</span>
                    <span className="text-xs font-medium text-primary">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sentiment */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h4 className="text-sm font-semibold text-foreground mb-3">Urgency Breakdown</h4>
            <div className="flex gap-4">
              {["high", "medium", "low"].map((u) => {
                const count = tickets.filter((t) => t.urgency === u).length;
                return (
                  <div key={u} className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyColor[u]}`}>{u}</span>
                    <span className="text-sm font-bold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Activity */}
      {demoStep === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No activity yet. Start working to see your history.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.slice(0, 15).map((a) => (
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
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => {
          if (connectModal) {
            connectChannel(connectModal, accountName);
            toast({ title: "Connected", description: `${connectModal} linked.` });
          }
          setConnectModal(null);
        }} />
    </>
  );
};

export default CustomerSupportDemo;
