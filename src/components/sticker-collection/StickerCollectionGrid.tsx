
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
  const [itemScale, setItemScale] = useState(1);
  const itemRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Define minimum rows for each view mode
  const getMinRows = (): number => {
    switch (viewMode) {
      case 'grid': return 3;
      case 'compact': return 5;
      case 'list': return 4;
      default: return 3;
    }
  };
  
  // Debug logging for height calculations
  const logHeights = (availableHeight: number, fixedElementsHeight: number, itemHeight: number, gapSize: number, maxRows: number) => {
    console.log(`
      View Mode: ${viewMode}
      Window Height: ${window.innerHeight}px
      Available Height: ${availableHeight}px
      Fixed Elements Height: ${fixedElementsHeight}px
      Item Height: ${itemHeight}px
      Gap Size: ${gapSize}px
      Item Scale: ${itemScale}
      Calculated Rows: ${maxRows}
      Min Rows: ${getMinRows()}
    `);
  };

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateLayout = () => {
      // Fixed elements heights - carefully measured
      const headerHeight = 56; // Mobile header (h-14 = 56px)
      const navigationHeight = 64; // Bottom navigation
      const pageHeaderHeight = 44; // Page title and actions
      const statsHeight = 76; // Statistics cards
      const filtersHeight = 46; // Filters and view toggle
      const safetyMargin = 12; // Extra margin to prevent scrollbar
      
      // Total fixed elements overhead
      const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                statsHeight + filtersHeight + safetyMargin;
      
      // Available height for the grid
      const availableHeight = window.innerHeight - fixedElementsHeight;
      
      // Item heights based on view mode (in pixels)
      let baseItemHeight;
      if (viewMode === 'grid') {
        baseItemHeight = 180; // Card view height
      } else if (viewMode === 'list') {
        baseItemHeight = 80; // List view height
      } else { // compact
        baseItemHeight = 48; // Compact view height
      }
      
      // Gap sizes (pixels)
      const gapSize = viewMode === 'compact' ? 4 : viewMode === 'list' ? 8 : 12;
      
      // Calculate maximum rows that fit in available height with gap
      let maxRows = Math.floor(availableHeight / (baseItemHeight + gapSize));
      
      // Determine min rows based on view mode
      const minRows = getMinRows();
      
      // If maxRows is less than minRows, calculate a scale factor
      let scaleFactor = 1;
      if (maxRows < minRows) {
        scaleFactor = availableHeight / ((baseItemHeight + gapSize) * minRows);
        maxRows = minRows; // Force min rows
        setItemScale(scaleFactor);
      } else {
        setItemScale(1); // Reset scale if not needed
      }
      
      // Set row count to be at least minRows and max 12 for compact, 6 for list, 4 for grid
      const maxAllowedRows = viewMode === 'compact' ? 10 : viewMode === 'list' ? 6 : 4;
      const finalRowCount = Math.max(minRows, Math.min(maxRows, maxAllowedRows));
      
      // Log for debugging
      logHeights(availableHeight, fixedElementsHeight, baseItemHeight, gapSize, finalRowCount);
      
      setRowCount(finalRowCount);
    };

    // Set initial layout and update on resize
    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
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
        "overflow-x-auto overflow-y-hidden pb-1 px-2", 
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        // Add fixed height calculated based on view mode
        viewMode === 'compact' && "max-h-[calc(100vh-280px)]",
        viewMode === 'list' && "max-h-[calc(100vh-280px)]",
        viewMode === 'grid' && "max-h-[calc(100vh-280px)]",
        activeFilter && "pt-1" // Reduced top padding when filter is active
      )}
      style={{ direction: 'rtl' }} // Explicitly set RTL direction for this container
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
          scrollBehavior: 'smooth',
          transform: `scale(${itemScale})`,
          transformOrigin: 'top right', // RTL-friendly origin
          direction: 'rtl' // Ensure RTL direction for grid
        }}
      >
        {modifiedChildren}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
