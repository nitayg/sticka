
import { ReactNode, useEffect, useState, useRef, Children, isValidElement } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  // גבהים קבועים (תתאים אם צריך)
  const HEADER_HEIGHT = 56; // h-14
  const ALBUM_GRID_HEIGHT = 0; // 0 אם אין גריד אלבומים, או תשנה אם יש
  const GAP_ABOVE_STICKER_GRID = 20; // רווח קבוע, שנה אם שונה
  const FOOTER_HEIGHT = 120; // כולל pb-24 ו-safe-area-inset-bottom - הגדלתי את זה מ-96 ל-120
  const TOTAL_FIXED_HEIGHT = HEADER_HEIGHT + ALBUM_GRID_HEIGHT + GAP_ABOVE_STICKER_GRID + FOOTER_HEIGHT;

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

  // חישוב דינמי של rowCount עם התאמה ל-Safe Area
  useEffect(() => {
    const calculateLayout = () => {
      // קבלת גובה החלון ו-Safe Area
      const windowHeight = window.innerHeight;
      const safeAreaBottom = 20; // קבוע במקום חישוב שעלול להיות לא מדויק

      const availableHeight = windowHeight - (TOTAL_FIXED_HEIGHT + safeAreaBottom);

      const baseItemHeight = getBaseItemHeight();
      const gapSize = getGapSize();
      const totalItemHeightWithGaps = baseItemHeight + gapSize;

      // חישוב מספר השורות המקסימלי
      const maxRows = Math.floor(availableHeight / totalItemHeightWithGaps);
      
      // קביעת מינימום שורות לפי מצב תצוגה
      const minRows = { grid: 3, compact: 5, list: 4 }[viewMode] || 3;
      
      // הגבלת מקסימום שורות - מקטין את זה כדי למנוע חיתוך
      const maxAllowedRows = { compact: 10, list: 5, grid: 4 }[viewMode] || 4;

      const finalRowCount = Math.max(minRows, Math.min(maxRows, maxAllowedRows));

      console.log(`View Mode: ${viewMode}, Window Height: ${windowHeight}px, Safe Area Bottom: ${safeAreaBottom}px, Available Height: ${availableHeight}px, Row Count: ${finalRowCount}, Total Height Needed: ${(baseItemHeight + gapSize) * finalRowCount}px`);

      setRowCount(finalRowCount);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [viewMode]);

  // Check scroll buttons visibility
  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const checkScrollButtons = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const container = containerRef.current;
    container.addEventListener('scroll', checkScrollButtons);
    checkScrollButtons(); // Initial check

    window.addEventListener('resize', checkScrollButtons);
    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [isMobile]);

  // Scroll handlers
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Mouse hover handlers for scroll buttons
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
    
    const container = containerRef.current;
    const { left, width } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const hoverZoneWidth = width * 0.1; // 10% of the container width
    
    // Show left button when hovering over left 10% of the grid
    setIsHoveringLeft(mouseX <= hoverZoneWidth && showLeftScroll);
    
    // Show right button when hovering over right 10% of the grid
    setIsHoveringRight(mouseX >= width - hoverZoneWidth && showRightScroll);
  };
  
  const handleMouseLeave = () => {
    setIsHoveringLeft(false);
    setIsHoveringRight(false);
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
      ref={containerRef}
      className={cn(
        "overflow-x-auto pb-4 px-2 scrollbar-hide transition-all duration-300 backdrop-blur-sm relative",
        viewMode === 'compact' && "max-h-full",
        viewMode === 'list' && "max-h-full",
        viewMode === 'grid' && "max-h-full",
        activeFilter && "pt-1"
      )}
      style={{ direction: 'rtl', position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
          overflow: 'visible', // מונע חיתוך של תאים בשורה האחרונה
          paddingBottom: '80px' // מוסיף פדינג בתחתית הגריד
        }}
      >
        {modifiedChildren}
      </div>

      {/* Full-height scroll buttons - desktop only */}
      {!isMobile && showLeftScroll && (
        <div 
          className={cn(
            "hidden lg:flex absolute left-0 top-0 h-full w-10 z-10 items-center justify-center",
            "bg-gradient-to-r from-black/50 to-transparent",
            "transition-opacity duration-300",
            isHoveringLeft ? "opacity-100" : "opacity-0"
          )}
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} className="text-white" />
        </div>
      )}
      
      {!isMobile && showRightScroll && (
        <div 
          className={cn(
            "hidden lg:flex absolute right-0 top-0 h-full w-10 z-10 items-center justify-center",
            "bg-gradient-to-l from-black/50 to-transparent",
            "transition-opacity duration-300",
            isHoveringRight ? "opacity-100" : "opacity-0"
          )}
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default StickerCollectionGrid;
