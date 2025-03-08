
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getStats } from "@/lib/sticker-operations";
import { cn } from "@/lib/utils";

interface CollectionStatsProps {
  albumId?: string;
  className?: string;
}

const CollectionStats = ({ albumId, className }: CollectionStatsProps) => {
  const [stats, setStats] = useState({ total: 0, owned: 0, needed: 0, duplicates: 0 });
  
  // Update stats when album changes
  useEffect(() => {
    const newStats = getStats();
    // Calculate needed stickers from total and owned
    const needed = newStats.total - newStats.owned;
    setStats({ ...newStats, needed });
  }, [albumId]);
  
  // Calculate percentages
  const ownedPercentage = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;
  
  // Prepare data for pie chart
  const chartData = [
    { name: "ברשותי", value: stats.owned, color: "hsl(var(--interactive))" },
    { name: "חסרים", value: stats.needed, color: "hsl(var(--muted-foreground))" },
  ];

  // Prepare data for duplicates bar
  const duplicatesPercentage = stats.owned > 0 ? Math.round((stats.duplicates / stats.owned) * 100) : 0;
  
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 overflow-hidden", className)}>
      <h3 className="text-sm font-medium mb-4">סטטיסטיקות האוסף</h3>
      
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Pie chart */}
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={1}
                stroke="hsl(var(--background))"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} מדבקות`, '']}
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold">{ownedPercentage}%</span>
            <span className="text-xs text-muted-foreground">הושלם</span>
          </div>
        </div>
        
        {/* Stats breakdown */}
        <div className="flex-1 text-xs space-y-2">
          <div className="flex justify-between mb-1">
            <span>סה"כ מדבקות</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>נאספו</span>
              <span className="font-medium">{stats.owned}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-interactive rounded-full" 
                style={{ width: `${ownedPercentage}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>חסרות</span>
              <span className="font-medium">{stats.needed}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-muted-foreground rounded-full" 
                style={{ width: `${100 - ownedPercentage}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span>כפולות</span>
              <span className="font-medium">{stats.duplicates}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-foreground/60 rounded-full" 
                style={{ width: `${duplicatesPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionStats;
