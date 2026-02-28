import { useActivePromos } from "@/hooks/useActivePromos";
import { Tag } from "lucide-react";

const PromoBanner = () => {
  const { homepagePromo, loading } = useActivePromos();

  if (loading || !homepagePromo) return null;

  return (
    <div className="w-full bg-emerald-600 text-white py-3 md:py-2.5 px-5 text-center font-medium">
      {/* Mobile: single line */}
      <div className="md:hidden text-xs">
        Use code "<span className="font-bold font-mono text-sm">{homepagePromo.code}</span>" — Save {homepagePromo.discount_type === "percentage"
          ? `${homepagePromo.discount_value}%`
          : `$${homepagePromo.discount_value}`}{homepagePromo.first_billing_cycle_only && <span className="text-emerald-200 ml-1">(first month)</span>}
      </div>
      {/* Desktop: single line */}
      <div className="hidden md:flex items-center justify-center gap-2 text-sm">
        <Tag size={14} className="shrink-0" />
        <span>{homepagePromo.label || "Limited time offer"}</span>
        <span>—</span>
        <span>
          Code "<span className="font-bold font-mono text-base">{homepagePromo.code}</span>" saves
          {homepagePromo.discount_type === "percentage"
            ? ` ${homepagePromo.discount_value}%`
            : ` $${homepagePromo.discount_value}`}
        </span>
        {homepagePromo.first_billing_cycle_only && (
          <span className="text-emerald-200 text-xs">(first month)</span>
        )}
      </div>
    </div>
  );
};

export default PromoBanner;
