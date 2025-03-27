
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Album } from "@/lib/types";
import { Grid, List, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlbumOrderStore } from "@/store/useAlbumOrderStore";
import { cn } from "@/lib/utils";
import AddAlbumForm from "@/components/add-album-form";

interface AlbumCarouselProps {
  albums: Album[];
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
  onAlbumEdit: (albumId: string) => void;
}

const AlbumCarousel: React.FC<AlbumCarouselProps> = ({
  albums,
  selectedAlbumId,
  onAlbumChange,
  onAlbumEdit,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { orderedAlbumIds } = useAlbumOrderStore();
  const [hasScrolledToSelection, setHasScrolledToSelection] = useState(false);

  const orderedAlbums = [...albums].sort((a, b) => {
    const indexA = orderedAlbumIds.indexOf(a.id);
    const indexB = orderedAlbumIds.indexOf(b.id);
    
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  // Scroll to selected album only once when component mounts or selection changes
  useEffect(() => {
    if (scrollContainerRef.current && selectedAlbumId && !hasScrolledToSelection) {
      const selectedButton = scrollContainerRef.current.querySelector(
        `[data-album-id="${selectedAlbumId}"]`
      ) as HTMLElement;

      if (selectedButton) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const buttonRect = selectedButton.getBoundingClientRect();

        if (
          buttonRect.left < containerRect.left ||
          buttonRect.right > containerRect.right
        ) {
          selectedButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
        
        setHasScrolledToSelection(true);
      }
    }
  }, [selectedAlbumId, hasScrolledToSelection]);

  // Reset scroll state if selectedAlbumId changes
  useEffect(() => {
    setHasScrolledToSelection(false);
  }, [selectedAlbumId]);

  // Memoize the album edit handler to prevent recreating it on every render
  const handleAlbumEditClick = useCallback(() => {
    if (selectedAlbumId && onAlbumEdit) {
      onAlbumEdit(selectedAlbumId);
    }
  }, [selectedAlbumId, onAlbumEdit]);

  return (
    <div className="relative w-full mb-4">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide py-2 gap-2"
        dir="rtl"
      >
        {orderedAlbums.map((album) => (
          <button
            key={album.id}
            data-album-id={album.id}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedAlbumId === album.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
            onClick={() => onAlbumChange(album.id)}
          >
            {album.name}
          </button>
        ))}
      </div>

      <div className="absolute -top-1 left-0 flex items-center gap-1">
        <AddAlbumForm iconOnly onAlbumAdded={handleAlbumEditClick}>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </AddAlbumForm>
      </div>
    </div>
  );
};

export default React.memo(AlbumCarousel);
