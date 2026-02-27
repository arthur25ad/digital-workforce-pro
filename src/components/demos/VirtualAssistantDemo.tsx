import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/AppContext";
import ConnectPlatformModal from "@/components/ConnectPlatformModal";
import { generateDailySummary, generateSuggestedTask } from "@/lib/ai-generators";
import { toast } from "@/hooks/use-toast";
import {
  Check, Play, Pause, BarChart3, Clock, Bell, Calendar, FileText,
  Slack, HardDrive, Loader2, Sparkles, Plus,
} from "lucide-react";

const productivityPlatforms = [
  { name: "Google Calendar", icon: Calendar },
  { name: "Outlook Calendar", icon: Calendar },
  { name: "Notion", icon: FileText },
  { name: "Slack", icon: Slack },
  { name: "Google Drive", icon: HardDrive },
];

const VirtualAssistantDemo = () => {
  const { state, isConnected, addConnection, removeConnection, updateTaskStatus, setAssistantExpectations, addTask, setDailySummary } = useAppState();
  const [connectModal, setConnectModal] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0);
  const [foundation, setFoundation] = useState({ context: "", role: "", priorities: "", workStyle: "Structured and proactive", mattersmost: "" });
  const [foundationSaved, setFoundationSaved] = useState(false);
  const [expectationsSaved, setExpectationsSaved] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingTask, setGeneratingTask] = useState(false);

  const tabs = ["Foundation", "Tools", "Expectations", "Control", "Operations"];

  const handleGenerateSummary = () => {
    setGeneratingSummary(true);
    setTimeout(() => {
      const summary = generateDailySummary(state.tasks);
      setDailySummary(summary);
      setGeneratingSummary(false);
      toast({ title: "Summary generated" });
    }, 1200);
  };

  const handleSuggestTask = () => {
    setGeneratingTask(true);
    setTimeout(() => {
      const task = generateSuggestedTask(state.businessType);
      addTask(task);
      setGeneratingTask(false);
      toast({ title: "Task added", description: task.title });
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 1: Set the Foundation</h3>
          <p className="text-sm text-muted-foreground">Tell your AI assistant about your work so it can anticipate needs.</p>
          {[
            { key: "context", label: "Business Context" },
            { key: "role", label: "Your Role / Responsibilities" },
            { key: "priorities", label: "Top Priorities" },
            { key: "workStyle", label: "Work Style" },
            { key: "mattersmost", label: "What Matters Most" },
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 2: Connect Your Tools</h3>
          <p className="text-sm text-muted-foreground">Link calendars, task managers, and communication tools.</p>
          <div className="space-y-3">
            {productivityPlatforms.map((p) => {
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
          <h3 className="font-display text-lg font-semibold text-foreground">Step 3: Set Expectations</h3>
          <p className="text-sm text-muted-foreground">Define how your AI assistant should operate.</p>
          {[
            { key: "taskTypes", label: "Task Types", placeholder: "Admin, Scheduling, Follow-ups" },
            { key: "responseStyle", label: "Response Style", placeholder: "Concise and action-oriented" },
            { key: "urgencyLevels", label: "Urgency Levels", placeholder: "High, Medium, Low" },
            { key: "reminderFrequency", label: "Reminder Frequency", placeholder: "Morning summary + as-needed" },
            { key: "approvalNeeded", label: "What Needs Your Approval", placeholder: "Client-facing outputs" },
            { key: "desiredOutcomes", label: "Desired Outcomes", placeholder: "Organized inbox, on-time follow-ups" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
              <input value={state.assistantExpectations[key as keyof typeof state.assistantExpectations]} onChange={(e) => { setAssistantExpectations({ [key]: e.target.value }); setExpectationsSaved(false); }}
                placeholder={placeholder} className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none" />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setDemoStep(1)} className="btn-outline-glow text-sm">Back</button>
            <button onClick={() => { setExpectationsSaved(true); toast({ title: "Expectations saved" }); setTimeout(() => setDemoStep(3), 500); }} className="btn-glow text-sm">
              {expectationsSaved ? <span className="flex items-center gap-1"><Check size={14} /> Saved</span> : "Save & Continue"}
            </button>
          </div>
        </motion.div>
      )}

      {demoStep === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 4: You Control, AI Assists</h3>
          <p className="text-sm text-muted-foreground">Manage tasks. Approve, hold, or complete items.</p>
          <div className="space-y-3">
            {state.tasks.map((task) => (
              <div key={task.id} className={`rounded-xl border p-4 transition-all ${
                task.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" : task.status === "on-hold" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border/50 bg-card"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{task.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    task.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : task.status === "on-hold" ? "bg-yellow-500/10 text-yellow-400" : task.status === "in-progress" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>{task.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>Due: {task.dueDate}</span>
                  <span className="flex items-center gap-1">{task.autoRun ? <><Play size={10} className="text-emerald-400" /> Auto-run</> : <><Pause size={10} /> Manual</>}</span>
                  {task.needsReview && <span className="text-primary">Needs review</span>}
                </div>
                {task.status !== "completed" && (
                  <div className="flex gap-2">
                    <button onClick={() => { updateTaskStatus(task.id, "completed"); toast({ title: "Task completed" }); }} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20"><Check size={12} /> Complete</button>
                    {task.status !== "on-hold" && <button onClick={() => updateTaskStatus(task.id, "on-hold")} className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20"><Pause size={12} /> Hold</button>}
                    {task.status === "on-hold" && <button onClick={() => updateTaskStatus(task.id, "pending")} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"><Play size={12} /> Resume</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3"><button onClick={() => setDemoStep(2)} className="btn-outline-glow text-sm">Back</button><button onClick={() => setDemoStep(4)} className="btn-glow text-sm">View Operations</button></div>
        </motion.div>
      )}

      {demoStep === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Step 5: Keep Work Moving</h3>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerateSummary} disabled={generatingSummary} className="btn-glow text-sm flex items-center gap-2">
              {generatingSummary ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> Generate Daily Summary</>}
            </button>
            <button onClick={handleSuggestTask} disabled={generatingTask} className="btn-outline-glow text-sm flex items-center gap-2">
              {generatingTask ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : <><Plus size={14} /> Suggest a Task</>}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tasks Pending", value: String(state.tasks.filter(t => t.status === "pending").length), icon: FileText },
              { label: "Completed", value: String(state.tasks.filter(t => t.status === "completed").length), icon: Check },
              { label: "Needs Review", value: String(state.tasks.filter(t => t.needsReview && t.status !== "completed").length), icon: Bell },
              { label: "In Progress", value: String(state.tasks.filter(t => t.status === "in-progress").length), icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
                <stat.icon size={18} className="text-primary mb-2" /><p className="font-display text-2xl font-bold text-foreground">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {state.dailySummary && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Daily Summary</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-line">{state.dailySummary}</div>
            </div>
          )}

          <button onClick={() => setDemoStep(0)} className="btn-outline-glow text-sm">Back to Foundation</button>
        </motion.div>
      )}

      <ConnectPlatformModal open={!!connectModal} onClose={() => setConnectModal(null)} platformName={connectModal || ""}
        onConnect={(accountName) => { if (connectModal) { addConnection({ platform: connectModal, accountName, connectedAt: new Date().toISOString() }); toast({ title: "Connected", description: `${connectModal} linked.` }); } setConnectModal(null); }} />
    </>
  );
};

export default VirtualAssistantDemo;
