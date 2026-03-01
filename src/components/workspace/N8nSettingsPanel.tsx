import { useState } from "react";
import { useN8n } from "@/hooks/useN8n";
import {
  Zap, Unplug, PlayCircle, Users, Headphones, FileText, ListChecks,
  ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const N8nSettingsPanel = () => {
  const {
    settings, isConnected, loading, testing,
    connect, disconnect, testWebhook, updateSettings,
  } = useN8n();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connecting, setConnecting] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        {/* One simple sentence */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          When a lead, form, or support request comes in, VANTORY can help start the next step automatically.
        </p>

        {/* How it works — 1, 2, 3 */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">How it works</p>
          <div className="space-y-2.5">
            {[
              { num: "1", title: "Connect it", desc: "Add your n8n link below." },
              { num: "2", title: "VANTORY watches for activity", desc: "Like new leads, forms, or support requests." },
              { num: "3", title: "The next step starts automatically", desc: "So your team saves time and misses less." },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                  {num}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick benefit chips */}
        <div className="flex flex-wrap gap-2">
          {["Save time", "Follow up faster", "Miss less", "Reduce repetitive work"].map((b) => (
            <span
              key={b}
              className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary"
            >
              {b}
            </span>
          ))}
        </div>

        {/* Simple examples */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Simple examples</p>
          {[
            "New lead comes in → create a follow-up",
            "Form submitted → notify the team",
            "Support request → start the next step",
          ].map((ex) => (
            <div key={ex} className="flex items-center gap-2 text-xs text-muted-foreground">
              <ArrowRight size={10} className="text-primary shrink-0" />
              <span>{ex}</span>
            </div>
          ))}
        </div>

        {/* Connect area */}
        <div className="space-y-2.5 rounded-xl border border-border/30 bg-secondary/20 p-4">
          <p className="text-xs font-semibold text-foreground">Connect your automation link</p>
          <p className="text-[11px] text-muted-foreground">
            Paste your n8n link here so VANTORY can start automatic follow-up.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n.app/webhook/..."
              className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
            />
            <button
              onClick={async () => {
                setConnecting(true);
                await connect(webhookUrl);
                setConnecting(false);
              }}
              disabled={!webhookUrl.trim() || connecting}
              className="btn-glow !px-4 !py-2 text-xs disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground/50">
            We'll test it before turning it on.
          </p>
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          Advanced setup details
        </button>

        {showAdvanced && (
          <div className="rounded-xl border border-border/20 bg-background/40 p-4 text-[11px] text-muted-foreground/50 space-y-2">
            <p>
              This connects to n8n, a workflow automation platform. When an event happens,
              VANTORY sends a webhook to your n8n workflow, which runs whatever steps you've
              configured — notifications, task creation, data syncing, etc.
            </p>
            <p>
              You'll need an n8n account with a workflow that has a webhook trigger.
              Paste the webhook URL above to connect.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Connected state
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Zap size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Connected</p>
            <p className="text-xs text-muted-foreground">
              {settings?.total_triggers
                ? `${settings.total_triggers} follow-ups triggered`
                : "Ready to go"}
            </p>
          </div>
        </div>
        <button
          onClick={testWebhook}
          disabled={testing}
          className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <PlayCircle size={12} className={testing ? "animate-pulse" : ""} />
          {testing ? "Testing…" : "Test"}
        </button>
      </div>

      <div className="space-y-3 border-t border-border/30 pt-4">
        <p className="text-xs font-semibold text-muted-foreground/60">
          Start follow-up when…
        </p>
        <ToggleRow icon={Users} label="A new lead comes in" checked={settings?.enable_lead_automations ?? true} onChange={(v) => updateSettings({ enable_lead_automations: v })} />
        <ToggleRow icon={Headphones} label="A support request is submitted" checked={settings?.enable_support_automations ?? true} onChange={(v) => updateSettings({ enable_support_automations: v })} />
        <ToggleRow icon={FileText} label="A form is filled out" checked={settings?.enable_form_automations ?? true} onChange={(v) => updateSettings({ enable_form_automations: v })} />
        <ToggleRow icon={ListChecks} label="A task is completed" checked={settings?.enable_task_automations ?? true} onChange={(v) => updateSettings({ enable_task_automations: v })} />
      </div>

      <div className="border-t border-border/30 pt-4">
        {showDisconnectConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Turn off?</span>
            <button onClick={disconnect} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors">Yes, disconnect</button>
            <button onClick={() => setShowDisconnectConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowDisconnectConfirm(true)} className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors">
            <Unplug size={12} />
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

function ToggleRow({ icon: Icon, label, checked, onChange }: { icon: React.ElementType; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-muted-foreground shrink-0" />
        <p className="text-sm text-foreground">{label}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default N8nSettingsPanel;
