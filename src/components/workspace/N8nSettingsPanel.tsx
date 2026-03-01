import { useState, useRef } from "react";
import { useN8n } from "@/hooks/useN8n";
import {
  Brain, Unplug, PlayCircle, Users, Headphones, FileText, ListChecks,
  ChevronDown, ChevronUp, Sparkles,
  CheckCircle2, Copy, HelpCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const TEMPLATES = [
  { key: "leads", icon: Users, label: "New Lead Follow-Up", desc: "Trigger next step on new leads", settingKey: "enable_lead_automations" as const },
  { key: "support", icon: Headphones, label: "Support Follow-Up", desc: "Route and respond faster", settingKey: "enable_support_automations" as const },
  { key: "forms", icon: FileText, label: "Form Notifications", desc: "Notify on form submissions", settingKey: "enable_form_automations" as const },
  { key: "tasks", icon: ListChecks, label: "Task Reminders", desc: "Remind on important tasks", settingKey: "enable_task_automations" as const },
];

const N8nSettingsPanel = () => {
  const { settings, isConnected, loading, testing, connect, disconnect, testWebhook, updateSettings } = useN8n();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  if (loading) return <div className="animate-pulse h-4 w-48 rounded bg-muted" />;

  const visibleTemplates = showAllTemplates ? TEMPLATES : TEMPLATES.slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-primary" />
        <h3 className="font-display text-xs font-semibold text-foreground">Automatic Next Steps</h3>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        VANTABRAIN handles the next step automatically when common events happen in your business.
      </p>

      {/* Status */}
      {isConnected ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-xs font-medium text-foreground">Active</span>
            {settings?.total_triggers ? (
              <span className="text-[10px] text-muted-foreground">· {settings.total_triggers} handled</span>
            ) : null}
          </div>
          <button onClick={testWebhook} disabled={testing}
            className="flex items-center gap-1 rounded-md border border-border/40 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground">
            <PlayCircle size={10} className={testing ? "animate-pulse" : ""} />
            {testing ? "Testing…" : "Test"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/20 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Not enabled</span>
          </div>
          <button onClick={() => { setShowAdvanced(true); setTimeout(() => advancedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
            className="btn-glow !px-3 !py-1.5 text-[10px] shrink-0">Enable</button>
        </div>
      )}

      {/* Templates — show 2 by default */}
      <div className="space-y-1.5">
        {visibleTemplates.map(({ key, icon: Icon, label, desc, settingKey }) => {
          const checked = isConnected ? (settings?.[settingKey] ?? true) : false;
          return (
            <div key={key} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${checked ? "border-primary/20 bg-primary/5" : "border-border/30"}`}>
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={12} className={checked ? "text-primary" : "text-muted-foreground"} />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
                </div>
              </div>
              <Switch checked={checked} disabled={!isConnected} onCheckedChange={(v) => updateSettings({ [settingKey]: v })} />
            </div>
          );
        })}
        {!showAllTemplates && (
          <button onClick={() => setShowAllTemplates(true)} className="text-[10px] text-primary hover:underline">
            + {TEMPLATES.length - 2} more options
          </button>
        )}
      </div>

      {/* Disconnect */}
      {isConnected && (
        <div className="pt-2 border-t border-border/20">
          {showDisconnectConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Turn off?</span>
              <button onClick={disconnect} className="text-[10px] text-destructive hover:underline">Yes</button>
              <button onClick={() => setShowDisconnectConfirm(false)} className="text-[10px] text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowDisconnectConfirm(true)} className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-destructive">
              <Unplug size={10} /> Turn off
            </button>
          )}
        </div>
      )}

      {/* Advanced setup */}
      <div ref={advancedRef} className="border-t border-border/20 pt-3">
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground">
          {showAdvanced ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          Advanced setup
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-3 rounded-lg border border-border/20 bg-background/40 p-3">
            <p className="text-[10px] text-muted-foreground">Uses an n8n webhook to trigger automated workflows.</p>
            {!isConnected && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-foreground">Webhook URL</label>
                <div className="flex gap-2">
                  <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n.app/webhook/..."
                    className="flex-1 rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40" />
                  <button onClick={async () => { setConnecting(true); await connect(webhookUrl); setConnecting(false); }}
                    disabled={!webhookUrl.trim() || connecting} className="btn-glow !px-3 !py-1.5 text-[10px] disabled:opacity-50">
                    {connecting ? "…" : "Connect"}
                  </button>
                </div>
              </div>
            )}
            {isConnected && settings?.webhook_url_general && (
              <div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/30 px-2.5 py-1.5">
                <p className="flex-1 truncate text-[10px] text-muted-foreground font-mono">{settings.webhook_url_general}</p>
                <button onClick={() => navigator.clipboard.writeText(settings.webhook_url_general)} className="text-muted-foreground/50 hover:text-foreground">
                  <Copy size={10} />
                </button>
              </div>
            )}
            <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary">
              <HelpCircle size={10} /> {showGuide ? "Hide guide" : "Setup help"}
            </button>
            {showGuide && (
              <div className="rounded-md border border-primary/10 bg-primary/5 p-3 space-y-1.5">
                {["Open n8n and create a workflow", "Add a Webhook trigger", "Copy the webhook URL", "Paste it above and Connect"].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">{i + 1}</span>
                    <p className="text-[10px] text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default N8nSettingsPanel;
