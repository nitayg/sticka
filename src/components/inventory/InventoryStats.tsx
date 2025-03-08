
import InventoryCard from "./InventoryCard";

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
  return (
    <div className="flex flex-row overflow-x-auto scrollbar-none gap-2 animate-fade-up mb-4 no-scrollbar pb-1">
      <InventoryCard 
        title="סך הכל" 
        value={stats.all} 
        active={activeTab === "all"}
        onClick={() => setActiveTab("all")}
        className="flex-1 min-w-[80px]"
      />
      <InventoryCard 
        title="ברשותי" 
        value={stats.owned} 
        active={activeTab === "owned"}
        onClick={() => setActiveTab("owned")}
        className="flex-1 min-w-[80px]"
      />
      <InventoryCard 
        title="חסרים" 
        value={stats.needed} 
        active={activeTab === "needed"}
        onClick={() => setActiveTab("needed")}
        className="flex-1 min-w-[80px]"
      />
      <InventoryCard 
        title="כפולים" 
        value={stats.duplicates} 
        active={activeTab === "duplicates"}
        onClick={() => setActiveTab("duplicates")}
        className="flex-1 min-w-[80px]"
      />
    </div>
  );
};

export default InventoryStats;
