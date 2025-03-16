
import InventoryCard from "./InventoryCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface InventoryStatsProps {
  stats: {
    all: number;
    owned: number;
    needed: number;
    duplicates: number;
  };
  activeTab: "all" | "owned" | "needed" | "duplicates";
  setActiveTab: (tab: "all" | "owned" | "needed" | "duplicates") => void;
}

const InventoryStats = ({ stats, activeTab, setActiveTab }: InventoryStatsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "flex flex-row overflow-x-auto scrollbar-none animate-fade-up no-scrollbar",
      isMobile ? "gap-1.5 mb-2 pb-0.5" : "gap-2 mb-4 pb-1"
    )}>
      <InventoryCard 
        title="סך הכל" 
        value={stats.all} 
        active={activeTab === "all"}
        onClick={() => setActiveTab("all")}
        className="flex-1 min-w-[80px] delay-100"
      />
      <InventoryCard 
        title="ברשותי" 
        value={stats.owned} 
        active={activeTab === "owned"}
        onClick={() => setActiveTab("owned")}
        className="flex-1 min-w-[80px] delay-200"
      />
      <InventoryCard 
        title="חסרים" 
        value={stats.needed} 
        active={activeTab === "needed"}
        onClick={() => setActiveTab("needed")}
        className="flex-1 min-w-[80px] delay-300"
      />
      <InventoryCard 
        title="כפולים" 
        value={stats.duplicates} 
        active={activeTab === "duplicates"}
        onClick={() => setActiveTab("duplicates")}
        className="flex-1 min-w-[80px] delay-400"
      />
    </div>
  );
};

export default InventoryStats;
