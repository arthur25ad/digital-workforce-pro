import { useState } from "react";
import { useVantaBrainActions, useVantaBrainSuggestions } from "@/hooks/useVantaBrain";
import SmartSuggestions from "@/components/SmartSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerSupportData, SupportTicket, SupportDraft } from "@/hooks/useCustomerSupportData";

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
  Check, ThumbsUp, AlertTriangle, MessageSquare, PenLine, Send, X, Clock,
  MailOpen, Facebook, Instagram, Globe, Upload, FileText, Plus, Loader2, Sparkles,
  Shield, BookOpen, Inbox, TrendingUp, Trash2,
} from "lucide-react";

const supportChannels = [
  { name: "Gmail", icon: MailOpen }, { name: "Outlook", icon: MailOpen },
  { name: "Facebook Messages", icon: Facebook }, { name: "Instagram DMs", icon: Instagram },
  { name: "Website Chat", icon: Globe },
];

const CustomerSupportDemo = () => {
  const { workspace } = useAuth();
  const { recordInteraction } = useVantaBrainActions();
  const { suggestions: brainSuggestions, loading: suggestionsLoading, sendFeedback } = useVantaBrainSuggestions("customer-support");
  const {
    knowledgeBase, knowledgeItems, tickets, drafts, connections, activities, loading,
    updateKnowledgeBase, addKnowledgeItem, removeKnowledgeItem,
    addTicket, updateTicketStatus, addSupportDraft, updateDraftStatus, updateDraftReply,
    connectChannel, disconnectChannel, isChannelConnected, getChannelConnection,
    logSupportActivity, fetchActivities, fetchTickets, fetchDrafts,
  } = useCustomerSupportData();

  
  const [activeTab, setActiveTab] = useState(0);
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState("");
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newTicket, setNewTicket] = useState({ customerName: "", customerMessage: "", channel: "email", issueType: "", urgency: "medium" });

  const [foundation, setFoundation] = useState({
    business_overview: "", products_services: "", support_principles: "", brand_tone: "",
    refund_policy: "", shipping_policy: "", escalation_rules: "", support_hours: "", sop_notes: "",
  });
  const [foundationLoaded, setFoundationLoaded] = useState(false);

  if (knowledgeBase && !foundationLoaded) {
    setFoundation({
      business_overview: knowledgeBase.business_overview || "", products_services: knowledgeBase.products_services || "",
      support_principles: knowledgeBase.support_principles || "", brand_tone: knowledgeBase.brand_tone || "",
      refund_policy: knowledgeBase.refund_policy || "", shipping_policy: knowledgeBase.shipping_policy || "",
      escalation_rules: knowledgeBase.escalation_rules || "", support_hours: knowledgeBase.support_hours || "",
      sop_notes: knowledgeBase.sop_notes || "",
    });
    setFoundationLoaded(true);
  }

  const tabs = [
    { label: "Foundation", icon: <Shield size={14} /> },
    { label: "Knowledge", icon: <BookOpen size={14} /> },
    { label: "Channels", icon: <Inbox size={14} /> },
    { label: "Queue", icon: <MessageSquare size={14} /> },
    { label: "Review", icon: <ThumbsUp size={14} /> },
    { label: "Insights", icon: <TrendingUp size={14} /> },
    { label: "Activity", icon: <Clock size={14} /> },
  ];

  const handleSaveFoundation = async () => {
    await updateKnowledgeBase(foundation);
    setFoundationSaved(true);
    toast({ title: "Support Foundation saved" });
    await logSupportActivity("foundation_updated", "Updated Support Foundation");
    await fetchActivities();
  };

  const handleAddTicket = async () => {
    if (!workspace || !newTicket.customerName.trim() || !newTicket.customerMessage.trim()) {
      toast({ title: "Fill in customer name and message", variant: "destructive" }); return;
    }
    await addTicket({ workspace_id: workspace.id, channel: newTicket.channel, customer_name: newTicket.customerName, customer_message: newTicket.customerMessage, issue_type: newTicket.issueType, urgency: newTicket.urgency, sentiment: "neutral", status: "new" });
    setNewTicket({ customerName: "", customerMessage: "", channel: "email", issueType: "", urgency: "medium" });
    toast({ title: "Ticket created" });
  };

  const handleGenerateReply = async (ticket: SupportTicket) => {
    setGeneratingReply(ticket.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-support-reply", { body: { ticket, knowledgeBase, knowledgeItems, workspaceId: workspace?.id } });
      if (error) throw error;
      if (data?.error) { toast({ title: "AI Error", description: data.error, variant: "destructive" }); return; }
      const reply = data.reply;
      const draft = await addSupportDraft({ workspace_id: workspace!.id, ticket_id: ticket.id, issue_summary: reply.issueSummary || "", suggested_reply: reply.suggestedReply || "", confidence_level: reply.confidenceLevel || "medium", escalation_flag: reply.escalationFlag || false, referenced_policy: reply.referencedPolicy || "", status: "draft" });
      if (draft) { await updateTicketStatus(ticket.id, "drafting"); toast({ title: "Reply generated" }); await logSupportActivity("reply_generated", `Generated reply for ${ticket.customer_name}`); await fetchActivities(); }
    } catch (err: any) { toast({ title: "Generation failed", description: err.message, variant: "destructive" }); }
    finally { setGeneratingReply(null); }
  };

  const handleApproveDraft = async (draft: SupportDraft) => { await updateDraftStatus(draft.id, "approved"); if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "pending"); toast({ title: "Draft approved" }); };
  const handleEscalateDraft = async (draft: SupportDraft) => { await updateDraftStatus(draft.id, "escalated"); if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "escalated"); toast({ title: "Ticket escalated" }); };
  const handleMarkSent = async (draft: SupportDraft) => { await updateDraftStatus(draft.id, "sent"); if (draft.ticket_id) await updateTicketStatus(draft.ticket_id, "resolved"); toast({ title: "Marked as sent" }); };
  const handleSaveEdit = async (draftId: string) => { await updateDraftReply(draftId, editText); setEditingDraft(null); setEditText(""); toast({ title: "Draft updated" }); };

  const getDraftForTicket = (ticketId: string) => drafts.find(d => d.ticket_id === ticketId);
  const urgencyStyle: Record<string, string> = { high: "bg-red-500/10 text-red-400", medium: "bg-yellow-500/10 text-yellow-400", low: "bg-emerald-500/10 text-emerald-400" };
  const statusStyle: Record<string, string> = { new: "bg-primary/10 text-primary", drafting: "bg-yellow-500/10 text-yellow-400", pending: "bg-yellow-500/10 text-yellow-400", escalated: "bg-orange-500/10 text-orange-400", resolved: "bg-emerald-500/10 text-emerald-400", draft: "bg-secondary text-muted-foreground", approved: "bg-emerald-500/10 text-emerald-400", sent: "bg-emerald-500/10 text-emerald-400" };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
      <WorkspaceShell tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <SmartSuggestions suggestions={brainSuggestions} loading={suggestionsLoading} onFeedback={sendFeedback} />
        {/* Foundation */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <FormFieldGroup title="Business & Products" description="Core context for AI replies" icon={<Shield size={16} />}
              fields={[
                { key: "business_overview", label: "Business Overview", placeholder: "What does your business do?" },
                { key: "products_services", label: "Products / Services", placeholder: "Your main offerings" },
                { key: "support_principles", label: "Support Principles", placeholder: "Customer first, fast response..." },
                { key: "brand_tone", label: "Brand Tone", placeholder: "Warm, professional, casual..." },
              ]}
              values={foundation} onChange={(k, v) => { setFoundation({ ...foundation, [k]: v }); setFoundationSaved(false); }} />
            <FormFieldGroup title="Policies & Rules" description="Teach your AI your business rules" icon={<BookOpen size={16} />}
              fields={[
                { key: "refund_policy", label: "Refund / Return Policy", placeholder: "Your refund terms" },
                { key: "shipping_policy", label: "Shipping / Delivery Policy", placeholder: "Delivery timeframes" },
                { key: "escalation_rules", label: "Escalation Rules", placeholder: "When to escalate to a human" },
                { key: "support_hours", label: "Support Hours", placeholder: "Mon-Fri 9am-5pm..." },
              ]}
              values={foundation} onChange={(k, v) => { setFoundation({ ...foundation, [k]: v }); setFoundationSaved(false); }} />
            <FormFieldGroup title="Additional Notes" icon={<FileText size={16} />}
              fields={[{ key: "sop_notes", label: "Notes / Special Instructions", type: "textarea" as const, placeholder: "Any extra info for the AI" }]}
              values={foundation} onChange={(k, v) => { setFoundation({ ...foundation, [k]: v }); setFoundationSaved(false); }} />
            <button onClick={handleSaveFoundation} className="btn-glow text-sm">
              {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Foundation"}
            </button>
          </div>
        )}

        {/* Knowledge Base */}
        {activeTab === 1 && (
          <WorkspaceSection title="Knowledge Base" description="Add documents and policies so your AI drafts accurately.">
            <div className="space-y-3">
              {knowledgeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3.5">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-primary" /><span className="text-sm text-foreground">{item.title}</span><span className="text-[10px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{item.item_type}</span></div>
                  <button onClick={() => removeKnowledgeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input value={newKnowledge} onChange={e => setNewKnowledge(e.target.value)} placeholder="Add document name..."
                className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              <button onClick={async () => { if (newKnowledge.trim()) { await addKnowledgeItem(newKnowledge.trim()); setNewKnowledge(""); toast({ title: "Added to knowledge base" }); } }} className="btn-glow !px-4 text-sm"><Plus size={14} /></button>
            </div>
            <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-6 text-center mt-4">
              <Upload size={24} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Drag & drop files or click to upload (coming soon)</p>
            </div>
          </WorkspaceSection>
        )}

        {/* Channels */}
        {activeTab === 2 && (
          <WorkspaceSection title="Support Channels" description="Connect the channels where customers reach you.">
            <div className="space-y-3">
              {supportChannels.map(p => {
                const conn = getChannelConnection(p.name);
                return <ConnectionCard key={p.name} name={p.name} icon={<p.icon size={20} />} connected={isChannelConnected(p.name)} accountName={conn?.account_name} connectedAt={conn?.connected_at} onDisconnect={() => disconnectChannel(p.name)} comingSoon />;
              })}
            </div>
          </WorkspaceSection>
        )}

        {/* Queue */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <WorkspaceSection title="Support Queue" description="Add incoming messages and generate AI-suggested replies.">
              <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">New Incoming Message</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Customer Name</label><input value={newTicket.customerName} onChange={e => setNewTicket({...newTicket, customerName: e.target.value})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Channel</label><select value={newTicket.channel} onChange={e => setNewTicket({...newTicket, channel: e.target.value})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none"><option value="email">Email</option><option value="chat">Chat</option><option value="social">Social Media</option><option value="phone">Phone</option></select></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Issue Type</label><input value={newTicket.issueType} onChange={e => setNewTicket({...newTicket, issueType: e.target.value})} placeholder="e.g. Billing, Product" className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors" /></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Urgency</label><select value={newTicket.urgency} onChange={e => setNewTicket({...newTicket, urgency: e.target.value})} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                </div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Customer Message</label><textarea value={newTicket.customerMessage} onChange={e => setNewTicket({...newTicket, customerMessage: e.target.value})} rows={2} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none transition-colors" /></div>
                <button onClick={handleAddTicket} className="btn-glow text-sm flex items-center gap-1"><Plus size={14} /> Add Ticket</button>
              </div>
            </WorkspaceSection>

            {tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const draft = getDraftForTicket(ticket.id);
                  return (
                    <div key={ticket.id} className={`rounded-xl border p-4 transition-all ${ticket.status === "resolved" ? "border-emerald-500/30 bg-emerald-500/5" : ticket.status === "escalated" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{ticket.customer_name} <span className="text-xs text-muted-foreground ml-1">{ticket.channel} · {ticket.issue_type || "General"}</span></span>
                        <div className="flex gap-1.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyStyle[ticket.urgency] || ""}`}>{ticket.urgency}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[ticket.status] || ""}`}>{ticket.status}</span></div>
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3 mb-3"><p className="text-sm text-foreground">{ticket.customer_message}</p></div>
                      {!draft && ticket.status !== "resolved" && (
                        <button onClick={() => handleGenerateReply(ticket)} disabled={generatingReply === ticket.id} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          {generatingReply === ticket.id ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> Generate Reply</>}
                        </button>
                      )}
                      {draft && <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[draft.status] || ""}`}>Draft: {draft.status}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Review */}
        {activeTab === 4 && (
          <WorkspaceSection title="Review Drafts" description="Approve, edit, or escalate AI-generated replies.">
            {drafts.length === 0 ? (
              <EmptyState icon={<ThumbsUp size={20} />} message="No drafts yet. Generate replies from the Queue tab."
                action={<button onClick={() => setActiveTab(3)} className="text-xs text-primary hover:underline">Go to Queue</button>} />
            ) : (
              <div className="space-y-4">
                {drafts.map(draft => {
                  const ticket = tickets.find(t => t.id === draft.ticket_id);
                  const isEditing = editingDraft === draft.id;
                  return (
                    <div key={draft.id} className={`rounded-xl border p-5 transition-all ${draft.status === "approved" || draft.status === "sent" ? "border-emerald-500/30 bg-emerald-500/5" : draft.status === "escalated" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                      {ticket && <div className="rounded-lg bg-secondary/50 p-3 mb-3"><p className="text-xs text-muted-foreground mb-1">From: {ticket.customer_name} · {ticket.channel}</p><p className="text-sm text-foreground">{ticket.customer_message}</p></div>}
                      {isEditing ? (
                        <div className="space-y-2 mb-3">
                          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(draft.id)} className="btn-glow !px-3 !py-1.5 text-xs">Save</button>
                            <button onClick={() => setEditingDraft(null)} className="btn-outline-glow !px-3 !py-1.5 text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 mb-3"><p className="text-xs text-primary/60 mb-1">AI Suggested Reply:</p><p className="text-sm text-foreground">{draft.suggested_reply}</p></div>
                      )}
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[draft.status] || ""}`}>{draft.status}</span>
                        {draft.confidence_level && <span className="text-[10px] text-muted-foreground">Confidence: {draft.confidence_level}</span>}
                        {draft.escalation_flag && <span className="flex items-center gap-1 text-[10px] text-orange-400"><AlertTriangle size={10} /> Escalation suggested</span>}
                      </div>
                      {(draft.status === "draft" || draft.status === "edited") && !isEditing && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => handleApproveDraft(draft)} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><ThumbsUp size={12} /> Approve</button>
                          <button onClick={() => { setEditingDraft(draft.id); setEditText(draft.suggested_reply || ""); }} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><PenLine size={12} /> Edit</button>
                          <button onClick={() => handleEscalateDraft(draft)} className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/20"><AlertTriangle size={12} /> Escalate</button>
                        </div>
                      )}
                      {draft.status === "approved" && <div className="flex gap-2 mt-3"><button onClick={() => handleMarkSent(draft)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Send size={12} /> Mark Sent</button></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Insights */}
        {activeTab === 5 && (
          <WorkspaceSection title="Support Insights" description="Track your support performance.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Tickets" value={tickets.length} icon={<MessageSquare size={18} />} />
              <StatCard label="Drafts Ready" value={drafts.filter(d => d.status === "draft" || d.status === "edited").length} icon={<PenLine size={18} />} />
              <StatCard label="Escalated" value={tickets.filter(t => t.status === "escalated").length} icon={<AlertTriangle size={18} />} accent="text-orange-400" />
              <StatCard label="Resolved" value={tickets.filter(t => t.status === "resolved").length} icon={<Check size={18} />} accent="text-emerald-400" />
            </div>
            {tickets.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 mt-5">
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Issue Types</h4>
                  <div className="space-y-2">{Object.entries(tickets.reduce((acc, t) => { const type = t.issue_type || "General"; acc[type] = (acc[type] || 0) + 1; return acc; }, {} as Record<string, number>)).sort(([,a],[,b]) => b - a).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5"><span className="text-sm text-foreground">{type}</span><span className="text-xs font-medium text-primary">{count}</span></div>
                  ))}</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Urgency Breakdown</h4>
                  <div className="space-y-2">{["high", "medium", "low"].map(u => (
                    <div key={u} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${urgencyStyle[u]}`}>{u}</span><span className="text-sm font-bold text-foreground">{tickets.filter(t => t.urgency === u).length}</span></div>
                  ))}</div>
                </div>
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Activity */}
        {activeTab === 6 && (
          <WorkspaceSection title="Recent Activity" description="Your support history.">
            <ActivityFeed activities={activities} emptyMessage="No activity yet. Start working to see your history." />
          </WorkspaceSection>
        )}
      </WorkspaceShell>

    </>
  );
};

export default CustomerSupportDemo;
