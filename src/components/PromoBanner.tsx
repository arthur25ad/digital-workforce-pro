import { useActivePromos } from "@/hooks/useActivePromos";
import { Tag } from "lucide-react";

const PromoBanner = () => {
  const { homepagePromo, loading } = useActivePromos();

  if (loading || !homepagePromo) return null;

  return (
    <div className="w-full bg-emerald-600 text-white py-2.5 px-4 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Tag size={14} className="shrink-0" />
        <span>{homepagePromo.label || "Limited time offer"}</span>
        <span className="mx-1">—</span>
        <span>
          Use code "<span className="font-bold font-mono tracking-wide text-base">{homepagePromo.code}</span>" at checkout to save
          {homepagePromo.discount_type === "percentage"
            ? ` ${homepagePromo.discount_value}%`
            : ` $${homepagePromo.discount_value}`}
        </span>
        {homepagePromo.first_billing_cycle_only && (
          <span className="text-emerald-200 text-xs">(first month only)</span>
        )}
      </div>
    </div>
  );
};

export default PromoBanner;
