import { useState, useEffect } from "react";
import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import {
  Slack, Send, Hash, Bell, BellOff, Check, Loader2, ChevronDown,
  MessageSquare, Calendar, Mail, Shield, TrendingUp, CreditCard, AlertCircle,
} from "lucide-react";

const notificationToggles = [
  { key: "support_alerts_enabled", label: "Send support alerts to Slack", description: "When a support issue needs human attention", icon: Shield },
  { key: "content_approvals_enabled", label: "Send content approval requests", description: "When social or email content is ready for review", icon: MessageSquare },
  { key: "scheduling_alerts_enabled", label: "Send scheduling reminders", description: "Calendar reminders and booking notifications", icon: Calendar },
  { key: "marketing_updates_enabled", label: "Send marketing campaign updates", description: "Campaign completion and performance alerts", icon: Mail },
  { key: "daily_summary_enabled", label: "Send daily summary", description: "Brief daily recap of what your AI Employees completed", icon: TrendingUp },
  { key: "weekly_summary_enabled", label: "Send weekly summary", description: "Weekly overview of workspace activity", icon: TrendingUp },
  { key: "billing_alerts_enabled", label: "Send billing & account alerts", description: "Subscription changes and account notices", icon: CreditCard },
  { key: "access_alerts_enabled", label: "Send access alerts", description: "Login and security-related notifications", icon: Shield },
] as const;

const SlackSettingsPanel = () => {
  const {
    settings, channels, isConnected, loading, connecting, testingSend, loadingChannels, savingSettings,
    connectSlack, disconnectSlack, sendTestMessage, fetchChannels,
    updateSettings, setDefaultChannel,
  } = useSlackIntegration();

  const [showChannels, setShowChannels] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (isConnected && showChannels && channels.length === 0) {
      fetchChannels();
    }
  }, [isConnected, showChannels]);

  const handleTestMessage = async () => {
    await sendTestMessage();
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center justify-center">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading Slack status...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A154B]/20">
            <Slack size={22} className="text-[#E01E5A]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Enable Slack Notifications</h3>
            <p className="text-xs text-muted-foreground">Send workspace notifications directly to your Slack channels</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect your Slack workspace to receive real-time alerts from your AI Employees — support escalations,
          content approvals, scheduling reminders, daily summaries, and more.
        </p>
        <button
          onClick={connectSlack}
          disabled={connecting}
          className="btn-glow text-sm flex items-center gap-2"
        >
          {connecting ? <><Loader2 size={14} className="animate-spin" /> Connecting...</> : <><Slack size={14} /> Connect Slack</>}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A154B]/20">
              <Slack size={22} className="text-[#E01E5A]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Slack Connected
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  <Check size={10} /> Active
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {settings?.slack_team_name || "Workspace"}
                {settings?.default_channel_name && <span className="ml-1">· Sending to {settings.default_channel_name}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestMessage}
              disabled={testingSend}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {testingSend ? <Loader2 size={12} className="animate-spin" /> : testSuccess ? <Check size={12} className="text-emerald-400" /> : <Send size={12} />}
              {testingSend ? "Sending..." : testSuccess ? "Sent!" : "Test Message"}
            </button>
            <button
              onClick={disconnectSlack}
              disabled={connecting}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-destructive/50 transition-colors disabled:opacity-50"
            >
              {connecting ? "..." : "Disconnect"}
            </button>
          </div>
        </div>
      </div>

      {/* Channel selection */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Choose where VANTORY sends Slack updates</h4>
          </div>
          <button
            onClick={() => { setShowChannels(!showChannels); if (!showChannels) fetchChannels(); }}
            disabled={loadingChannels}
            className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
          >
            {showChannels ? "Hide" : "Change"} <ChevronDown size={12} className={`transition-transform ${showChannels ? "rotate-180" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Current: <span className="text-foreground font-medium">{settings?.default_channel_name || "#general"}</span>
        </p>
        {showChannels && (
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border/50 bg-secondary/30 p-2">
            {loadingChannels ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="ml-2 text-xs text-muted-foreground">Loading channels...</span>
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-3 space-y-1">
                <AlertCircle size={16} className="mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No public channels found. Make sure the bot has access.</p>
              </div>
            ) : (
              channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => { setDefaultChannel(ch.id, `#${ch.name}`); setShowChannels(false); }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-primary/10 transition-colors ${
                    settings?.default_channel_id === ch.id ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Hash size={12} className="text-muted-foreground" />
                    {ch.name}
                  </span>
                  {settings?.default_channel_id === ch.id && <Check size={12} />}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings?.notifications_enabled ? <Bell size={14} className="text-primary" /> : <BellOff size={14} className="text-muted-foreground" />}
            <h4 className="text-sm font-semibold text-foreground">Slack Notifications</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.notifications_enabled ?? true}
              onChange={(e) => updateSettings({ notifications_enabled: e.target.checked })}
              disabled={savingSettings}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </label>
        </div>

        {!settings?.notifications_enabled && (
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            All Slack notifications are paused. Enable to start receiving updates.
          </p>
        )}

        {settings?.notifications_enabled && (
          <div className="space-y-2">
            {notificationToggles.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings as any)?.[key] ?? false}
                    onChange={(e) => updateSettings({ [key]: e.target.checked } as any)}
                    disabled={savingSettings}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last test info */}
      {settings?.last_test_sent_at && (
        <p className="text-[10px] text-muted-foreground text-center">
          Last test sent: {new Date(settings.last_test_sent_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default SlackSettingsPanel;
