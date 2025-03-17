
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

  // Calculate optimal row count based on available height and view mode
  useEffect(() => {
    const calculateRowCount = () => {
      // Account for all elements above the grid
      const headerHeight = 180; // Header + filters + stats + title
      const availableHeight = window.innerHeight - headerHeight;
      
      // Estimate item height based on view mode and get actual height if available
      let itemHeight;
      if (viewMode === 'grid') {
        itemHeight = 200; // Card view height estimate
      } else if (viewMode === 'list') {
        itemHeight = 82; // List view height estimate (reduced from 96)
      } else {
        itemHeight = 50; // Compact view height estimate (reduced from 60)
      }
      
      // Calculate gap between rows based on view mode
      const gapSize = viewMode === 'compact' ? 6 : 12; // Reduced gaps
      
      // Calculate max rows that fit in available height with gap
      // Subtract space for the last row's gap
      const maxRows = Math.floor((availableHeight - gapSize) / (itemHeight + gapSize));
      
      // Ensure at least 1 row, maximum 12 rows for compact view, 8 for others
      const maxAllowedRows = viewMode === 'compact' ? 12 : 8;
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
        "max-h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-hidden pb-2 px-2", // Reduced bottom padding
        "scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        activeFilter && "pt-1" // Reduced top padding when filter is active
      )}
    >
      <div 
        ref={gridRef}
        className={cn(
          "transition-all duration-300 ease-in-out",
          viewMode === 'list' && "grid grid-flow-col auto-cols-max gap-x-3 gap-y-2 animate-stagger-fade", // Reduced gaps
          viewMode === 'compact' && "grid grid-flow-col gap-x-3 gap-y-1 animate-stagger-fade", // Reduced gaps even more for compact
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
