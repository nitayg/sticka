
import { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { getStats } from '@/lib/stickers/stats-operations';

interface CollectionStatsProps {
  albumId: string | undefined;
}

const CollectionStats = ({ albumId }: CollectionStatsProps) => {
  const [stats, setStats] = useState({ total: 0, owned: 0, duplicates: 0 });
  
  useEffect(() => {
    if (!albumId) return;
    
    const updateStats = () => {
      const newStats = getStats(albumId);
      setStats(newStats);
    };
    
    // Initial stats
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
  
  if (!albumId || stats.total === 0) {
    return <div className="text-center text-sm text-muted-foreground">אין מידע זמין</div>;
  }
  
  const percentOwned = Math.round((stats.owned / stats.total) * 100);
  
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{percentOwned}% הושלם</span>
          <span className="font-medium">{stats.owned} / {stats.total}</span>
        </div>
        <Progress value={percentOwned} className="h-2" />
      </div>
      
      {stats.duplicates > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">מדבקות כפולות:</span>
          <span className="font-medium">{stats.duplicates}</span>
        </div>
      )}
      
      <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="סה״כ" value={stats.total} />
        <Stat label="נאספו" value={stats.owned} color="text-green-600" />
        <Stat label="חסרות" value={stats.total - stats.owned} color="text-orange-600" />
      </div>
    </div>
  );
};

// Helper component for stats
const Stat = ({ label, value, color }: { label: string, value: number, color?: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-lg font-bold ${color || ''}`}>{value}</span>
  </div>
);

export default CollectionStats;
