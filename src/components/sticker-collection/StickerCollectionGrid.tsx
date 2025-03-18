
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
  
  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateLayout = () => {
      // Fixed elements heights - carefully measured
      const headerHeight = 56; // Mobile header (h-14 = 56px)
      const navigationHeight = 96; // Bottom navigation (increased to 96px to account for the footer + safe area)
      const pageHeaderHeight = 44; // Page title and actions
      const statsHeight = 76; // Statistics cards
      const filtersHeight = 46; // Filters and view toggle
      const safetyMargin = 30; // Extra margin to prevent scrollbar and ensure no cutoff
      
      // iOS safe area considerations 
      const hasSafeArea = window.innerHeight > 800;
      const safeAreaHeight = hasSafeArea ? 34 : 0; 
      
      // Total fixed elements overhead
      const fixedElementsHeight = headerHeight + navigationHeight + pageHeaderHeight + 
                                statsHeight + filtersHeight + safeAreaHeight + safetyMargin;
      
      // Available height for the grid
      const availableHeight = window.innerHeight - fixedElementsHeight;
      
      // Item heights based on view mode (in pixels)
      let baseItemHeight;
      if (viewMode === 'grid') {
        baseItemHeight = 138; // Card view height
      } else if (viewMode === 'list') {
        baseItemHeight = 74; // List view height
      } else { // compact
        baseItemHeight = 44; // Compact view height
      }
      
      // Gap sizes (pixels) - smaller gaps to fit more content
      const gapSize = viewMode === 'compact' ? 4 : viewMode === 'list' ? 6 : 8;
      
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
      
      console.log(`View Mode: ${viewMode}, Available Height: ${availableHeight}px, Final Row Count: ${finalRowCount}`);
      
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
        "overflow-x-auto overflow-y-hidden pb-2 px-2", 
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        // Adjusted fixed height calculation with more space for the content
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
          gap: viewMode === 'compact' ? '4px' : viewMode === 'list' ? '6px' : '8px',
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
