
import React, { useRef, useEffect, useState } from "react";
import { Album } from "@/lib/types";
import { ChevronLeft, ChevronRight, PlusCircle, Pencil, Check, X } from "lucide-react";
import { Button } from "../ui/button";
import AlbumGridItem from "./AlbumGridItem";
import AddAlbumForm from "@/components/add-album-form";
import { useAlbumOrderStore } from "@/store/useAlbumOrderStore";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";

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
  
  // Album order state
  const { 
    orderedAlbumIds, 
    isEditModeActive,
    reorderAlbum,
    toggleEditMode,
    setEditMode,
    initializeOrder
  } = useAlbumOrderStore();
  
  // Order the albums based on our stored order
  const orderedAlbums = [...albums].sort((a, b) => {
    const indexA = orderedAlbumIds.indexOf(a.id);
    const indexB = orderedAlbumIds.indexOf(b.id);
    
    // If album not in order list, put at end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
  
  // Initialize album order if needed
  useEffect(() => {
    initializeOrder();
  }, [albums, initializeOrder]);
  
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

  // Handle drag end event
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // If position changed
    if (source.index !== destination.index) {
      reorderAlbum(source.index, destination.index);
    }
  };

  const handleCancel = () => {
    initializeOrder(); // Reset to original order
    setEditMode(false);
  };

  // Render albums in carousel style
  return (
    <div className="relative mt-2">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="album-carousel" direction="horizontal">
          {(provided) => (
            <div 
              ref={(el) => {
                // Assign both refs
                provided.innerRef(el);
                // @ts-ignore - This is fine, we're just assigning multiple refs
                carouselRef.current = el;
              }}
              className={cn(
                "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 py-1 px-1",
                isEditModeActive && "pb-8" // Extra space for instruction text
              )}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              {...provided.droppableProps}
            >
              {/* Add Album Button */}
              <div className="relative min-w-[120px] h-[180px] flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer group hover:border-primary/50 transition-colors">
                <AddAlbumForm iconOnly onAlbumAdded={initializeOrder}>
                  <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground group-hover:text-primary transition-colors">
                    <PlusCircle className="h-14 w-14" />
                    <span className="text-sm mt-2">הוסף אלבום</span>
                  </div>
                </AddAlbumForm>

                {/* Edit Button */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {!isEditModeActive ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                      onClick={toggleEditMode}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-green-800 hover:bg-green-700 transition-colors"
                        onClick={toggleEditMode}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-red-800 hover:bg-red-700 transition-colors"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Album Items */}
              {orderedAlbums.map((album, index) => (
                <Draggable 
                  key={album.id} 
                  draggableId={album.id} 
                  index={index}
                  isDragDisabled={!isEditModeActive}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-album-id={album.id}
                      className={cn(
                        "fb-story-item min-w-[120px] h-[180px] transition-all",
                        snapshot.isDragging && "opacity-80 shadow-lg z-10"
                      )}
                      style={{
                        ...provided.draggableProps.style,
                        cursor: isEditModeActive ? 'grab' : 'pointer'
                      }}
                    >
                      <AlbumGridItem
                        id={album.id}
                        name={album.name}
                        coverImage={album.coverImage}
                        isSelected={selectedAlbumId === album.id}
                        onSelect={() => !isEditModeActive && onAlbumChange(album.id)}
                        onEdit={() => !isEditModeActive && onEdit(album.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Reordering instructions */}
      {isEditModeActive && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-sm text-muted-foreground">
          גרור כדי לשנות סדר
        </div>
      )}
      
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
