
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

  // חישוב דינמי של rowCount על פי גובה החלון
  useEffect(() => {
    const calculateLayout = () => {
      // גובה של כל פריט + מרווח
      const baseItemHeight = getBaseItemHeight();
      const gapSize = getGapSize();
      const itemHeightWithGap = baseItemHeight + gapSize;
      
      // חישוב גובה זמין (מסך מלא פחות פוטר והדר)
      const windowHeight = window.innerHeight;
      const headerHeight = 56; // גובה ההדר
      const footerHeight = 100; // גובה הפוטר כולל שוליים
      const availableHeight = windowHeight - (headerHeight + footerHeight);
      
      // מחשב את מספר השורות שיתאימו לגובה הזמין
      let maxRows = Math.floor(availableHeight / itemHeightWithGap);
      
      // מגביל את מספר השורות המקסימלי לפי סוג התצוגה
      const isDesktop = window.innerWidth >= 768;
      
      // הגדרת מינימום ומקסימום שורות לפי סוג התצוגה
      let minRows = 3;
      let maxAllowedRows = 10;
      
      if (isDesktop) {
        minRows = { grid: 5, compact: 8, list: 6 }[viewMode] || 5;
        maxAllowedRows = { grid: 8, compact: 12, list: 8 }[viewMode] || 8;
      } else {
        minRows = { grid: 3, compact: 5, list: 4 }[viewMode] || 3;
        maxAllowedRows = { grid: 5, compact: 8, list: 6 }[viewMode] || 6;
      }
      
      // מחשב את מספר השורות הסופי
      const finalRowCount = Math.max(minRows, Math.min(maxRows, maxAllowedRows));
      
      console.log(`View Mode: ${viewMode}, Window Height: ${windowHeight}px, Available Height: ${availableHeight}px, Item Height: ${itemHeightWithGap}px, Row Count: ${finalRowCount}`);
      
      setRowCount(finalRowCount);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [viewMode]);

  // גובה כל מדבקה ומרווחים לפי מצב תצוגה
  const getBaseItemHeight = (): number => {
    switch (viewMode) {
      case 'grid': return 138;
      case 'list': return 74;
      case 'compact': return 44;
      default: return 138;
    }
  };

  const getGapSize = (): number => {
    switch (viewMode) {
      case 'compact': return 4;
      case 'list': return 6;
      default: return 8;
    }
  };

  // התאמת ילדים עם ref
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
      className={cn(
        "overflow-x-auto pb-1 px-2 scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        viewMode === 'compact' && "max-h-full",
        viewMode === 'list' && "max-h-full",
        viewMode === 'grid' && "max-h-full",
        activeFilter && "pt-1"
      )}
      style={{ direction: 'rtl' }}
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
          gridTemplateRows: `repeat(${rowCount}, auto)`,
          gap: getGapSize() + 'px',
          direction: 'rtl',
          overflow: 'visible',
          paddingBottom: '40px' // הקטנת הפדינג בתחתית הגריד
        }}
      >
        {modifiedChildren}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
