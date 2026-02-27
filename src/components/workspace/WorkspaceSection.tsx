import { ReactNode } from "react";

interface WorkspaceSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const WorkspaceSection = ({ title, description, action, children, className = "" }: WorkspaceSectionProps) => (
  <div className={`space-y-5 ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export default WorkspaceSection;
