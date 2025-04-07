
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getStats } from "@/lib/stickers/stats-operations";
import { cn } from "@/lib/utils";

interface CollectionStatsProps {
  albumId?: string;
  className?: string;
}

const CollectionStats = ({ albumId, className }: CollectionStatsProps) => {
  const [stats, setStats] = useState({ total: 0, owned: 0, needed: 0, duplicates: 0 });
  
  // Update stats when album changes
  useEffect(() => {
    if (!albumId) return;
    const newStats = getStats(albumId);
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
    <div className={cn(
      "rounded-lg border border-border relative overflow-hidden backdrop-blur-sm animate-fade-in", 
      "glass-effect hover-lift", 
      className
    )}>
      {/* Gradient decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300" />
      
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4 gradient-text">סטטיסטיקות האוסף</h3>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* Pie chart */}
          <div className="relative w-32 h-32 animate-fade-in delay-100">
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
                  animationDuration={1500}
                  animationBegin={300}
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
                    fontSize: '0.75rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold gradient-text">{ownedPercentage}%</span>
              <span className="text-xs text-muted-foreground">הושלם</span>
            </div>
          </div>
          
          {/* Stats breakdown */}
          <div className="flex-1 text-xs space-y-2 animate-fade-in delay-200">
            <div className="flex justify-between mb-1">
              <span>סה"כ מדבקות</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>נאספו</span>
                <span className="font-medium">{stats.owned}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2 relative">
                <div 
                  className="h-full bg-interactive rounded-full relative z-10" 
                  style={{ width: `${ownedPercentage}%` }}
                >
                  {/* Animated highlight */}
                  <div className="absolute inset-y-0 right-0 w-[5%] bg-white/30 blur-sm animate-[shimmer_2s_infinite]" />
                </div>
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
    </div>
  );
};

export default CollectionStats;
