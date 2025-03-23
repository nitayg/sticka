
import React from "react";
import { Album } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import AlbumGridItem from "./AlbumGridItem";
import AddAlbumForm from "@/components/add-album-form";
import HorizontalScrollContainer from "@/components/ui/horizontal-scroll-container";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isRtl = document.dir === 'rtl' || document.documentElement.lang === 'he';
  
  // Render albums in carousel style
  return (
    <div className="relative mt-2">
      <HorizontalScrollContainer 
        className="gap-2 py-1 px-1"
        rtl={isRtl}
        showArrows={!isMobile}
        arrowsPosition="sides"
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
            className="fb-story-item min-w-[120px] h-[180px] flex-shrink-0 snap-start"
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
      </HorizontalScrollContainer>
    </div>
  );
};

export default AlbumCarouselGrid;
