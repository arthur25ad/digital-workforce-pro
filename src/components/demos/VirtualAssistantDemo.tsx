import { useState } from "react";
import { motion } from "framer-motion";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
import { useAuth } from "@/hooks/useAuth";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Check, Loader2, Sparkles, Plus, Calendar, FileText, Clock,
  AlertCircle, Inbox, ListChecks, PenLine, BarChart3, Bell, Slack,
  HardDrive, Play, Pause, Archive, ChevronRight,
} from "lucide-react";

const toolPlatforms = [
  { name: "Gmail", icon: FileText },
  { name: "Google Calendar", icon: Calendar },
  { name: "Slack", icon: Slack },
  { name: "Website Contact Form", icon: Inbox },
  { name: "Google Drive", icon: HardDrive },
];

const VirtualAssistantDemo = () => {
  const { session } = useAuth();
  const {
    profile, tasks, requests, drafts, connections, activities, loading,
    updateProfile, addRequest, updateRequestStatus,
    addTask, updateTaskStatus, addDraft, updateDraftStatus, updateDraftContent,
    connectTool, disconnectTool, isToolConnected, getToolConnection,
    logActivity,
  } = useVirtualAssistantData();

  const [tab, setTab] = useState(0);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  // Foundation form
  const [foundationForm, setFoundationForm] = useState<Record<string, string>>({});
  const [foundationSaved, setFoundationSaved] = useState(false);

  // Request form
  const [reqForm, setReqForm] = useState({ source: "manual", requester_name: "", request_summary: "", request_details: "", urgency: "medium" });

  // Draft editing
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const tabs = ["Foundation", "Requests", "Tasks", "Drafts", "Tools", "Today", "Insights", "Activity"];

  // AI Generation
  const handleGenerateDraft = async (request: any) => {
    if (!session?.access_token) return;
    setGenerating(request.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-assistant-draft", {
        body: { request, profile },
      });
      if (error) throw error;
      if (data?.draft) {
        const d = data.draft;
        await addDraft({
          request_id: request.id,
          draft_type: d.draftType || "response",
          subject: d.requestSummary || request.request_summary,
          draft_content: d.draftResponse || "",
          next_step: d.nextStep || "",
        });
        if (d.recommendedAction) {
          await addTask({
            title: d.recommendedAction,
            priority: d.suggestedPriority || "medium",
            category: "ai-generated",
            description: d.nextStep || "",
          });
        }
        await updateRequestStatus(request.id, "drafted");
        toast({ title: "AI generated draft & task" });
      }
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <>
      {/* What this AI can do */}
      <div className="mb-8 rounded-xl border border-border/50 bg-card p-5">
        <h3 className="font-display text-sm font-semibold text-foreground mb-3">What this AI can do</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {["Organize day-to-day tasks", "Draft routine messages", "Help track follow-ups", "Manage incoming requests", "Keep priorities organized", "Support lightweight operations", "Help the business stay on top of admin work"].map(c => (
            <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={14} className="text-primary shrink-0" />{c}</div>
          ))}
        </div>
      </div>

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
          <h3 className="font-display text-lg font-semibold text-foreground">Assistant Foundation</h3>
          <p className="text-sm text-muted-foreground">Teach your AI assistant how your business operates.</p>
          {[
            { key: "business_overview", label: "Business Overview" },
            { key: "main_responsibilities", label: "Main Responsibilities for the Assistant" },
            { key: "preferred_tone", label: "Preferred Tone" },
            { key: "priority_rules", label: "Priority Rules" },
            { key: "recurring_tasks", label: "Recurring Tasks" },
            { key: "communication_preferences", label: "Communication Preferences" },
            { key: "important_notes", label: "Important Notes" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <textarea
                rows={2}
                value={foundationForm[key] ?? (profile as any)?.[key] ?? ""}
                onChange={(e) => { setFoundationForm(p => ({ ...p, [key]: e.target.value })); setFoundationSaved(false); }}
                className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={foundationForm.approval_required !== undefined ? foundationForm.approval_required === "true" : profile?.approval_required ?? true}
                onChange={(e) => setFoundationForm(p => ({ ...p, approval_required: String(e.target.checked) }))}
                className="rounded border-border" />
              Approval required before completing actions
            </label>
          </div>
          <button onClick={async () => {
            const updates: any = { ...foundationForm };
            if (updates.approval_required !== undefined) updates.approval_required = updates.approval_required === "true";
            await updateProfile(updates);
            setFoundationSaved(true);
            toast({ title: "Foundation saved" });
          }} className="btn-glow text-sm">
            {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Foundation"}
          </button>
        </motion.div>
      )}

      {/* Requests */}
      {tab === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Incoming Requests</h3>
          <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Add New Request</h4>
            {[
              { key: "requester_name", label: "Requester Name", placeholder: "Jane Smith" },
              { key: "request_summary", label: "Request Summary", placeholder: "Follow up with client about invoice" },
              { key: "request_details", label: "Details", placeholder: "Client hasn't responded to last email..." },
            ].map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                <input value={(reqForm as any)[f.key]} onChange={(e) => setReqForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Source</label>
                <select value={reqForm.source} onChange={e => setReqForm(p => ({ ...p, source: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                  {["manual", "email", "phone", "chat", "form"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Urgency</label>
                <select value={reqForm.urgency} onChange={e => setReqForm(p => ({ ...p, urgency: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none">
                  {["low", "medium", "high"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <button onClick={async () => {
              if (!reqForm.request_summary.trim()) { toast({ title: "Please enter a summary" }); return; }
              await addRequest(reqForm);
              setReqForm({ source: "manual", requester_name: "", request_summary: "", request_details: "", urgency: "medium" });
              toast({ title: "Request added" });
            }} className="btn-glow text-sm"><Plus size={14} className="mr-1" /> Add Request</button>
          </div>

          {requests.length > 0 && (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className={`rounded-xl border p-4 transition-all ${r.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" : r.urgency === "high" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{r.request_summary}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      r.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      r.status === "drafted" ? "bg-primary/10 text-primary" :
                      "bg-secondary text-muted-foreground"}`}>{r.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {r.requester_name && <span>{r.requester_name}</span>}
                    <span>{r.source}</span>
                    <span className={r.urgency === "high" ? "text-orange-400" : ""}>{r.urgency} priority</span>
                  </div>
                  {r.status !== "completed" && (
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleGenerateDraft(r)} disabled={generating === r.id}
                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        {generating === r.id ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> AI Generate Draft</>}
                      </button>
                      {r.status !== "approved" && <button onClick={() => updateRequestStatus(r.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Approve</button>}
                      <button onClick={() => updateRequestStatus(r.id, "completed")} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Check size={12} /> Complete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tasks */}
      {tab === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">Tasks</h3>
            <button onClick={async () => {
              const title = prompt("Task title:");
              if (title) await addTask({ title, priority: "medium" });
            }} className="btn-outline-glow text-sm"><Plus size={14} className="mr-1" /> Add Task</button>
          </div>
          {tasks.filter(t => t.status !== "archived").length === 0 && <p className="text-sm text-muted-foreground">No tasks yet. Add a request and generate AI tasks, or create one manually.</p>}
          <div className="space-y-3">
            {tasks.filter(t => t.status !== "archived").map(t => (
              <div key={t.id} className={`rounded-xl border p-4 transition-all ${
                t.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" :
                t.status === "in_progress" ? "border-primary/30 bg-primary/5" :
                t.priority === "high" ? "border-orange-500/30 bg-orange-500/5" :
                "border-border/50 bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{t.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    t.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                    t.status === "in_progress" ? "bg-primary/10 text-primary" :
                    t.status === "awaiting_approval" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-secondary text-muted-foreground"}`}>{t.status.replace("_", " ")}</span>
                </div>
                {t.description && <p className="text-xs text-muted-foreground mb-2">{t.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className={t.priority === "high" ? "text-orange-400" : ""}>{t.priority}</span>
                  {t.due_date && <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                  {t.category !== "general" && <span className="text-primary">{t.category}</span>}
                </div>
                {t.status !== "completed" && t.status !== "archived" && (
                  <div className="flex gap-2 flex-wrap">
                    {t.status !== "in_progress" && <button onClick={() => updateTaskStatus(t.id, "in_progress")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Play size={12} /> Start</button>}
                    {t.status === "in_progress" && <button onClick={() => updateTaskStatus(t.id, "awaiting_approval")} className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20"><Pause size={12} /> Awaiting Approval</button>}
                    <button onClick={() => updateTaskStatus(t.id, "completed")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Complete</button>
                    <button onClick={() => updateTaskStatus(t.id, "archived")} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Archive size={12} /> Archive</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Drafts */}
      {tab === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Drafts</h3>
          {drafts.length === 0 && <p className="text-sm text-muted-foreground">No drafts yet. Generate one from the Requests tab using AI.</p>}
          {drafts.map(d => (
            <div key={d.id} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{d.subject || "Untitled Draft"}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                  d.status === "completed" ? "bg-muted text-muted-foreground" :
                  "bg-primary/10 text-primary"}`}>{d.status}</span>
              </div>
              <div className="text-xs text-muted-foreground">{d.draft_type} · {new Date(d.created_at).toLocaleDateString()}</div>
              {editingDraft === d.id ? (
                <div className="space-y-2">
                  <textarea rows={4} value={editContent} onChange={e => setEditContent(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground resize-none focus:border-primary/50 focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={async () => { await updateDraftContent(d.id, editContent); setEditingDraft(null); toast({ title: "Draft updated" }); }}
                      className="btn-glow text-xs">Save</button>
                    <button onClick={() => setEditingDraft(null)} className="btn-outline-glow text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground whitespace-pre-line">{d.draft_content || "No content"}</div>
              )}
              {d.next_step && <div className="text-xs text-muted-foreground"><strong className="text-foreground">Next step:</strong> {d.next_step}</div>}
              {d.status !== "completed" && editingDraft !== d.id && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => updateDraftStatus(d.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Approve</button>
                  <button onClick={() => { setEditingDraft(d.id); setEditContent(d.draft_content); }} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><PenLine size={12} /> Edit</button>
                  <button onClick={() => updateDraftStatus(d.id, "completed")} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Check size={12} /> Complete</button>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Tools */}
      {tab === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Connect Your Tools</h3>
          <p className="text-sm text-muted-foreground">Link calendars, communication tools, and task systems.</p>
          <div className="space-y-3">
            {toolPlatforms.map(p => {
              const connected = isToolConnected(p.name);
              const conn = getToolConnection(p.name);
              return (
                <div key={p.name} className={`flex items-center justify-between rounded-xl border p-4 transition-all ${connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}><p.icon size={20} /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{connected ? <span className="text-emerald-400">Connected · {conn?.account_name}</span> : "Not connected"}</p>
                    </div>
                  </div>
                  {connected ? (
                    <button onClick={() => disconnectTool(p.name)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Disconnect</button>
                  ) : (
                    <button onClick={() => setConnectModal(p.name)} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Today's Work */}
      {tab === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Today's Work</h3>
          {(() => {
            const active = tasks.filter(t => ["new", "pending", "in_progress", "awaiting_approval"].includes(t.status));
            const openReqs = requests.filter(r => r.status !== "completed");
            return (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Open Requests", value: String(openReqs.length), icon: Inbox, color: "text-primary" },
                    { label: "Active Tasks", value: String(active.length), icon: ListChecks, color: "text-primary" },
                    { label: "Awaiting Approval", value: String(tasks.filter(t => t.status === "awaiting_approval").length), icon: Bell, color: "text-yellow-400" },
                    { label: "Completed", value: String(tasks.filter(t => t.status === "completed").length), icon: Check, color: "text-emerald-400" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                      <s.icon size={18} className={`${s.color} mb-2`} />
                      <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {active.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Priority Items</h4>
                    {active.sort((a, b) => {
                      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
                      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
                    }).slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${t.priority === "high" ? "bg-orange-400" : t.priority === "medium" ? "bg-primary" : "bg-muted-foreground"}`} />
                          <span className="text-sm text-foreground">{t.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{t.status.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>
      )}

      {/* Insights */}
      {tab === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Assistant Insights</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Tasks Created", value: String(tasks.length) },
              { label: "Tasks Completed", value: String(tasks.filter(t => t.status === "completed").length) },
              { label: "Requests Received", value: String(requests.length) },
              { label: "Drafts Created", value: String(drafts.length) },
              { label: "High Priority", value: String(tasks.filter(t => t.priority === "high" && t.status !== "completed").length) },
              { label: "Connected Tools", value: String(connections.filter(c => c.connected).length) },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/50 bg-card p-4">
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Activity */}
      {tab === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
          {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          <div className="space-y-2">
            {activities.map(a => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { connectTool(connectModal, accountName); toast({ title: "Connected", description: `${connectModal} linked.` }); } setConnectModal(null); }} />
    </>
  );
};

export default VirtualAssistantDemo;
