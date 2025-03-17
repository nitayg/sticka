
import { ReactNode, useEffect, useState, useRef, Children, isValidElement } from 'react';
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
  const itemRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debug logging for height calculations
  const logHeights = (availableHeight: number, headerHeight: number, itemHeight: number, maxRows: number) => {
    console.log(`
      View Mode: ${viewMode}
      Window Height: ${window.innerHeight}px
      Available Height: ${availableHeight}px
      Header Height: ${headerHeight}px
      Item Height: ${itemHeight}px
      Gap Size: ${viewMode === 'compact' ? 4 : viewMode === 'list' ? 8 : 12}px
      Calculated Max Rows: ${maxRows}
    `);
  };

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateRowCount = () => {
      // Fixed elements heights
      const headerHeight = 56; // Mobile header (h-14 = 56px)
      const navigationHeight = 60; // Bottom navigation
      const pageHeaderHeight = 50; // Headers, tabs, filters, etc.
      const statsHeight = 80; // Statistics cards
      const filtersHeight = 80; // Filters and album selection
      const safetyMargin = 20; // Extra margin to ensure no scrollbar appears
      
      // Total fixed elements overhead
      const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                statsHeight + filtersHeight + safetyMargin;
      
      // Available height for the grid
      const availableHeight = window.innerHeight - fixedElementsHeight;
      
      // Item heights based on view mode (measured in pixels)
      let itemHeight;
      if (viewMode === 'grid') {
        itemHeight = 200; // Card view height
      } else if (viewMode === 'list') {
        itemHeight = 80; // List view height (adjusted from StickerListItem)
      } else {
        itemHeight = 48; // Compact view height (adjusted from CompactStickerItem)
      }
      
      // Gap sizes (pixels) - reduced for compact and list views
      const gapSize = viewMode === 'compact' ? 4 : viewMode === 'list' ? 8 : 12;
      
      // Calculate max rows that fit in available height with gap
      const maxRows = Math.floor(availableHeight / (itemHeight + gapSize));
      
      // Log for debugging
      logHeights(availableHeight, fixedElementsHeight, itemHeight, maxRows);
      
      // Ensure at least 1 row, maximum 12 rows for compact view, 6 for list, 4 for grid
      const maxAllowedRows = viewMode === 'compact' ? 10 : viewMode === 'list' ? 6 : 4;
      return Math.max(1, Math.min(maxRows, maxAllowedRows));
    };

    // Set initial row count and update on resize
    const handleResize = () => {
      setRowCount(calculateRowCount());
    };

    handleResize(); // Run immediately
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Wrap first child with ref for measurement
  let modifiedChildren = children;
  const childrenArray = Children.toArray(children);
  
  if (childrenArray.length > 0 && !itemRef.current) {
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);
    
    if (isValidElement(firstChild)) {
      modifiedChildren = [
        <div key="first-child-wrapper" ref={itemRef} className="contents animate-fade-in">
          {firstChild}
        </div>,
        ...restChildren
      ];
    }
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "overflow-x-auto overflow-y-hidden pb-1 px-2", // Reduced padding
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        // Add fixed height calculated based on view mode
        viewMode === 'compact' && "max-h-[calc(100vh-280px)]",
        viewMode === 'list' && "max-h-[calc(100vh-280px)]",
        viewMode === 'grid' && "max-h-[calc(100vh-280px)]",
        activeFilter && "pt-1" // Reduced top padding when filter is active
      )}
    >
      <div 
        ref={gridRef}
        className={cn(
          "transition-all duration-300 ease-in-out",
          viewMode === 'list' && "grid grid-flow-col auto-cols-max grid-list-gap animate-stagger-fade", 
          viewMode === 'compact' && "grid grid-flow-col grid-compact-gap animate-stagger-fade", 
          viewMode === 'grid' && "grid grid-flow-col grid-card-gap animate-stagger-fade",
          `grid-rows-${rowCount}`
        )}
        style={{
          // Using inline style for dynamic grid-template-rows and gap settings
          gridTemplateRows: `repeat(${rowCount}, auto)`,
          gap: viewMode === 'compact' ? '4px' : viewMode === 'list' ? '8px' : '12px',
          scrollBehavior: 'smooth'
        }}
      >
        {modifiedChildren}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
