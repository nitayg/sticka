
import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStatsChartProps {
  albumId?: string;
  className?: string;
}

const TeamStatsChart = ({ albumId, className }: TeamStatsChartProps) => {
  const [stickers, setStickers] = useState<any[]>([]);
  
  useEffect(() => {
    if (albumId) {
      const albumStickers = getStickersByAlbumId(albumId);
      setStickers(albumStickers);
    }
  }, [albumId]);
  
  const teamStats = useMemo(() => {
    const statsMap = new Map();
    
    stickers.forEach(sticker => {
      if (!sticker.team) return;
      
      if (!statsMap.has(sticker.team)) {
        statsMap.set(sticker.team, {
          name: sticker.team,
          logo: sticker.teamLogo,
          total: 0,
          owned: 0,
          percent: 0
        });
      }
      
      const teamStat = statsMap.get(sticker.team);
      teamStat.total++;
      
      if (sticker.isOwned) {
        teamStat.owned++;
      }
    });
    
    // Calculate percentages and sort by total
    return Array.from(statsMap.values())
      .map(stat => ({
        ...stat,
        percent: Math.round((stat.owned / stat.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Show only top 8 teams
  }, [stickers]);
  
  if (!teamStats.length) {
    return null;
  }
  
  return (
    <div className={cn(
      "rounded-lg border border-border relative overflow-hidden backdrop-blur-sm animate-fade-in", 
      "glass-effect hover-lift", 
      className
    )}>
      {/* Gradient decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300" />
      
      <div className="p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center">
          <Shield className="mr-2 h-4 w-4 text-blue-400" />
          <span className="gradient-text">התקדמות לפי קבוצות</span>
        </h3>
        
        <div className="h-56 animate-fade-in delay-300">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={teamStats}
              layout="vertical"
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              barCategoryGap={4}
              className="animate-fade-in"
            >
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                tickFormatter={(value) => `${value}%`} 
                fontSize={10}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tick={(props) => {
                  const { x, y, payload } = props;
                  const team = teamStats.find(t => t.name === payload.value);
                  
                  return (
                    <g transform={`translate(${x - 30},${y})`}>
                      {team?.logo ? (
                        <image 
                          x="0" 
                          y="-8" 
                          width="16" 
                          height="16" 
                          xlinkHref={team.logo} 
                          className="rounded-full" 
                        />
                      ) : (
                        <Shield className="w-4 h-4 opacity-50" style={{ transform: 'translate(0, -8px)' }} />
                      )}
                      <text x="20" y="4" fontSize="10" textAnchor="start" fill="hsl(var(--muted-foreground))">
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'הושלם']}
                labelFormatter={(label) => `קבוצה: ${label}`}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              />
              <Bar 
                dataKey="percent" 
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
              >
                {teamStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`rgba(59, 130, 246, ${0.6 + (0.4 * entry.percent / 100)})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-2 animate-fade-in delay-400">
          מציג {teamStats.length} קבוצות מובילות באוסף
        </div>
      </div>
    </div>
  );
};

export default TeamStatsChart;
