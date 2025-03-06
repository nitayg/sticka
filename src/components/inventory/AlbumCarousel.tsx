
import React, { useRef, useEffect, useState } from "react";
import { Album } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface AlbumCarouselProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
}

const AlbumCarousel = ({ albums, selectedAlbumId, onAlbumChange }: AlbumCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
  
  // בדוק את כיוון האתר ואת הסימון של RTL
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [isRtl]);
  
  // גלול לאלבום הנבחר כאשר הוא משתנה
  useEffect(() => {
    if (carouselRef.current && selectedAlbumId) {
      const selectedElement = carouselRef.current.querySelector(`[data-album-id="${selectedAlbumId}"]`);
      if (selectedElement) {
        // חשב את המיקום לגלילה
        const containerWidth = carouselRef.current.offsetWidth;
        const elementOffset = isRtl 
          ? carouselRef.current.scrollWidth - selectedElement.getBoundingClientRect().right + carouselRef.current.getBoundingClientRect().right - containerWidth
          : selectedElement.getBoundingClientRect().left - carouselRef.current.getBoundingClientRect().left;
        const scrollPosition = carouselRef.current.scrollLeft + elementOffset - (containerWidth / 2) + (selectedElement.clientWidth / 2);
        
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedAlbumId, isRtl]);

  // פונקציות גלילה
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      const newScrollPosition = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollLeft = () => {
    scrollCarousel(isRtl ? 'right' : 'left');
  };

  const scrollRight = () => {
    scrollCarousel(isRtl ? 'left' : 'right');
  };

  // בדוק אם צריך להציג את החיצים
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        // עדכן את מצב החיצים בהתאם ל-RTL
        if (isRtl) {
          setShowLeftArrow(Math.abs(scrollLeft) < maxScrollLeft - 10);
          setShowRightArrow(scrollLeft < -10);
        } else {
          setShowLeftArrow(scrollLeft > 10);
          setShowRightArrow(scrollLeft < maxScrollLeft - 10);
        }
      }
    };

    // בדוק בעת הטעינה ובכל פעם שיש שינוי גלילה
    checkScrollable();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollable);
      window.addEventListener('resize', checkScrollable);
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', checkScrollable);
        window.removeEventListener('resize', checkScrollable);
      }
    };
  }, [isRtl]);

  // רנדר את האלבומים
  return (
    <div className="relative">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-3 py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {albums.map((album) => (
          <div
            key={album.id}
            data-album-id={album.id}
            className={cn(
              "min-w-[150px] cursor-pointer rounded-lg border p-3 transition-all duration-200 ease-in-out snap-start hover:bg-accent/50",
              selectedAlbumId === album.id ? "bg-accent shadow-md" : "bg-card"
            )}
            onClick={() => onAlbumChange(album.id)}
          >
            <div className="text-center space-y-2">
              {album.coverImage && (
                <div className="relative w-full h-20 overflow-hidden rounded">
                  <img 
                    src={album.coverImage} 
                    alt={album.name} 
                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="font-medium truncate">{album.name}</div>
              <div className="text-xs text-muted-foreground">{album.totalStickers} מדבקות</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* כפתורי ניווט */}
      {showLeftArrow && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {showRightArrow && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default AlbumCarousel;
