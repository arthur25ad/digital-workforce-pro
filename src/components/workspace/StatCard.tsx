import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: string;
}

const StatCard = ({ label, value, icon, accent = "text-primary" }: StatCardProps) => (
  <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
    {icon && <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0 ${accent}`}>{icon}</div>}
    <div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default StatCard;
