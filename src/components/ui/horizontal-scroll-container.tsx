
import React, { useRef, useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HorizontalScrollContainerProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  hideScrollbar?: boolean;
  showArrows?: boolean;
  rtl?: boolean;
  arrowsPosition?: "sides" | "bottom";
  scrollAmount?: number; // Percentage of container width to scroll
}

const HorizontalScrollContainer = ({
  children,
  className,
  itemClassName,
  hideScrollbar = true,
  showArrows = true,
  rtl = true, // Default to RTL for Hebrew
  arrowsPosition = "sides",
  scrollAmount = 75, // Default to 75% of container width
}: HorizontalScrollContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const isMobile = useIsMobile();

  // Set direction and check scrollability
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = rtl ? 'rtl' : 'ltr';
      checkScrollable();
    }
  }, [rtl, children]);

  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      
      // Update arrow state based on RTL
      if (rtl) {
        setShowLeftArrow(Math.abs(scrollLeft) < maxScrollLeft - 10);
        setShowRightArrow(scrollLeft < -10);
      } else {
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < maxScrollLeft - 10);
      }
    }
  };

  // Scroll functions
  const scrollContainer = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmountPx = containerRef.current.clientWidth * (scrollAmount / 100);
      const newScrollPosition = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmountPx : scrollAmountPx);
      
      containerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollLeft = () => {
    scrollContainer(rtl ? 'right' : 'left');
  };

  const scrollRight = () => {
    scrollContainer(rtl ? 'left' : 'right');
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollable);
      window.addEventListener('resize', checkScrollable);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollable);
        window.removeEventListener('resize', checkScrollable);
      }
    };
  }, [rtl]);

  // Don't show arrows on mobile
  const shouldShowArrows = showArrows && !isMobile;

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className={cn(
          "flex overflow-x-auto",
          hideScrollbar && "scrollbar-hide",
          "snap-x snap-mandatory",
          className
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      
      {shouldShowArrows && showLeftArrow && arrowsPosition === "sides" && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md z-10 bg-background/80 backdrop-blur-sm border border-border/40"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {shouldShowArrows && showRightArrow && arrowsPosition === "sides" && (
        <Button
          size="icon"
          variant="secondary" 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md z-10 bg-background/80 backdrop-blur-sm border border-border/40"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {shouldShowArrows && arrowsPosition === "bottom" && (
        <div className="flex justify-center gap-2 mt-2">
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "rounded-full h-8 w-8",
              !showLeftArrow && "opacity-50 cursor-not-allowed"
            )}
            onClick={scrollLeft}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "rounded-full h-8 w-8",
              !showRightArrow && "opacity-50 cursor-not-allowed"
            )}
            onClick={scrollRight}
            disabled={!showRightArrow}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HorizontalScrollContainer;
