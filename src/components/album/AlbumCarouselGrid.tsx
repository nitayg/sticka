
import React, { useRef, useEffect, useState } from "react";
import { Album } from "@/lib/types";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import AlbumGridItem from "./AlbumGridItem";
import AddAlbumForm from "@/components/add-album-form";

interface AlbumCarouselGridProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  onEdit: (albumId: string) => void;
}

const AlbumCarouselGrid = ({ 
  albums, 
  selectedAlbumId, 
  onAlbumChange,
  onEdit
}: AlbumCarouselGridProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
  
  // Check direction
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [isRtl]);
  
  // Scroll to selected album when it changes
  useEffect(() => {
    if (carouselRef.current && selectedAlbumId) {
      const selectedElement = carouselRef.current.querySelector(`[data-album-id="${selectedAlbumId}"]`);
      if (selectedElement) {
        // Calculate scroll position
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

  // Scroll functions
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

  // Check if arrows should be shown
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const checkScrollable = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScrollLeft = scrollWidth - clientWidth;
        
        // Update arrow state based on RTL
        if (isRtl) {
          setShowLeftArrow(Math.abs(scrollLeft) < maxScrollLeft - 10);
          setShowRightArrow(scrollLeft < -10);
        } else {
          setShowLeftArrow(scrollLeft > 10);
          setShowRightArrow(scrollLeft < maxScrollLeft - 10);
        }
      }
    };

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

  // Render albums in carousel style
  return (
    <div className="relative mt-2">
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 py-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add Album Button */}
        <div className="relative min-w-[90px] h-[160px] flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer group hover:border-primary/50 transition-colors">
          <AddAlbumForm iconOnly>
            <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground group-hover:text-primary transition-colors">
              <PlusCircle className="h-12 w-12" />
              <span className="text-sm mt-2">הוסף אלבום</span>
            </div>
          </AddAlbumForm>
        </div>
        
        {/* Album Items */}
        {albums.map((album) => (
          <div
            key={album.id}
            data-album-id={album.id}
            className="fb-story-item min-w-[90px] h-[160px]"
          >
            <AlbumGridItem
              id={album.id}
              name={album.name}
              coverImage={album.coverImage}
              isSelected={selectedAlbumId === album.id}
              onSelect={() => onAlbumChange(album.id)}
              onEdit={() => onEdit(album.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Navigation buttons */}
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

export default AlbumCarouselGrid;
