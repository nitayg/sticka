
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickerCollectionGridProps {
  children: ReactNode;
  viewMode: "grid" | "list" | "compact";
  activeFilter?: string | null;
}

const StickerCollectionGrid = ({ 
  children, 
  viewMode, 
  activeFilter 
}: StickerCollectionGridProps) => {
  // Adjust card size based on active filter and view mode
  const getGridColsClass = () => {
    if (viewMode === "compact") {
      return "grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16";
    }
    
    // When filtered, show more cards by reducing their size
    if (activeFilter) {
      return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
    }
    // Default size
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  };

  return (
    <div className={cn(
      "w-full animate-scale-in",
      viewMode === "list" 
        ? "grid grid-cols-1 gap-3" 
        : `grid ${getGridColsClass()} gap-3 px-0.5`
    )}>
      {children}
    </div>
  );
};

export default StickerCollectionGrid;
