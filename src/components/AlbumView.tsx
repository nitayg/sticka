
import { useState } from "react";
import { Sticker, stickers } from "@/lib/data";
import { cn } from "@/lib/utils";
import Header from "./Header";
import StickerCard from "./StickerCard";
import { Image, Plus } from "lucide-react";
import EmptyState from "./EmptyState";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const categories = ["All", "Players", "Teams", "Stadiums", "Badges"];
  
  const filteredStickers = stickers.filter(sticker => 
    selectedCategory === "All" || sticker.category === selectedCategory
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="Digital Album" 
        subtitle="View and organize your sticker collection"
        action={
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "grid" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3.01" y1="6" y2="6" />
                <line x1="3" x2="3.01" y1="12" y2="12" />
                <line x1="3" x2="3.01" y1="18" y2="18" />
              </svg>
            </button>
            <button className="px-3 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        }
      />
      
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "py-1.5 px-3 rounded-full text-sm whitespace-nowrap transition-colors",
                category === selectedCategory
                  ? "bg-interactive text-interactive-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {filteredStickers.length > 0 ? (
        <div className={cn(
          "w-full animate-scale-in",
          viewMode === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
            : "grid grid-cols-1 gap-3"
        )}>
          {filteredStickers.map(sticker => 
            viewMode === "grid" ? (
              <StickerCard 
                key={sticker.id} 
                sticker={sticker} 
                compact
                onClick={() => console.log(`Selected ${sticker.name}`)}
              />
            ) : (
              <ListItem key={sticker.id} sticker={sticker} />
            )
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Image className="h-12 w-12" />}
          title="No stickers found"
          description="Add stickers to your collection or change the filter criteria."
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

const ListItem = ({ sticker }: { sticker: Sticker }) => {
  return (
    <div className={cn(
      "flex items-center space-x-4 p-3 rounded-xl bg-white border border-border",
      "transition-all duration-300 ease-out hover:shadow-md",
      "cursor-pointer"
    )}>
      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
        <img 
          src={sticker.imageUrl} 
          alt={sticker.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">#{sticker.number} • {sticker.team}</p>
        <h3 className="text-base font-semibold text-foreground truncate">{sticker.name}</h3>
        <p className="text-sm text-muted-foreground">{sticker.category}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {sticker.isDuplicate && sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            Duplicate
          </div>
        )}
        {!sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            Need
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumView;
