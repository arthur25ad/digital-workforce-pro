import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Check, X, PenLine, ThumbsDown, Sparkles, Loader2 } from "lucide-react";
import { BrainSuggestion } from "@/hooks/useVantaBrain";
import { toast } from "@/hooks/use-toast";

interface SmartSuggestionsProps {
  suggestions: BrainSuggestion[];
  loading: boolean;
  onFeedback: (
    suggestionId: string,
    feedback: "accepted" | "rejected" | "edited" | "not_preferred",
    patternType: string,
    editedValue?: string,
  ) => Promise<void>;
  onAcceptAction?: (suggestion: BrainSuggestion) => void;
}

const categoryColors: Record<string, string> = {
  timing: "hsl(280 70% 65%)",
  style: "hsl(280 70% 65%)",
  platform: "hsl(217 91% 60%)",
  workflow: "hsl(142 71% 45%)",
  tone: "hsl(280 70% 65%)",
  content: "hsl(217 91% 60%)",
  priority: "hsl(38 92% 50%)",
};

const SmartSuggestions = ({ suggestions, loading, onFeedback, onAcceptAction }: SmartSuggestionsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/50 px-4 py-3">
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">VANTABRAIN is checking for suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  const handleAccept = async (s: BrainSuggestion) => {
    await onFeedback(s.id, "accepted", s.source_pattern_type);
    onAcceptAction?.(s);
    toast({ title: "Suggestion accepted", description: "VANTABRAIN will remember this preference." });
  };

  const handleReject = async (s: BrainSuggestion) => {
    await onFeedback(s.id, "rejected", s.source_pattern_type);
    toast({ title: "Suggestion dismissed" });
  };

  const handleNotPreferred = async (s: BrainSuggestion) => {
    await onFeedback(s.id, "not_preferred", s.source_pattern_type);
    toast({ title: "Noted", description: "VANTABRAIN will avoid suggesting this in the future." });
  };

  const handleEdit = async (s: BrainSuggestion) => {
    if (editValue.trim()) {
      await onFeedback(s.id, "edited", s.source_pattern_type, editValue.trim());
      toast({ title: "Preference refined", description: "VANTABRAIN will use your correction going forward." });
      setEditingId(null);
      setEditValue("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-4 mb-5"
      style={{ borderColor: "hsl(280 70% 65% / 0.2)", backgroundImage: "linear-gradient(135deg, hsl(280 70% 65% / 0.03), transparent)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain size={15} style={{ color: "hsl(280 70% 65%)" }} />
        <span className="text-xs font-semibold text-foreground">VANTABRAIN Suggestions</span>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "hsl(280 70% 65% / 0.1)", color: "hsl(280 70% 65%)" }}>
          Adaptive
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {suggestions.map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 last:mb-0"
          >
            <div className="flex items-start gap-3 rounded-lg border border-border/30 bg-background/50 p-3 transition-all hover:border-border/50">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${categoryColors[s.category] || "hsl(280 70% 65%)"} / 0.1)` }}>
                <Sparkles size={12} style={{ color: categoryColors[s.category] || "hsl(280 70% 65%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{s.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/60 rounded-full border border-border/30 px-2 py-0.5">{s.category}</span>
                  <span className="text-[10px] text-muted-foreground/60">{Math.round(s.confidence * 100)}% confident</span>
                </div>

                {editingId === s.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter your preferred value..."
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleEdit(s)} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">Save</button>
                    <button onClick={() => { setEditingId(null); setEditValue(""); }} className="rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary/80">Cancel</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button onClick={() => handleAccept(s)} className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <Check size={11} /> Accept
                    </button>
                    <button onClick={() => handleReject(s)} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                      <X size={11} /> Dismiss
                    </button>
                    <button onClick={() => { setEditingId(s.id); setEditValue(s.actionable_value); }} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                      <PenLine size={11} /> Edit
                    </button>
                    <button onClick={() => handleNotPreferred(s)} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                      <ThumbsDown size={11} /> Not for me
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartSuggestions;
