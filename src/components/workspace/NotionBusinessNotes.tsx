import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Check, ChevronDown, ExternalLink, FileText, Loader2, MessageSquare, RefreshCw, Shield, Sparkles, Star, Unplug, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotionIntegration } from "@/hooks/useNotionIntegration";

const PURPLE = "hsl(280 70% 65%)";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

interface NotionBusinessNotesProps {
  workspaceId: string | null;
}

const NotionBusinessNotes = ({ workspaceId }: NotionBusinessNotesProps) => {
  const { connection, pages, loading, syncing, connecting, startConnect, syncPages, disconnect } = useNotionIntegration(workspaceId);
  const [showExamples, setShowExamples] = useState(false);
  const [showPages, setShowPages] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ── Connected state ── */
  if (connection) {
    return (
      <div className="space-y-4">
        {/* Status header */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <Check size={16} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Business notes connected
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {connection.notion_workspace_name ? (
                <>From <span className="text-foreground/80">{connection.notion_workspace_name}</span> · </>
              ) : null}
              {pages.length} {pages.length === 1 ? "note" : "notes"} synced
              {connection.last_synced_at && (
                <> · Last updated {new Date(connection.last_synced_at).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>

        {/* Quick benefit strip */}
        <div className="flex flex-wrap gap-2">
          {["Better answers", "More accurate info", "On-brand replies"].map((b) => (
            <span key={b} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
              <Check size={9} /> {b}
            </span>
          ))}
        </div>

        {/* Synced pages — collapsible */}
        {pages.length > 0 && (
          <div>
            <button
              onClick={() => setShowPages(!showPages)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown size={11} className={`transition-transform ${showPages ? "rotate-180" : ""}`} />
              View synced notes ({pages.length})
            </button>
            {showPages && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center gap-2 rounded-lg border border-border/20 bg-background/50 px-3 py-2">
                    <FileText size={11} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{page.title || "Untitled"}</span>
                    {page.page_url && (
                      <a href={page.page_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-foreground shrink-0">
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={syncPages}
            disabled={syncing}
            className="text-[11px] gap-1.5"
          >
            {syncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            Sync latest notes
          </Button>
          {!confirmDisconnect ? (
            <button
              onClick={() => setConfirmDisconnect(true)}
              className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { disconnect(); setConfirmDisconnect(false); }}
                className="text-[10px] text-destructive hover:text-destructive/80 transition-colors"
              >
                Confirm disconnect
              </button>
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Not connected state ── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/30" style={{ background: "hsl(280 70% 65% / 0.08)" }}>
          <BookOpen size={18} style={{ color: PURPLE }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Connect your business notes</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
            Connect Notion so VANTABRAIN can learn your business information and give smarter, more accurate help.
          </p>
        </div>
      </div>

      {/* Quick benefits */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Sparkles, text: "Better answers" },
          { icon: Shield, text: "More accurate business info" },
          { icon: Star, text: "More on-brand responses" },
          { icon: Zap, text: "Less generic AI" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2 rounded-lg border border-border/20 bg-background/50 px-3 py-2">
            <b.icon size={12} style={{ color: PURPLE }} className="shrink-0" />
            <span className="text-[11px] text-foreground/80">{b.text}</span>
          </div>
        ))}
      </div>

      {/* What this helps with */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">What this helps with</p>
        <div className="flex flex-wrap gap-1.5">
          {["Your services", "Your policies", "Your FAQs", "Team notes", "Business instructions"].map((item) => (
            <span key={item} className="rounded-full border border-border/20 bg-card px-2.5 py-1 text-[10px] text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Examples — collapsible */}
      <div>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={11} className={`transition-transform ${showExamples ? "rotate-180" : ""}`} />
          See examples
        </button>
        {showExamples && (
          <div className="mt-2 space-y-1.5">
            {[
              "Answer common questions more accurately using your FAQ notes",
              "Give more accurate replies using your service details",
              "Stay consistent with your brand voice using your team guides",
              "Use your real business info instead of generic guesses",
            ].map((ex) => (
              <div key={ex} className="flex items-start gap-2 text-[11px] text-muted-foreground/80">
                <MessageSquare size={10} className="mt-0.5 shrink-0" style={{ color: PURPLE }} />
                <span>{ex}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Button
          onClick={startConnect}
          disabled={connecting}
          className="w-full gap-2 text-sm font-semibold"
          style={{ background: PURPLE }}
        >
          {connecting ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
          Connect Notion
        </Button>

        {/* 3-step summary */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
          <span className="flex items-center gap-1"><span className="font-semibold text-muted-foreground">1.</span> Connect</span>
          <span className="h-px w-4 bg-border/30" />
          <span className="flex items-center gap-1"><span className="font-semibold text-muted-foreground">2.</span> Approve access</span>
          <span className="h-px w-4 bg-border/30" />
          <span className="flex items-center gap-1"><span className="font-semibold text-muted-foreground">3.</span> VANTABRAIN learns</span>
        </div>
      </div>
    </div>
  );
};

export default NotionBusinessNotes;
