
import { ReactNode, useEffect, useState, useRef, Children, isValidElement } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Define minimum rows for each view mode - slightly reduced for mobile
  const getMinRows = (): number => {
    if (isMobile) {
      switch (viewMode) {
        case 'grid': return 2;
        case 'compact': return 4;
        case 'list': return 3;
        default: return 2;
      }
    } else {
      switch (viewMode) {
        case 'grid': return 3;
        case 'compact': return 5;
        case 'list': return 4;
        default: return 3;
      }
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
      Is Mobile: ${isMobile}
    `);
  };

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateLayout = () => {
      try {
        // Fixed elements heights - carefully measured with extra safety margin for iOS
        const headerHeight = 56; // Mobile header (h-14 = 56px)
        const navigationHeight = 70; // Bottom navigation (increased for iOS safe area)
        const pageHeaderHeight = 44; // Page title and actions
        const statsHeight = 76; // Statistics cards
        const filtersHeight = 46; // Filters and view toggle
        const safetyMargin = isMobile ? 24 : 12; // Extra margin to prevent scrollbar, higher on mobile
        
        // Total fixed elements overhead
        const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                  statsHeight + filtersHeight + safetyMargin;
        
        // Available height for the grid - use a more conservative height for mobile
        const availableHeight = window.innerHeight - fixedElementsHeight;
        
        // Item heights based on view mode (in pixels)
        // Reduced heights on mobile to fit more rows
        let baseItemHeight;
        if (viewMode === 'grid') {
          baseItemHeight = isMobile ? 160 : 180; // Card view height
        } else if (viewMode === 'list') {
          baseItemHeight = isMobile ? 70 : 80; // List view height
        } else { // compact
          baseItemHeight = isMobile ? 42 : 48; // Compact view height
        }
        
        // Gap sizes (pixels) - smaller gaps on mobile
        const gapSize = viewMode === 'compact' ? (isMobile ? 3 : 4) : 
                       viewMode === 'list' ? (isMobile ? 6 : 8) : 
                       (isMobile ? 8 : 12);
        
        // Calculate maximum rows that fit in available height with gap
        let maxRows = Math.floor(availableHeight / (baseItemHeight + gapSize));
        
        // Determine min rows based on view mode
        const minRows = getMinRows();
        
        // If maxRows is less than minRows, calculate a scale factor
        let scaleFactor = 1;
        if (maxRows < minRows) {
          scaleFactor = availableHeight / ((baseItemHeight + gapSize) * minRows);
          maxRows = minRows; // Force min rows
          setItemScale(Math.max(0.75, scaleFactor)); // Don't scale below 75%
        } else {
          setItemScale(1); // Reset scale if not needed
        }
        
        // Set row count to be at least minRows and max appropriate for screen size
        const maxAllowedRows = isMobile ? 
          (viewMode === 'compact' ? 8 : viewMode === 'list' ? 5 : 3) : 
          (viewMode === 'compact' ? 10 : viewMode === 'list' ? 6 : 4);
        
        const finalRowCount = Math.max(minRows, Math.min(maxRows, maxAllowedRows));
        
        // Log for debugging
        logHeights(availableHeight, fixedElementsHeight, baseItemHeight, gapSize, finalRowCount);
        
        setRowCount(finalRowCount);
      } catch (error) {
        console.error("Error calculating layout:", error);
        // Fallback to safe values in case of error
        setRowCount(getMinRows());
        setItemScale(1);
      }
    };

    // Set initial layout and update on resize with debouncing
    calculateLayout();
    
    const handleResize = () => {
      calculateLayout();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, isMobile]);

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
        // Fixed height with more precise calculations 
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
          gap: viewMode === 'compact' ? (isMobile ? '3px' : '4px') : 
               viewMode === 'list' ? (isMobile ? '6px' : '8px') : 
               (isMobile ? '8px' : '12px'),
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
