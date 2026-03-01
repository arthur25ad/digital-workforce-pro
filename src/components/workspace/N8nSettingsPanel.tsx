import { useState } from "react";
import { useN8n } from "@/hooks/useN8n";
import {
  Zap, Unplug, PlayCircle, Users, Headphones, FileText, ListChecks,
  ChevronDown, ChevronUp, Lightbulb,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const N8nSettingsPanel = () => {
  const {
    settings, isConnected, loading, testing,
    connect, disconnect, testWebhook, updateSettings,
  } = useN8n();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
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
      <div className="space-y-5">
        {/* What this does */}
        <div className="rounded-xl border border-border/30 bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-400" />
            <span className="text-sm font-semibold text-foreground">The brain behind your workflows</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            n8n helps your systems know what to do next when something happens. It can trigger actions,
            move information, and reduce repetitive follow-up work behind the scenes.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              "Automatic follow-up",
              "Task handoffs",
              "Alerts & notifications",
              "Reduce admin steps",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Zap size={10} className="text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Connect */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap size={16} className="text-primary" />
            <span>Paste your automation webhook URL to connect.</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-instance.app.n8n.cloud/webhook/..."
              className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
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
          <p className="text-[11px] text-muted-foreground/60">
            We'll send a test event to verify the connection works before activating.
          </p>
        </div>

        {/* Examples */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          {showExamples ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          See how it helps your business
        </button>

        {showExamples && (
          <div className="space-y-2.5 rounded-xl border border-border/20 bg-background/40 p-4">
            {[
              { event: "New lead comes in", action: "Notify the team, create a task, start follow-up" },
              { event: "Support request happens", action: "Alert the right person, trigger a workflow" },
              { event: "Form submitted", action: "Move info where it needs to go, start next steps" },
              { event: "Key action in VANTORY", action: "Launch an automation, notify or hand off" },
            ].map((ex) => (
              <div key={ex.event} className="flex items-start gap-2 text-xs">
                <span className="text-primary mt-0.5">→</span>
                <div>
                  <span className="font-medium text-foreground">{ex.event}</span>
                  <span className="text-muted-foreground"> — {ex.action}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Connected state
  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Zap size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Automation Engine</p>
            <p className="text-xs text-muted-foreground">
              {settings?.total_triggers
                ? `${settings.total_triggers} automations triggered`
                : "Ready to automate"}
              {settings?.last_triggered_at && (
                <span className="ml-1">· Last: {new Date(settings.last_triggered_at).toLocaleDateString()}</span>
              )}
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

      {/* Automation Toggles */}
      <div className="space-y-3 border-t border-border/30 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Trigger automations when…
        </p>

        <ToggleRow
          icon={Users}
          label="A new lead comes in"
          description="Notify your team and start follow-up automatically"
          checked={settings?.enable_lead_automations ?? true}
          onChange={(v) => updateSettings({ enable_lead_automations: v })}
        />
        <ToggleRow
          icon={Headphones}
          label="A support event happens"
          description="Alert the right person and trigger support workflows"
          checked={settings?.enable_support_automations ?? true}
          onChange={(v) => updateSettings({ enable_support_automations: v })}
        />
        <ToggleRow
          icon={FileText}
          label="A form is submitted"
          description="Move information and start the next action"
          checked={settings?.enable_form_automations ?? true}
          onChange={(v) => updateSettings({ enable_form_automations: v })}
        />
        <ToggleRow
          icon={ListChecks}
          label="A task is completed"
          description="Launch follow-up workflows and hand off next steps"
          checked={settings?.enable_task_automations ?? true}
          onChange={(v) => updateSettings({ enable_task_automations: v })}
        />
      </div>

      {/* Disconnect */}
      <div className="border-t border-border/30 pt-4">
        {showDisconnectConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Disconnect automations?</span>
            <button
              onClick={disconnect}
              className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors"
            >
              Yes, disconnect
            </button>
            <button
              onClick={() => setShowDisconnectConfirm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <Unplug size={12} />
            Disconnect automation engine
          </button>
        )}
      </div>
    </div>
  );
};

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground/60">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default N8nSettingsPanel;
