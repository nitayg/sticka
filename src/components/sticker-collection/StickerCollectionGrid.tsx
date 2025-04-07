
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
  return (
    <div className={cn(
      "relative",
      viewMode === "grid" && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
      viewMode === "list" && "space-y-2",
      viewMode === "compact" && "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2"
    )}>
      {children}
      
      {activeFilter && (
        <div className="absolute top-0 right-0 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
          מציג תוצאות עבור: {activeFilter}
        </div>
      )}
    </div>
  );
};

export default StickerCollectionGrid;
