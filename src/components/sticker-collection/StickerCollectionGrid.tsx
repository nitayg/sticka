import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import HorizontalScrollableGrid from './HorizontalScrollableGrid';

interface StickerCollectionGridProps {
  viewMode: 'grid' | 'list' | 'compact';
  activeFilter?: string | null;
  children: ReactNode;
  useHorizontalScroll?: boolean;
}

const StickerCollectionGrid = ({
  viewMode,
  activeFilter,
  children,
  useHorizontalScroll = false
}: StickerCollectionGridProps) => {
  // Generate the appropriate class names for the grid
  const gridClasses = cn(
    "transition-all duration-200 ease-in-out",
    viewMode === 'list' && "divide-y divide-border",
    viewMode === 'compact' && (
      useHorizontalScroll 
        ? "flex flex-row flex-nowrap gap-1 min-w-max" 
        : "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1"
    ),
    viewMode === 'grid' && (
      useHorizontalScroll 
        ? "flex flex-row flex-nowrap gap-2 min-w-max" 
        : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 pb-4"
    ),
    activeFilter && "pt-2"
  );

  // If horizontal scrolling is enabled, wrap the grid in the HorizontalScrollableGrid component
  if (useHorizontalScroll) {
    return (
      <HorizontalScrollableGrid>
        <div className={gridClasses}>
          {children}
        </div>
      </HorizontalScrollableGrid>
    );
  }

  // Otherwise, just render the grid
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default StickerCollectionGrid;
