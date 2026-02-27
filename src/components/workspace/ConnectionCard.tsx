import { ReactNode } from "react";

interface ConnectionCardProps {
  name: string;
  icon: ReactNode;
  connected: boolean;
  accountName?: string | null;
  connectedAt?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionCard = ({ name, icon, connected, accountName, connectedAt, onConnect, onDisconnect }: ConnectionCardProps) => (
  <div className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
    connected ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card hover:border-primary/20"
  }`}>
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {connected ? (
            <span className="text-emerald-400">
              Connected{accountName ? ` · ${accountName}` : ""}
              {connectedAt && <span className="text-muted-foreground ml-1">· {new Date(connectedAt).toLocaleDateString()}</span>}
            </span>
          ) : "Not connected"}
        </p>
      </div>
    </div>
    {connected ? (
      <button onClick={onDisconnect} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Disconnect</button>
    ) : (
      <button onClick={onConnect} className="btn-glow !px-4 !py-1.5 text-xs">Connect</button>
    )}
  </div>
);

export default ConnectionCard;
