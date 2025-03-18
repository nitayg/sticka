
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
      case 'list': return 3; // Reduced from 4 to 3 for better mobile display
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
      User Agent: ${navigator.userAgent}
    `);
  };

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateLayout = () => {
      // Check if we're on iOS to adjust for safe area
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      
      // Fixed elements heights - carefully measured and adjusted for iOS
      const headerHeight = 56; // Mobile header (h-14 = 56px)
      const navigationHeight = 72; // Bottom navigation with safe area
      const pageHeaderHeight = 44; // Page title and actions
      const statsHeight = 76; // Statistics cards
      const filtersHeight = 46; // Filters and view toggle
      const safetyMargin = isIOS ? 40 : 10; // Extra margin for iOS devices
      
      // Total fixed elements overhead
      const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                statsHeight + filtersHeight + safetyMargin;
      
      // Available height for the grid - more conservative for iOS
      const availableHeight = window.innerHeight - fixedElementsHeight;
      
      // Determine base item heights based on view mode and device
      let baseItemHeight: number;
      
      if (isIOS) {
        // iOS specific heights (slightly smaller)
        if (viewMode === 'grid') {
          baseItemHeight = 150; // Card view height on iOS
        } else if (viewMode === 'list') {
          baseItemHeight = 70; // List view height on iOS
        } else { // compact
          baseItemHeight = 42; // Compact view height on iOS
        }
      } else {
        // Standard heights
        if (viewMode === 'grid') {
          baseItemHeight = 180; // Card view height
        } else if (viewMode === 'list') {
          baseItemHeight = 80; // List view height
        } else { // compact
          baseItemHeight = 48; // Compact view height
        }
      }
      
      // Gap sizes (pixels) - adjusted for iOS
      const gapSize = isIOS ? 
        (viewMode === 'compact' ? 3 : viewMode === 'list' ? 6 : 8) : 
        (viewMode === 'compact' ? 4 : viewMode === 'list' ? 8 : 12);
      
      // Calculate maximum rows that fit in available height with gap
      let maxRows = Math.floor(availableHeight / (baseItemHeight + gapSize));
      
      // Hard limits based on device and view mode
      const maxAllowedRows = isIOS ? 
        (viewMode === 'compact' ? 8 : viewMode === 'list' ? 4 : 3) : 
        (viewMode === 'compact' ? 10 : viewMode === 'list' ? 6 : 4);
      
      // Determine min rows based on view mode
      const minRows = getMinRows();
      
      // If maxRows is less than minRows, calculate a scale factor
      let scaleFactor = 1;
      if (maxRows < minRows) {
        scaleFactor = availableHeight / ((baseItemHeight + gapSize) * minRows);
        maxRows = minRows; // Force min rows
        setItemScale(Math.min(scaleFactor, 0.95)); // Cap scale reduction
      } else {
        setItemScale(1); // Reset scale if not needed
      }
      
      // Set row count to be at least minRows and max to our calculated maximum
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
        // Update max-height calculation to be more responsive
        viewMode === 'compact' && "max-h-[calc(100vh-290px)]",
        viewMode === 'list' && "max-h-[calc(100vh-290px)]",
        viewMode === 'grid' && "max-h-[calc(100vh-290px)]",
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
