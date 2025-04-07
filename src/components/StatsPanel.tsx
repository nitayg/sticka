
import { useEffect, useState } from "react";
import { getStats } from "@/lib/stickers/stats-operations";
import { Button } from "./ui/button";
import { ChartPieIcon, BarChartIcon } from "lucide-react";
import CollectionStats from "./stats/CollectionStats";

interface StatsPanelProps {
  albumId: string | undefined;
}

const StatsPanel = ({ albumId }: StatsPanelProps) => {
  const [stats, setStats] = useState({ total: 0, owned: 0, needed: 0, duplicates: 0 });
  const [showVisual, setShowVisual] = useState(false);

  // Update stats when album changes or when inventory is updated
  useEffect(() => {
    const updateStats = () => {
      if (!albumId) return;
      const newStats = getStats(albumId);
      // Calculate needed stickers from total and owned
      const needed = newStats.total - newStats.owned;
      setStats({ ...newStats, needed });
    };

    // Initial update
    updateStats();

    // Add event listener for inventory changes
    const handleInventoryChanged = () => {
      updateStats();
    };

    window.addEventListener('inventoryDataChanged', handleInventoryChanged);
    window.addEventListener('stickerDataChanged', handleInventoryChanged);
    
    return () => {
      window.removeEventListener('inventoryDataChanged', handleInventoryChanged);
      window.removeEventListener('stickerDataChanged', handleInventoryChanged);
    };
  }, [albumId]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">סטטוס האוסף</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => setShowVisual(!showVisual)}
        >
          {showVisual ? (
            <BarChartIcon className="h-4 w-4" />
          ) : (
            <ChartPieIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showVisual ? (
        <CollectionStats albumId={albumId} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
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
      )}
    </div>
  );
};

export default StatsPanel;
