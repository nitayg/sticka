
import { useEffect, useState } from "react";
import { getStats } from "@/lib/sticker-operations";

interface StatsPanelProps {
  albumId: string | undefined;
}

const StatsPanel = ({ albumId }: StatsPanelProps) => {
  const [stats, setStats] = useState({ total: 0, owned: 0, needed: 0, duplicates: 0 });

  // Update stats when album changes
  useEffect(() => {
    const newStats = getStats(albumId);
    setStats(newStats);
  }, [albumId]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-medium mb-2">סטטוס האוסף</h3>
      <div className="text-xs text-muted-foreground">
        <div className="flex justify-between mb-1">
          <span>סה"כ מדבקות</span>
          <span className="font-medium">{stats.total}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>נאספו</span>
          <span className="font-medium">{stats.owned}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>חסרות</span>
          <span className="font-medium">{stats.needed}</span>
        </div>
        <div className="flex justify-between">
          <span>כפולות</span>
          <span className="font-medium">{stats.duplicates}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
