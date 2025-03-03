
import { useState } from "react";
import { Sticker, stickers } from "@/lib/data";
import { cn } from "@/lib/utils";
import Header from "./Header";
import StickerCard from "./StickerCard";
import { List, Plus } from "lucide-react";
import EmptyState from "./EmptyState";

const InventoryView = () => {
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "needed" | "duplicates">("all");
  
  // Filter stickers based on active tab
  const filteredStickers = stickers.filter(sticker => {
    if (activeTab === "all") return true;
    if (activeTab === "owned") return sticker.isOwned;
    if (activeTab === "needed") return !sticker.isOwned;
    if (activeTab === "duplicates") return sticker.isDuplicate && sticker.isOwned;
    return true;
  });

  const tabStats = {
    all: stickers.length,
    owned: stickers.filter(s => s.isOwned).length,
    needed: stickers.filter(s => !s.isOwned).length,
    duplicates: stickers.filter(s => s.isDuplicate && s.isOwned).length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="Inventory" 
        subtitle="Track your sticker collection"
        action={
          <button className="px-3 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Add
          </button>
        }
      />
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-up">
        <InventoryCard 
          title="Total" 
          value={tabStats.all} 
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        />
        <InventoryCard 
          title="Owned" 
          value={tabStats.owned} 
          active={activeTab === "owned"}
          onClick={() => setActiveTab("owned")}
        />
        <InventoryCard 
          title="Needed" 
          value={tabStats.needed} 
          active={activeTab === "needed"}
          onClick={() => setActiveTab("needed")}
        />
        <InventoryCard 
          title="Duplicates" 
          value={tabStats.duplicates} 
          active={activeTab === "duplicates"}
          onClick={() => setActiveTab("duplicates")}
        />
      </div>
      
      {filteredStickers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-scale-in">
          {filteredStickers.map(sticker => (
            <StickerCard 
              key={sticker.id} 
              sticker={sticker} 
              compact
              showActions={activeTab === "needed"}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<List className="h-12 w-12" />}
          title="No stickers found"
          description={`You don't have any stickers in the "${activeTab}" category.`}
          action={
            <button className="px-4 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Sticker
            </button>
          }
        />
      )}
    </div>
  );
};

interface InventoryCardProps {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}

const InventoryCard = ({ title, value, active, onClick }: InventoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl p-4 text-left transition-all duration-300",
        "border",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={cn(
        "text-2xl font-bold mt-1",
        active ? "text-interactive" : "text-foreground"
      )}>
        {value}
      </div>
    </button>
  );
};

export default InventoryView;
