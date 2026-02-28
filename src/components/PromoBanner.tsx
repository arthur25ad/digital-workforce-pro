import { useActivePromos } from "@/hooks/useActivePromos";
import { Tag } from "lucide-react";

const PromoBanner = () => {
  const { homepagePromo, loading } = useActivePromos();

  if (loading || !homepagePromo) return null;

  return (
    <div className="w-full bg-emerald-600 text-white py-2.5 px-5 text-center text-xs md:text-sm font-medium">
      <div className="flex items-center justify-center gap-1.5 md:gap-2">
        <Tag size={12} className="shrink-0 hidden md:block" />
        {/* Mobile: ultra-compact single line */}
        <span className="md:hidden">
          Code "<span className="font-bold font-mono text-sm">{homepagePromo.code}</span>" saves
          {homepagePromo.discount_type === "percentage"
            ? ` ${homepagePromo.discount_value}%`
            : ` $${homepagePromo.discount_value}`}
          {homepagePromo.first_billing_cycle_only && <span className="text-emerald-200 text-[10px] ml-1">(first month)</span>}
        </span>
        {/* Desktop: full message */}
        <span className="hidden md:inline">
          <Tag size={14} className="inline -mt-0.5 mr-1" />
          {homepagePromo.label || "Limited time offer"} — Code "<span className="font-bold font-mono text-base">{homepagePromo.code}</span>" saves
          {homepagePromo.discount_type === "percentage"
            ? ` ${homepagePromo.discount_value}%`
            : ` $${homepagePromo.discount_value}`}
          {homepagePromo.first_billing_cycle_only && <span className="text-emerald-200 text-xs ml-1">(first month)</span>}
        </span>
      </div>
    </div>
  );
};

export default PromoBanner;
