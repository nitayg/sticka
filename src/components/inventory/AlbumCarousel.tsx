
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Album as AlbumIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Album } from "@/lib/types";
import { Button } from "../ui/button";

interface AlbumCarouselProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
}

const AlbumCarousel = ({ albums, selectedAlbumId, onAlbumChange }: AlbumCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const checkScrollability = () => {
      if (!containerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      
      // רוחב התוכן הנראה בתוספת הרווח משני הצדדים
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    };

    // בדיקה ראשונית
    checkScrollability();
    
    // הוספת מאזינים לאירועים
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    
    // ניקוי מאזינים בעת סיום
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      }
    };
  }, [albums]);

  const scrollLeft = () => {
    if (!containerRef.current) return;
    
    // גלילה שמאלה - מכיוון שהכיוון הוא RTL, גלילה ימינה בפועל
    const scrollAmount = 200;
    const currentScroll = containerRef.current.scrollLeft;
    
    containerRef.current.scrollTo({
      left: currentScroll - scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!containerRef.current) return;
    
    // גלילה ימינה - מכיוון שהכיוון הוא RTL, גלילה שמאלה בפועל
    const scrollAmount = 200;
    const currentScroll = containerRef.current.scrollLeft;
    
    containerRef.current.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  // גלילה אל האלבום הנבחר כאשר הוא משתנה
  useEffect(() => {
    if (!containerRef.current || !selectedAlbumId) return;
    
    // מציאת האלמנט של האלבום הנבחר
    const selectedElement = containerRef.current.querySelector(`[data-album-id="${selectedAlbumId}"]`);
    
    if (selectedElement) {
      // חישוב המיקום לגלילה
      const container = containerRef.current;
      const selectedRect = selectedElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // בדיקה אם האלמנט הנבחר נמצא מחוץ לטווח הנראה
      if (selectedRect.left < containerRect.left || selectedRect.right > containerRect.right) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedAlbumId]);

  return (
    <div className="relative flex items-center w-full mb-2">
      {showLeftArrow && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-0 z-10 bg-background/80 backdrop-blur-sm shadow-md" 
          onClick={scrollLeft}
          aria-label="גלול שמאלה"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        ref={containerRef} 
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {albums.map(album => (
          <div
            key={album.id}
            data-album-id={album.id}
            onClick={() => onAlbumChange(album.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md border whitespace-nowrap cursor-pointer transition-colors",
              "text-sm font-medium hover:bg-secondary/70 flex-shrink-0",
              selectedAlbumId === album.id 
                ? "bg-interactive/10 border-interactive text-interactive" 
                : "bg-card border-border"
            )}
          >
            {album.coverImage ? (
              <img 
                src={album.coverImage} 
                alt={album.name} 
                className="h-5 w-5 object-cover rounded-sm" 
              />
            ) : (
              <AlbumIcon className="h-4 w-4 opacity-70" />
            )}
            <span>{album.name}</span>
          </div>
        ))}
      </div>
      
      {showRightArrow && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 z-10 bg-background/80 backdrop-blur-sm shadow-md" 
          onClick={scrollRight}
          aria-label="גלול ימינה"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default AlbumCarousel;
