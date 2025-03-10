
import { useRef, useState, useEffect, ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollableGridProps {
  children: ReactNode;
  className?: string;
}

const HorizontalScrollableGrid = ({ children, className }: HorizontalScrollableGridProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Check if arrows should be shown
  const checkArrows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Show left arrow if we can scroll back
    setShowLeftArrow(scrollLeft > 20);
    
    // Show right arrow if we can scroll forward
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkArrows);
      
      // Initial check
      checkArrows();
      
      // Check arrows when window is resized
      window.addEventListener("resize", checkArrows);
    }
    
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkArrows);
      }
      window.removeEventListener("resize", checkArrows);
    };
  }, []);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        container.scrollBy({ left: 100, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        container.scrollBy({ left: -100, behavior: "smooth" });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  // Mouse/touch drag functionality
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Mouse or touch position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    
    setStartX(clientX);
    setScrollLeft(container.scrollLeft);
  };
  
  const stopDrag = () => {
    setIsDragging(false);
  };
  
  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Mouse or touch position
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    
    // Calculate distance and scroll
    const x = clientX - startX;
    container.scrollLeft = scrollLeft - x;
  };
  
  // Arrow click handlers
  const scrollLeft10Percent = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.3;
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };
  
  const scrollRight10Percent = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.3;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  
  return (
    <div className="relative group">
      {/* Left arrow */}
      {showLeftArrow && (
        <button
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 flex items-center justify-center"
          onClick={scrollLeft10Percent}
          aria-label="Scroll left"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      )}
      
      {/* Right arrow */}
      {showRightArrow && (
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 flex items-center justify-center"
          onClick={scrollRight10Percent}
          aria-label="Scroll right"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto scrollbar-hide",
          "pb-4 pt-1 px-1", // Add some padding to ensure content isn't hidden by arrows
          "cursor-grab active:cursor-grabbing",
          className
        )}
        onMouseDown={startDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onMouseMove={onDrag}
        onTouchStart={startDrag}
        onTouchEnd={stopDrag}
        onTouchMove={onDrag}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScrollableGrid;
