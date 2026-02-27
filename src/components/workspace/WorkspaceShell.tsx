import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WorkspaceTab {
  label: string;
  icon?: ReactNode;
}

interface WorkspaceShellProps {
  tabs: WorkspaceTab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  children: ReactNode;
}

const WorkspaceShell = ({ tabs, activeTab, onTabChange, children }: WorkspaceShellProps) => {
  return (
    <div className="space-y-8">
      {/* Premium tab bar */}
      <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => onTabChange(i)}
            className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === i
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default WorkspaceShell;
