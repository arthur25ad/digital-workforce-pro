import { useActivePromos } from "@/hooks/useActivePromos";
import { Tag } from "lucide-react";

const PromoBanner = () => {
  const { homepagePromo, loading } = useActivePromos();

  if (loading || !homepagePromo) return null;

  return (
    <div className="w-full bg-emerald-600 text-white py-2 px-4 text-center text-xs md:text-sm font-medium">
      <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap">
        <Tag size={12} className="shrink-0 md:w-[14px] md:h-[14px]" />
        <span>{homepagePromo.label || "Limited time offer"}</span>
        <span className="mx-0.5 md:mx-1">—</span>
        <span>
          Code "<span className="font-bold font-mono tracking-wide text-sm md:text-base">{homepagePromo.code}</span>" saves
          {homepagePromo.discount_type === "percentage"
            ? ` ${homepagePromo.discount_value}%`
            : ` $${homepagePromo.discount_value}`}
        </span>
        {homepagePromo.first_billing_cycle_only && (
          <span className="text-emerald-200 text-[10px] md:text-xs">(first month)</span>
        )}
      </div>
    </div>
  );
};

export default PromoBanner;
