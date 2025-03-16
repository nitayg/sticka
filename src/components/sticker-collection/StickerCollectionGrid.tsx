
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
  const itemRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateRowCount = () => {
      // Ajust header height based on mobile/desktop and if filter is active
      const headerHeight = isMobile 
        ? (activeFilter ? 220 : 180) 
        : (activeFilter ? 160 : 120);
      
      const availableHeight = window.innerHeight - headerHeight;
      
      // Estimate item height based on view mode
      let itemHeight;
      if (viewMode === 'grid') {
        itemHeight = 200; // Card view height estimate
      } else if (viewMode === 'list') {
        itemHeight = isMobile ? 88 : 96; // List view height estimate, slightly smaller on mobile
      } else {
        itemHeight = isMobile ? 54 : 60; // Compact view height estimate, smaller on mobile
      }
      
      // Calculate max rows that fit in available height with gap
      const gapSize = viewMode === 'compact' ? 8 : 16; // Smaller gap for compact view
      const maxRows = Math.floor(availableHeight / (itemHeight + gapSize));
      
      // Ensure at least 1 row, maximum 8 rows (or 12 for compact view)
      const maxAllowedRows = viewMode === 'compact' ? 12 : 8;
      return Math.max(1, Math.min(maxRows, maxAllowedRows));
    };

    // Set initial row count and recalculate whenever window size changes
    const updateRowCount = () => {
      setRowCount(calculateRowCount());
    };
    
    // Run on mount and whenever dependencies change
    updateRowCount();
    
    // Update row count on window resize
    window.addEventListener('resize', updateRowCount);
    return () => window.removeEventListener('resize', updateRowCount);
  }, [viewMode, activeFilter, isMobile]);

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
    <div 
      ref={containerRef}
      className={cn(
        "max-h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-hidden pb-4 px-2",
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        activeFilter && "pt-1", // Reduced padding top when filter is active
        isMobile && "px-1" // Smaller padding on mobile
      )}
    >
      <div 
        ref={gridRef}
        className={cn(
          "transition-all duration-300 ease-in-out",
          viewMode === 'list' && "grid grid-flow-col auto-cols-max gap-x-3 animate-stagger-fade", // Reduced gap
          viewMode === 'compact' && "grid grid-flow-col gap-x-3 gap-y-1.5 animate-stagger-fade", // Reduced gaps
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
  );
};

export default StickerCollectionGrid;
