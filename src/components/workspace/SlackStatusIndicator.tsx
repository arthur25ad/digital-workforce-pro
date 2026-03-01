import { useSlackIntegration } from "@/hooks/useSlackIntegration";
import { Slack, Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SlackStatusIndicatorProps {
  context?: string;
}

const SlackStatusIndicator = ({ context }: SlackStatusIndicatorProps) => {
  const { isConnected, settings, loading } = useSlackIntegration();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A154B]/20">
          <Slack size={16} className={isConnected ? "text-[#E01E5A]" : "text-muted-foreground"} />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            {isConnected ? (
              <>
                Slack connected
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                  <Check size={8} /> Active
                </span>
              </>
            ) : (
              "Slack not connected"
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isConnected
              ? context || `Sending to ${settings?.default_channel_name || "#general"}`
              : "Connect in Dashboard to enable notifications"}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        {isConnected ? "Manage" : "Set up"} <ArrowRight size={10} />
      </button>
    </div>
  );
};

export default SlackStatusIndicator;
