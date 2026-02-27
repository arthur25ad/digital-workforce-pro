import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import type { PromoCode } from "@/hooks/useActivePromos";

interface PromoCodeInputProps {
  onApply: (promo: PromoCode) => void;
  onClear: () => void;
  appliedPromo: PromoCode | null;
}

const PromoCodeInput = ({ onApply, onClear, appliedPromo }: PromoCodeInputProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (fetchError || !data) {
      setError("Invalid or expired promo code");
      setLoading(false);
      return;
    }

    // Check usage limit
    if (data.max_uses && data.usage_count >= data.max_uses) {
      setError("This promo code has reached its usage limit");
      setLoading(false);
      return;
    }

    // Check date range
    const now = new Date();
    if (data.end_date && new Date(data.end_date) < now) {
      setError("This promo code has expired");
      setLoading(false);
      return;
    }
    if (data.start_date && new Date(data.start_date) > now) {
      setError("This promo code is not yet active");
      setLoading(false);
      return;
    }

    onApply(data as any as PromoCode);
    setLoading(false);
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
        <Check size={16} className="text-emerald-400 shrink-0" />
        <span className="text-sm text-emerald-300 font-mono font-semibold">{appliedPromo.code}</span>
        <span className="text-xs text-emerald-400/70">applied</span>
        <button onClick={onClear} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          className="font-mono text-sm h-9"
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="h-9 px-4 text-xs"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default PromoCodeInput;
