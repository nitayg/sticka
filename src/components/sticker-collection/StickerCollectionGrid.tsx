
import { ReactNode, useEffect, useState, useRef, Children, isValidElement } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '../ui/scroll-area';

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
  const isMobile = useIsMobile();

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateRowCount = () => {
      // Adjust based on device and layout
      const headerHeight = isMobile ? 160 : 180; 
      const navHeight = 60; // Bottom navigation
      const topOffset = isMobile ? 10 : 20; // Extra space at top
      const bottomPadding = isMobile ? 90 : 100; // Extra padding at bottom for mobile navigation

      const availableHeight = window.innerHeight - headerHeight - navHeight - topOffset - bottomPadding;
      
      // Get item height estimate based on view mode
      let itemHeight = 0;
      
      if (itemRef.current) {
        // Use actual height if available
        itemHeight = itemRef.current.offsetHeight;
      } else {
        // Fallback to estimates based on view mode
        if (viewMode === 'grid') {
          itemHeight = isMobile ? 170 : 190;
        } else if (viewMode === 'list') {
          itemHeight = isMobile ? 85 : 96;
        } else {
          itemHeight = isMobile ? 50 : 60;
        }
      }
      
      // Calculate gap size based on view mode
      const gapSize = viewMode === 'compact' ? 8 : 14;
      
      // Calculate max visible rows that fit in available height with gap
      const maxRows = Math.floor(availableHeight / (itemHeight + gapSize));
      
      // Ensure at least 1 row, with higher maximums for compact modes
      const maxAllowedRows = viewMode === 'compact' ? 
                            (isMobile ? 12 : 10) : 
                            (isMobile ? 8 : 6);
      
      return Math.max(1, Math.min(maxRows, maxAllowedRows));
    };

    // Initial calculation
    setRowCount(calculateRowCount());

    // Recalculate on resize
    const handleResize = () => {
      setRowCount(calculateRowCount());
    };

    // Recalculate when view mode changes
    const updateGridOnViewModeChange = () => {
      setTimeout(() => {
        setRowCount(calculateRowCount());
      }, 50);
    };
    
    window.addEventListener('resize', handleResize);
    updateGridOnViewModeChange();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode, isMobile]);

  // Wrap first child with ref
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
    <ScrollArea
      className={cn(
        "max-h-[calc(100vh-3.5rem)]",
        "transition-all duration-300 backdrop-blur-sm",
        activeFilter && "pt-2"
      )}
    >
      <div 
        ref={containerRef}
        className={cn(
          "overflow-x-auto overflow-y-hidden pb-4 px-2 scrollbar-hide"
        )}
      >
        <div 
          ref={gridRef}
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === 'list' && "grid grid-flow-col auto-cols-max gap-x-4 animate-stagger-fade",
            viewMode === 'compact' && "grid grid-flow-col gap-x-3 gap-y-2 animate-stagger-fade", 
            viewMode === 'grid' && "grid grid-flow-col gap-x-4 animate-stagger-fade",
            `grid-rows-${rowCount}`
          )}
          style={{
            // Using inline style for dynamic grid-template-rows
            gridTemplateRows: `repeat(${rowCount}, auto)`,
            // Add smooth scroll behavior
            scrollBehavior: 'smooth'
          }}
        >
          {modifiedChildren}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StickerCollectionGrid;
