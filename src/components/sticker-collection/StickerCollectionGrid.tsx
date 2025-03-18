
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
      const navigationHeight = 56; // Bottom navigation
      const pageHeaderHeight = 44; // Page title and actions
      const statsHeight = 76; // Statistics cards
      const filtersHeight = 46; // Filters and view toggle
      const safetyMargin = 16; // Extra margin to prevent scrollbar
      
      // חישוב Safe Area - iOS רק עם גובה המסך יותר מ-800px
      const hasSafeArea = window.innerHeight > 800;
      const safeAreaHeight = hasSafeArea ? 34 : 0; // מעריך גובה של Safe Area בהתבסס על iPhone
      
      // Total fixed elements overhead - הורדנו ערכים כמו ה-SyncIndicator התחתון
      const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                statsHeight + filtersHeight + safeAreaHeight + safetyMargin;
      
      // Available height for the grid
      const availableHeight = window.innerHeight - fixedElementsHeight;
      
      // Item heights based on view mode (in pixels) - קטנו את הגובה
      let baseItemHeight;
      if (viewMode === 'grid') {
        baseItemHeight = 140; // Card view height - reduced for better fit
      } else if (viewMode === 'list') {
        baseItemHeight = 76; // List view height - reduced
      } else { // compact
        baseItemHeight = 46; // Compact view height - reduced
      }
      
      // Gap sizes (pixels) - הקטנו את המרווחים
      const gapSize = viewMode === 'compact' ? 4 : viewMode === 'list' ? 6 : 10;
      
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
      const maxAllowedRows = viewMode === 'compact' ? 12 : viewMode === 'list' ? 6 : 5;
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
        "overflow-x-auto overflow-y-hidden pb-0 px-2", 
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        // Adjusted fixed height calculation for better fit
        viewMode === 'compact' && "max-h-[calc(100vh-260px)]",
        viewMode === 'list' && "max-h-[calc(100vh-260px)]",
        viewMode === 'grid' && "max-h-[calc(100vh-260px)]",
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
          gap: viewMode === 'compact' ? '4px' : viewMode === 'list' ? '6px' : '10px',
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
