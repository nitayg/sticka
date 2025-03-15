
import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface StickerCollectionGridProps {
  viewMode: 'grid' | 'list' | 'compact';
  activeFilter?: string | null;
  children: ReactNode;
}

const StickerCollectionGrid = ({
  viewMode,
  activeFilter,
  children
}: StickerCollectionGridProps) => {
  const [rowCount, setRowCount] = useState(3);

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateRowCount = () => {
      const headerHeight = 180; // Adjust based on your total header height including filters, stats, etc.
      const availableHeight = window.innerHeight - headerHeight;
      
      // Estimate item height based on view mode
      let itemHeight;
      if (viewMode === 'grid') {
        itemHeight = 200; // Card view height estimate
      } else if (viewMode === 'list') {
        itemHeight = 96; // List view height estimate
      } else {
        itemHeight = 60; // Compact view height estimate
      }
      
      // Calculate max rows that fit in available height with gap
      const gapSize = viewMode === 'compact' ? 10 : 16; // Gap between rows
      const maxRows = Math.floor(availableHeight / (itemHeight + gapSize));
      
      // Ensure at least 1 row, maximum 8 rows (or 10 for compact view)
      const maxAllowedRows = viewMode === 'compact' ? 10 : 8;
      return Math.max(1, Math.min(maxRows, maxAllowedRows));
    };

    // Set initial row count
    setRowCount(calculateRowCount());

    // Update row count on window resize
    const handleResize = () => {
      setRowCount(calculateRowCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  return (
    <div className={cn(
      "max-h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-hidden pb-4 px-2",
      activeFilter && "pt-2"
    )}>
      <div className={cn(
        "transition-all duration-200 ease-in-out",
        viewMode === 'list' && "grid grid-flow-col auto-cols-max gap-x-4",
        viewMode === 'compact' && "grid grid-flow-col gap-x-4 gap-y-2", // Increased y-gap for compact view
        viewMode === 'grid' && "grid grid-flow-col gap-x-4",
        `grid-rows-${rowCount}`
      )}
      style={{
        // Using inline style for dynamic grid-template-rows
        gridTemplateRows: `repeat(${rowCount}, auto)`
      }}
      >
        {children}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
