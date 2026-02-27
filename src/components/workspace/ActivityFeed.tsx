interface Activity {
  id: string;
  message: string;
  created_at: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  emptyMessage?: string;
  limit?: number;
}

const ActivityFeed = ({ activities, emptyMessage = "No activity yet.", limit = 12 }: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-10 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {activities.slice(0, limit).map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-lg bg-card border border-border/30 px-4 py-3 transition-colors hover:border-border/60">
          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{a.message}</p>
          </div>
          <p className="text-xs text-muted-foreground shrink-0">{new Date(a.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
