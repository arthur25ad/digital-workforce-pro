import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, message, action }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-10 text-center">
    {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">{icon}</div>}
    <p className="text-sm text-muted-foreground">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
