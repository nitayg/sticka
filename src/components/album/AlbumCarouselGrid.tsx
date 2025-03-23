
import React from "react";
import { Album } from "@/lib/types";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import AlbumGridItem from "./AlbumGridItem";
import AddAlbumForm from "@/components/add-album-form";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

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
  const { containerRef, showLeftArrow, showRightArrow, scrollLeft, scrollRight } = useHorizontalScroll();
  const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
  
  // Check direction
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [isRtl, containerRef]);
  
  // Scroll to selected album when it changes
  React.useEffect(() => {
    if (containerRef.current && selectedAlbumId) {
      const selectedElement = containerRef.current.querySelector(`[data-album-id="${selectedAlbumId}"]`);
      if (selectedElement) {
        // Calculate scroll position
        const containerWidth = containerRef.current.offsetWidth;
        const elementOffset = isRtl 
          ? containerRef.current.scrollWidth - selectedElement.getBoundingClientRect().right + containerRef.current.getBoundingClientRect().right - containerWidth
          : selectedElement.getBoundingClientRect().left - containerRef.current.getBoundingClientRect().left;
        const scrollPosition = containerRef.current.scrollLeft + elementOffset - (containerWidth / 2) + (selectedElement.clientWidth / 2);
        
        containerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedAlbumId, isRtl, containerRef]);

  // Render albums in carousel style
  return (
    <div className="relative mt-2">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 py-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Add Album Button */}
        <div className="relative min-w-[120px] h-[180px] flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer group hover:border-primary/50 transition-colors">
          <AddAlbumForm iconOnly>
            <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground group-hover:text-primary transition-colors">
              <PlusCircle className="h-14 w-14" />
              <span className="text-sm mt-2">הוסף אלבום</span>
            </div>
          </AddAlbumForm>
        </div>
        
        {/* Album Items */}
        {albums.map((album) => (
          <div
            key={album.id}
            data-album-id={album.id}
            className="fb-story-item min-w-[120px] h-[180px]"
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
      
      {/* Navigation buttons - using the same UI as the StickerCollectionGrid */}
      {showLeftArrow && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md z-10"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {showRightArrow && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full opacity-90 shadow-md z-10"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default AlbumCarouselGrid;
