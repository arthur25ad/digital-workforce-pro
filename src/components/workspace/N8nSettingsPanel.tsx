import { useState } from "react";
import { useN8n } from "@/hooks/useN8n";
import {
  Zap, Unplug, PlayCircle, Users, Headphones, FileText, ListChecks,
  ChevronDown, ChevronUp, CheckCircle2, Clock, Bell, ShieldCheck,
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
  const [showSetup, setShowSetup] = useState(false);
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
        {/* Benefit-first explanation */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When a new lead, form submission, or support request comes in, VANTORY can automatically
            trigger the next step for you — so important tasks don't get missed and your team saves time.
          </p>
        </div>

        {/* Key benefits */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: Bell, text: "Get notified faster" },
            { icon: ListChecks, text: "Create follow-up tasks automatically" },
            { icon: Clock, text: "Reduce repetitive admin work" },
            { icon: ShieldCheck, text: "Stop leads from slipping through" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon size={12} className="text-primary shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* Real-life examples */}
        <div className="rounded-xl border border-border/30 bg-secondary/20 p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">What this can do</p>
          <div className="space-y-2">
            {[
              "When someone fills out a form → notify your team automatically",
              "When a new lead comes in → create a follow-up task",
              "When a support request is submitted → trigger the next step",
              "When something important happens → send it where it needs to go",
            ].map((ex) => (
              <div key={ex} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 size={11} className="text-primary mt-0.5 shrink-0" />
                <span>{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection setup — revealed on demand */}
        {!showSetup ? (
          <button
            onClick={() => setShowSetup(true)}
            className="btn-glow !px-5 !py-2.5 text-xs w-full"
          >
            Connect Automation
          </button>
        ) : (
          <div className="space-y-3 rounded-xl border border-border/30 bg-background/60 p-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Your n8n connection link
              </label>
              <p className="text-[11px] text-muted-foreground/60">
                Paste the link from your n8n workflow so VANTORY can trigger automations for you.
              </p>
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
              We'll test the connection before turning it on.
            </p>
          </div>
        )}

        {/* Advanced details toggle */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          {showExamples ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          How does this work technically?
        </button>

        {showExamples && (
          <div className="rounded-xl border border-border/20 bg-background/40 p-4 space-y-2 text-[11px] text-muted-foreground/60">
            <p>
              VANTORY connects to n8n, a workflow automation platform. When an event happens
              (like a new lead or support request), VANTORY sends a webhook to your n8n workflow,
              which then runs whatever steps you've set up — notifications, task creation, data syncing, etc.
            </p>
            <p>
              You'll need an n8n account with a workflow that has a webhook trigger. Paste
              the webhook URL above to connect.
            </p>
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
            <p className="text-sm font-medium text-foreground">Automation Connected</p>
            <p className="text-xs text-muted-foreground">
              {settings?.total_triggers
                ? `${settings.total_triggers} actions triggered so far`
                : "Ready to automate your next steps"}
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
          Automate follow-up when…
        </p>

        <ToggleRow
          icon={Users}
          label="A new lead comes in"
          description="Notify your team and create a follow-up task automatically"
          checked={settings?.enable_lead_automations ?? true}
          onChange={(v) => updateSettings({ enable_lead_automations: v })}
        />
        <ToggleRow
          icon={Headphones}
          label="A support request is submitted"
          description="Alert the right person and start the next step"
          checked={settings?.enable_support_automations ?? true}
          onChange={(v) => updateSettings({ enable_support_automations: v })}
        />
        <ToggleRow
          icon={FileText}
          label="A form is filled out"
          description="Send the info where it needs to go and start follow-up"
          checked={settings?.enable_form_automations ?? true}
          onChange={(v) => updateSettings({ enable_form_automations: v })}
        />
        <ToggleRow
          icon={ListChecks}
          label="A task is completed"
          description="Trigger the next step so nothing gets missed"
          checked={settings?.enable_task_automations ?? true}
          onChange={(v) => updateSettings({ enable_task_automations: v })}
        />
      </div>

      {/* Disconnect */}
      <div className="border-t border-border/30 pt-4">
        {showDisconnectConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Turn off automation?</span>
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
            Disconnect automation
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
