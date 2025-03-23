
import { useRef, useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

export function useHorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const isMobile = useIsMobile();
  
  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      // Direction RTL affects scroll values
      const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
      
      if (isRtl) {
        setShowLeftArrow(Math.abs(scrollLeft) < (scrollWidth - clientWidth - 10));
        setShowRightArrow(scrollLeft < -10);
      } else {
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < (scrollWidth - clientWidth - 10));
      }
    }
  };

  useEffect(() => {
    checkScrollable();
    
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
  }, []);

  const scrollLeft = () => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
      const direction = isRtl ? 1 : -1; // Reversed for RTL
      
      containerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.8;
      const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
      const direction = isRtl ? -1 : 1; // Reversed for RTL
      
      containerRef.current.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return {
    containerRef,
    showLeftArrow: !isMobile && showLeftArrow,
    showRightArrow: !isMobile && showRightArrow,
    scrollLeft,
    scrollRight
  };
}
