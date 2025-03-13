
import { ReactNode, useLayoutEffect, useState, useRef, Children, isValidElement } from 'react';
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

  useLayoutEffect(() => {
    const calculateRowCount = () => {
      const headerHeight = 56; // 3.5rem = MobileHeader height
      const paddingBottom = 16; // pb-4
      const paddingTop = activeFilter ? 8 : 0; // pt-2 if activeFilter
      const availableHeight = window.innerHeight - headerHeight - paddingBottom - paddingTop;

      // Get actual item height from the first rendered item
      let itemHeight = itemRef.current?.offsetHeight;
      
      if (!itemHeight) {
        // Fallback values if measurement fails
        if (viewMode === 'grid') {
          itemHeight = 200;
        } else if (viewMode === 'list') {
          itemHeight = 96;
        } else {
          itemHeight = 60;
        }
      }
      
      // Get gap size based on view mode and actual rendered grid
      let gapSize = 0;
      if (gridRef.current) {
        const computedStyle = window.getComputedStyle(gridRef.current);
        const rowGap = computedStyle.getPropertyValue('row-gap');
        gapSize = rowGap ? parseInt(rowGap, 10) : (viewMode === 'compact' ? 8 : 16);
      } else {
        gapSize = viewMode === 'compact' ? 8 : 16;
      }

      // Calculate max rows that can fit in the available height
      const maxRows = Math.floor(availableHeight / (itemHeight + gapSize));
      
      // Verify the calculation and reduce by 1 if needed to absolutely prevent overflow
      const calculatedRows = Math.max(1, maxRows);
      const totalHeight = calculatedRows * itemHeight + (calculatedRows - 1) * gapSize;
      
      if (totalHeight > availableHeight) {
        return Math.max(1, calculatedRows - 1);
      }
      
      return calculatedRows;
    };

    // Initial calculation with a small delay to ensure rendering
    const timeoutId = setTimeout(() => {
      setRowCount(calculateRowCount());
    }, 10);

    // Recalculate on window resize
    const handleResize = () => {
      setRowCount(calculateRowCount());
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewMode, activeFilter, children]); // Recalculate when children change

  // Wrap the first child with ref to measure its height
  let modifiedChildren = children;
  const childrenArray = Children.toArray(children);
  
  if (childrenArray.length > 0) {
    const firstChild = childrenArray[0];
    const restChildren = childrenArray.slice(1);
    
    if (isValidElement(firstChild)) {
      modifiedChildren = [
        <div key="first-child-wrapper" ref={itemRef} className="contents">
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
        activeFilter && "pt-2"
      )}
    >
      <div 
        ref={gridRef}
        className={cn(
          "transition-all duration-200 ease-in-out",
          viewMode === 'list' && "grid grid-flow-col auto-cols-max gap-x-4",
          viewMode === 'compact' && "grid grid-flow-col gap-x-4 gap-y-2", 
          viewMode === 'grid' && "grid grid-flow-col gap-x-4"
        )}
        style={{
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
          maxHeight: `calc(100vh - 3.5rem - ${16}px - ${activeFilter ? '8px' : '0px'})`
        }}
      >
        {modifiedChildren}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
