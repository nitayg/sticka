
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

  // חישוב מספר השורות בהתאם לגובה המסך
  useEffect(() => {
    const calculateLayout = () => {
      // גבהים קבועים
      const HEADER_HEIGHT = 56; // גובה כותרת
      const FOOTER_HEIGHT = 120; // גובה פוטר כולל מרווחים
      const GAP_SIZE = getGapSize();
      
      // חישוב גובה זמין במסך
      const windowHeight = window.innerHeight;
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '20px');
      
      // גובה זמין לגריד
      const availableHeight = windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT - safeAreaBottom - 20; // מרווח נוסף
      
      // גובה כל פריט לפי מצב תצוגה
      const baseItemHeight = getBaseItemHeight();
      const totalItemHeightWithGap = baseItemHeight + GAP_SIZE;
      
      // חישוב מקסימום שורות אפשרי
      const maxPossibleRows = Math.floor(availableHeight / totalItemHeightWithGap);
      
      // הגדרת מספר שורות מינימלי לכל מצב תצוגה
      const minRows = viewMode === 'compact' ? 6 : viewMode === 'list' ? 5 : 4;
      
      // הגבלת מקסימום שורות לפי מצב תצוגה
      const maxAllowedRows = viewMode === 'compact' ? 12 : viewMode === 'list' ? 9 : 6;
      
      // קביעת מספר השורות הסופי
      const finalRowCount = Math.max(minRows, Math.min(maxPossibleRows, maxAllowedRows));
      
      console.log(`Layout calculation: viewMode=${viewMode}, window=${windowHeight}px, available=${availableHeight}px, rowCount=${finalRowCount}, itemHeight=${baseItemHeight}px, gap=${GAP_SIZE}px`);
      
      setRowCount(finalRowCount);
    };
    
    // חישוב בטעינה ושינוי גודל חלון
    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [viewMode]);

  // פונקציות עזר לקביעת גבהים ומרווחים
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

  // הוספת ref לילד הראשון למדידת גדלים
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

  // חישוב מספר הילדים לוודא שאין שורות חסרות
  const childCount = Children.count(children);
  const columnsNeeded = Math.ceil(childCount / rowCount);

  return (
    <div
      className={cn(
        "overflow-auto pb-4 px-2 scrollbar-hide transition-all duration-300 backdrop-blur-sm",
        viewMode === 'compact' ? "max-h-full" : "max-h-full",
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
          viewMode === 'grid' && "grid grid-flow-col grid-card-gap animate-stagger-fade"
        )}
        style={{
          gridTemplateRows: `repeat(${rowCount}, auto)`,
          gridAutoColumns: `repeat(${columnsNeeded}, auto)`, 
          gap: getGapSize() + 'px',
          direction: 'rtl',
          position: 'relative',
          overflow: 'visible',
          paddingBottom: '120px', // מרווח משמעותי יותר בתחתית
          marginBottom: '40px' // מרווח נוסף לפוטר
        }}
      >
        {modifiedChildren}
      </div>
    </div>
  );
};

export default StickerCollectionGrid;
