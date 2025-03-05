
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
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max animate-fade-up">
        <InventoryCard 
          title="סך הכל" 
          value={stats.all} 
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        />
        <InventoryCard 
          title="ברשותי" 
          value={stats.owned} 
          active={activeTab === "owned"}
          onClick={() => setActiveTab("owned")}
        />
        <InventoryCard 
          title="חסרים" 
          value={stats.needed} 
          active={activeTab === "needed"}
          onClick={() => setActiveTab("needed")}
        />
        <InventoryCard 
          title="כפולים" 
          value={stats.duplicates} 
          active={activeTab === "duplicates"}
          onClick={() => setActiveTab("duplicates")}
        />
      </div>
    </div>
  );
};

export default InventoryStats;
