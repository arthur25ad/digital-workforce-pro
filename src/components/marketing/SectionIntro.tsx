import { cn } from "@/lib/utils";

interface SectionIntroProps {
  kicker: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionIntro({
  kicker,
  title,
  copy,
  align = "left",
  className,
}: SectionIntroProps) {
  const centered = align === "center";

  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl", className)}>
      <span className={cn("section-kicker", centered && "justify-center")}>{kicker}</span>
      <h2 className="section-title">{title}</h2>
      {copy ? <p className={cn("section-copy mt-4", centered && "mx-auto")}>{copy}</p> : null}
    </div>
  );
}
