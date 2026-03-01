import { useState } from "react";
import { useN8n } from "@/hooks/useN8n";
import {
  Brain, Unplug, PlayCircle, Users, Headphones, FileText, ListChecks,
  ChevronDown, ChevronUp, ArrowRight, Sparkles, BellRing, HelpCircle,
  CheckCircle2, Copy, ExternalLink,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const TEMPLATES = [
  { key: "leads", icon: Users, label: "New Lead Follow-Up", desc: "Start the next step when a new lead comes in", settingKey: "enable_lead_automations" as const },
  { key: "support", icon: Headphones, label: "Support Follow-Up", desc: "Help route and respond to support requests faster", settingKey: "enable_support_automations" as const },
  { key: "forms", icon: FileText, label: "Form Notifications", desc: "Notify the right person when a form is submitted", settingKey: "enable_form_automations" as const },
  { key: "tasks", icon: ListChecks, label: "Task Reminder Trigger", desc: "Start reminders when important tasks need follow-up", settingKey: "enable_task_automations" as const },
];

const SETUP_STEPS = [
  { num: "1", text: "Open n8n and create or open the workflow you want to use" },
  { num: "2", text: "Add a Webhook trigger as the first step in your workflow" },
  { num: "3", text: "Copy the webhook URL that n8n gives you" },
  { num: "4", text: "Paste it into the field below" },
  { num: "5", text: "Click Connect — we'll test it before turning it on" },
];

const N8nSettingsPanel = () => {
  const {
    settings, isConnected, loading, testing,
    connect, disconnect, testWebhook, updateSettings,
  } = useN8n();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Title & subtitle ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Automatic Next Steps</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          When something common happens in your business, VANTABRAIN can help handle the next step automatically.
        </p>
      </div>

      {/* ── Main toggle ── */}
      {isConnected ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-[11px] text-muted-foreground">
                {settings?.total_triggers
                  ? `${settings.total_triggers} next steps handled so far`
                  : "Ready — watching for patterns"}
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
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <p className="text-sm font-medium text-foreground">Not enabled yet</p>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Enable this feature to save time on repeated follow-up.
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced(true)}
            className="btn-glow !px-4 !py-2 text-xs shrink-0"
          >
            Enable
          </button>
        </div>
      )}

      {/* ── How it helps ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">How it helps</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          VANTABRAIN supports the repeatable parts of your workflow. If something common happens often, it triggers the next step so your team spends less time doing the same tasks by hand.
        </p>
        <div className="space-y-2">
          {[
            { num: "1", title: "Something happens often", desc: "Like leads, forms, or support requests." },
            { num: "2", title: "VANTABRAIN recognizes the pattern", desc: "It knows this is the kind of thing your business handles repeatedly." },
            { num: "3", title: "VANTABRAIN helps with the next step", desc: "So your team saves time and misses less." },
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

      {/* ── Choose what to automate (templates) ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">Choose what to automate</p>
        <div className="space-y-2">
          {TEMPLATES.map(({ key, icon: Icon, label, desc, settingKey }) => {
            const checked = isConnected ? (settings?.[settingKey] ?? true) : false;
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  checked ? "border-primary/20 bg-primary/5" : "border-border/30 bg-background/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${checked ? "bg-primary/15" : "bg-muted/50"}`}>
                    <Icon size={14} className={checked ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                  </div>
                </div>
                <Switch
                  checked={checked}
                  disabled={!isConnected}
                  onCheckedChange={(v) => updateSettings({ [settingKey]: v })}
                />
              </div>
            );
          })}
        </div>
        {!isConnected && (
          <p className="text-[11px] text-muted-foreground/50 italic">
            Enable Automatic Next Steps first to activate these options.
          </p>
        )}
      </div>

      {/* ── Benefit line ── */}
      <div className="flex flex-wrap gap-2">
        {["Save time", "Follow up faster", "Miss less", "Reduce repeated work"].map((b) => (
          <span key={b} className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
            {b}
          </span>
        ))}
      </div>

      {/* ── Turn off (connected) ── */}
      {isConnected && (
        <div className="border-t border-border/30 pt-4">
          {showDisconnectConfirm ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Turn off Automatic Next Steps?</span>
              <button onClick={disconnect} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors">
                Yes, turn off
              </button>
              <button onClick={() => setShowDisconnectConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors"
            >
              <Unplug size={12} />
              Turn off
            </button>
          )}
        </div>
      )}

      {/* ── Advanced Admin Setup ── */}
      <div className="border-t border-border/20 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          Advanced Admin Setup
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 rounded-xl border border-border/20 bg-background/40 p-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Technical Connection</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Under the hood, this feature uses an n8n webhook. When a qualifying event occurs, VANTABRAIN sends data to your n8n workflow to run the next steps you've configured.
              </p>
            </div>

            {/* Connection input */}
            {!isConnected && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-foreground">
                    Webhook URL
                  </label>
                  <p className="text-[10px] text-muted-foreground/60">
                    This is the link n8n gives you so VANTORY knows where to send the event.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-n8n.app/webhook/..."
                      className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
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
                  <p className="text-[10px] text-muted-foreground/40">
                    We'll verify the connection before turning it on.
                  </p>
                </div>
              </div>
            )}

            {isConnected && settings?.webhook_url_general && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-foreground">Connected to</label>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/30 px-3 py-2">
                  <p className="flex-1 truncate text-xs text-muted-foreground font-mono">
                    {settings.webhook_url_general}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(settings.webhook_url_general);
                    }}
                    className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            )}

            {/* Need help? */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
            >
              <HelpCircle size={11} />
              {showGuide ? "Hide setup guide" : "Need help setting this up?"}
            </button>

            {showGuide && (
              <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground">How to connect this</p>
                <div className="space-y-2">
                  {SETUP_STEPS.map(({ num, text }) => (
                    <div key={num} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {num}
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">{text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  <strong>Webhook URL</strong> — This is the link n8n gives you so VANTORY knows where to send the event. You'll find it inside your n8n workflow after adding a Webhook trigger.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default N8nSettingsPanel;
