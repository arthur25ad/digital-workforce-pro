import { useState, useCallback } from "react";
import { useVantaBrainActions } from "@/hooks/useVantaBrain";
import { useVirtualAssistantData } from "@/hooks/useVirtualAssistantData";
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
  Check, Loader2, Sparkles, Plus, Calendar, FileText, Clock,
  Inbox, ListChecks, PenLine, Bell, Slack, HardDrive, Play, Pause, Archive,
  TrendingUp, Zap, Shield,
} from "lucide-react";

const toolPlatforms = [
  { name: "Gmail", icon: FileText }, { name: "Google Calendar", icon: Calendar },
  { name: "Slack", icon: Slack }, { name: "Website Contact Form", icon: Inbox },
  { name: "Google Drive", icon: HardDrive },
];

const VirtualAssistantDemo = () => {
  const { session } = useAuth();
  const { getContext, recordInteraction } = useVantaBrainActions();
  const {
    profile, tasks, requests, drafts, connections, activities, loading,
    updateProfile, addRequest, updateRequestStatus,
    addTask, updateTaskStatus, addDraft, updateDraftStatus, updateDraftContent,
    connectTool, disconnectTool, isToolConnected, getToolConnection,
    logActivity,
  } = useVirtualAssistantData();

  const [activeTab, setActiveTab] = useState(0);
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [foundationForm, setFoundationForm] = useState<Record<string, string>>({});
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [reqForm, setReqForm] = useState({ source: "manual", requester_name: "", request_summary: "", request_details: "", urgency: "medium" });
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const tabs = [
    { label: "Foundation", icon: <Shield size={14} /> },
    { label: "Requests", icon: <Inbox size={14} /> },
    { label: "Tasks", icon: <ListChecks size={14} /> },
    { label: "Drafts", icon: <FileText size={14} /> },
    { label: "Tools", icon: <Zap size={14} /> },
    { label: "Today", icon: <Calendar size={14} /> },
    { label: "Insights", icon: <TrendingUp size={14} /> },
    { label: "Activity", icon: <Clock size={14} /> },
  ];

  const handleGenerateDraft = async (request: any) => {
    if (!session?.access_token) return;
    setGenerating(request.id);
    try {
      const brainContext = await getContext("virtual-assistant");
      const { data, error } = await supabase.functions.invoke("generate-assistant-draft", { body: { request, profile, brainContext } });
      if (error) throw error;
      if (data?.draft) {
        const d = data.draft;
        await addDraft({ request_id: request.id, draft_type: d.draftType || "response", subject: d.requestSummary || request.request_summary, draft_content: d.draftResponse || "", next_step: d.nextStep || "" });
        if (d.recommendedAction) await addTask({ title: d.recommendedAction, priority: d.suggestedPriority || "medium", category: "ai-generated", description: d.nextStep || "" });
        await updateRequestStatus(request.id, "drafted");
        toast({ title: "AI generated draft & task" });
      }
    } catch (e: any) { toast({ title: "Generation failed", description: e.message, variant: "destructive" }); }
    finally { setGenerating(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const urgencyStyle: Record<string, string> = { high: "text-orange-400", medium: "text-foreground", low: "text-muted-foreground" };
  const activeTasks = tasks.filter(t => ["new", "pending", "in_progress", "awaiting_approval"].includes(t.status));
  const openRequests = requests.filter(r => r.status !== "completed");

  return (
    <>
      <WorkspaceShell tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Foundation */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <FormFieldGroup title="Business Context" description="Help your AI understand how your business operates" icon={<Shield size={16} />}
              fields={[
                { key: "business_overview", label: "Business Overview", type: "textarea" as const },
                { key: "main_responsibilities", label: "Main Responsibilities", type: "textarea" as const },
              ]}
              values={Object.fromEntries(["business_overview", "main_responsibilities"].map(k => [k, foundationForm[k] ?? (profile as any)?.[k] ?? ""]))}
              onChange={(k, v) => { setFoundationForm(p => ({...p, [k]: v})); setFoundationSaved(false); }} />
            <FormFieldGroup title="Communication & Priorities" description="Set preferences for how the AI works" icon={<Zap size={16} />}
              fields={[
                { key: "preferred_tone", label: "Preferred Tone" },
                { key: "priority_rules", label: "Priority Rules" },
                { key: "recurring_tasks", label: "Recurring Tasks" },
                { key: "communication_preferences", label: "Communication Preferences" },
              ]}
              values={Object.fromEntries(["preferred_tone", "priority_rules", "recurring_tasks", "communication_preferences"].map(k => [k, foundationForm[k] ?? (profile as any)?.[k] ?? ""]))}
              onChange={(k, v) => { setFoundationForm(p => ({...p, [k]: v})); setFoundationSaved(false); }} />
            <FormFieldGroup title="Additional Notes" icon={<FileText size={16} />}
              fields={[{ key: "important_notes", label: "Important Notes", type: "textarea" as const }]}
              values={{ important_notes: foundationForm["important_notes"] ?? profile?.important_notes ?? "" }}
              onChange={(k, v) => { setFoundationForm(p => ({...p, [k]: v})); setFoundationSaved(false); }} />
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={foundationForm.approval_required !== undefined ? foundationForm.approval_required === "true" : profile?.approval_required ?? true}
                  onChange={e => setFoundationForm(p => ({...p, approval_required: String(e.target.checked)}))}
                  className="rounded border-border accent-primary" />
                Approval required before completing actions
              </label>
            </div>
            <button onClick={async () => {
              const updates: any = {...foundationForm};
              if (updates.approval_required !== undefined) updates.approval_required = updates.approval_required === "true";
              await updateProfile(updates); setFoundationSaved(true); toast({ title: "Foundation saved" });
            }} className="btn-glow text-sm">
              {foundationSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save Foundation"}
            </button>
          </div>
        )}

        {/* Requests */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <WorkspaceSection title="Incoming Requests" description="Add requests and let AI generate drafts & tasks.">
              <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Add New Request</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[{ key: "requester_name", label: "Requester Name", placeholder: "Jane Smith" }, { key: "request_summary", label: "Request Summary", placeholder: "Follow up with client" }].map(f => (
                    <div key={f.key}><label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label}</label><input value={(reqForm as any)[f.key]} onChange={e => setReqForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors" /></div>
                  ))}
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Source</label><select value={reqForm.source} onChange={e => setReqForm(p => ({...p, source: e.target.value}))} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none">{["manual","email","phone","chat","form"].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Urgency</label><select value={reqForm.urgency} onChange={e => setReqForm(p => ({...p, urgency: e.target.value}))} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none">{["low","medium","high"].map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                </div>
                <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">Details</label><textarea value={reqForm.request_details} onChange={e => setReqForm(p => ({...p, request_details: e.target.value}))} rows={2} placeholder="Additional context..." className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none transition-colors" /></div>
                <button onClick={async () => { if (!reqForm.request_summary.trim()) { toast({ title: "Please enter a summary" }); return; } await addRequest(reqForm); setReqForm({ source: "manual", requester_name: "", request_summary: "", request_details: "", urgency: "medium" }); toast({ title: "Request added" }); }} className="btn-glow text-sm"><Plus size={14} className="mr-1" /> Add Request</button>
              </div>
            </WorkspaceSection>

            {requests.length > 0 && (
              <div className="space-y-3">
                {requests.map(r => (
                  <div key={r.id} className={`rounded-xl border p-4 transition-all ${r.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" : r.urgency === "high" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{r.request_summary}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : r.status === "drafted" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{r.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {r.requester_name && <span>{r.requester_name}</span>}<span>{r.source}</span>
                      <span className={urgencyStyle[r.urgency] || ""}>{r.urgency} priority</span>
                    </div>
                    {r.status !== "completed" && (
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleGenerateDraft(r)} disabled={generating === r.id} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">{generating === r.id ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> AI Generate Draft</>}</button>
                        {r.status !== "approved" && <button onClick={() => updateRequestStatus(r.id, "approved")} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Approve</button>}
                        <button onClick={() => updateRequestStatus(r.id, "completed")} className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Check size={12} /> Complete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks */}
        {activeTab === 2 && (
          <WorkspaceSection title="Tasks" description="Manage your work items."
            action={<button onClick={async () => { const title = prompt("Task title:"); if (title) await addTask({ title, priority: "medium" }); }} className="btn-outline-glow text-sm"><Plus size={14} className="mr-1" /> Add Task</button>}>
            {tasks.filter(t => t.status !== "archived").length === 0 ? <EmptyState icon={<ListChecks size={20} />} message="No tasks yet. Add a request and generate AI tasks, or create one manually." /> : (
              <div className="space-y-3">
                {tasks.filter(t => t.status !== "archived").map(t => (
                  <div key={t.id} className={`rounded-xl border p-4 transition-all ${t.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" : t.status === "in_progress" ? "border-primary/30 bg-primary/5" : t.priority === "high" ? "border-orange-500/30 bg-orange-500/5" : "border-border/50 bg-card"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{t.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : t.status === "in_progress" ? "bg-primary/10 text-primary" : t.status === "awaiting_approval" ? "bg-yellow-500/10 text-yellow-400" : "bg-secondary text-muted-foreground"}`}>{t.status.replace("_"," ")}</span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mb-2">{t.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className={t.priority === "high" ? "text-orange-400" : ""}>{t.priority}</span>
                      {t.due_date && <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>}
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
            )}
          </WorkspaceSection>
        )}

        {/* Drafts */}
        {activeTab === 3 && (
          <WorkspaceSection title="Drafts" description="Review and manage AI-generated responses.">
            {drafts.length === 0 ? <EmptyState icon={<FileText size={20} />} message="No drafts yet. Generate one from the Requests tab using AI." /> : (
              <div className="space-y-4">
                {drafts.map(d => (
                  <div key={d.id} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{d.subject || "Untitled Draft"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${d.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : d.status === "completed" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{d.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{d.draft_type} · {new Date(d.created_at).toLocaleDateString()}</div>
                    {editingDraft === d.id ? (
                      <div className="space-y-2"><textarea rows={4} value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground resize-none focus:border-primary/50 focus:outline-none" /><div className="flex gap-2"><button onClick={async () => { await updateDraftContent(d.id, editContent); setEditingDraft(null); toast({ title: "Draft updated" }); }} className="btn-glow text-xs">Save</button><button onClick={() => setEditingDraft(null)} className="btn-outline-glow text-xs">Cancel</button></div></div>
                    ) : (
                      <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground whitespace-pre-line">{d.draft_content || "No content"}</div>
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
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Tools */}
        {activeTab === 4 && (
          <WorkspaceSection title="Connected Tools" description="Link calendars, communication tools, and task systems.">
            <div className="space-y-3">{toolPlatforms.map(p => { const conn = getToolConnection(p.name); return <ConnectionCard key={p.name} name={p.name} icon={<p.icon size={20} />} connected={isToolConnected(p.name)} accountName={conn?.account_name} connectedAt={conn?.connected_at} onConnect={() => setConnectModal(p.name)} onDisconnect={() => disconnectTool(p.name)} />; })}</div>
          </WorkspaceSection>
        )}

        {/* Today */}
        {activeTab === 5 && (
          <WorkspaceSection title="Today's Work" description="Your daily overview at a glance.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Open Requests" value={openRequests.length} icon={<Inbox size={18} />} />
              <StatCard label="Active Tasks" value={activeTasks.length} icon={<ListChecks size={18} />} />
              <StatCard label="Awaiting Approval" value={tasks.filter(t => t.status === "awaiting_approval").length} icon={<Bell size={18} />} accent="text-yellow-400" />
              <StatCard label="Completed" value={tasks.filter(t => t.status === "completed").length} icon={<Check size={18} />} accent="text-emerald-400" />
            </div>
            {activeTasks.length > 0 && (
              <div className="mt-5 rounded-xl border border-border/50 bg-card p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">Priority Items</h4>
                <div className="space-y-2">
                  {activeTasks.sort((a, b) => { const order: Record<string, number> = { high: 0, medium: 1, low: 2 }; return (order[a.priority] ?? 1) - (order[b.priority] ?? 1); }).slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5">
                      <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${t.priority === "high" ? "bg-orange-400" : t.priority === "medium" ? "bg-primary" : "bg-muted-foreground"}`} /><span className="text-sm text-foreground">{t.title}</span></div>
                      <span className="text-xs text-muted-foreground">{t.status.replace("_"," ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </WorkspaceSection>
        )}

        {/* Insights */}
        {activeTab === 6 && (
          <WorkspaceSection title="Assistant Insights" description="Track your productivity.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Tasks Created" value={tasks.length} icon={<ListChecks size={18} />} />
              <StatCard label="Tasks Completed" value={tasks.filter(t => t.status === "completed").length} icon={<Check size={18} />} accent="text-emerald-400" />
              <StatCard label="Requests Received" value={requests.length} icon={<Inbox size={18} />} />
              <StatCard label="Drafts Created" value={drafts.length} icon={<FileText size={18} />} />
              <StatCard label="High Priority" value={tasks.filter(t => t.priority === "high" && t.status !== "completed").length} icon={<Bell size={18} />} accent="text-orange-400" />
              <StatCard label="Connected Tools" value={connections.filter(c => c.connected).length} icon={<Zap size={18} />} />
            </div>
          </WorkspaceSection>
        )}

        {/* Activity */}
        {activeTab === 7 && (
          <WorkspaceSection title="Recent Activity" description="Your assistant history.">
            <ActivityFeed activities={activities} emptyMessage="No activity yet." />
          </WorkspaceSection>
        )}
      </WorkspaceShell>

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { connectTool(connectModal, accountName); toast({ title: "Connected", description: `${connectModal} linked.` }); } setConnectModal(null); }} />
    </>
  );
};

export default VirtualAssistantDemo;
