
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlbumHeader from "./album/AlbumHeader";
import { useInventoryUIStore } from "@/store/useInventoryUIStore";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import { useAlbumData } from "@/hooks/useAlbumData";
import { Album } from "@/lib/types";
import { REFRESH_INTERVAL } from "@/lib/sync/constants";
import EmptyState from "./EmptyState";
import FilterControls from "./album/FilterControls";
import { getAllAlbums } from "@/lib/album-operations";

interface AlbumViewProps {
  selectedAlbumId: string;
  albums: Album[];
  handleAlbumChange: (albumId: string) => void;
  showAllAlbumStickers?: boolean;
}

const AlbumView = ({
  selectedAlbumId,
  albums,
  handleAlbumChange,
  showAllAlbumStickers = false,
}: AlbumViewProps) => {
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const viewMode = useInventoryUIStore((state) => state.viewMode);
  const setViewMode = useInventoryUIStore((state) => state.setViewMode);
  const showImages = useInventoryUIStore((state) => state.showImages);
  const setShowImages = useInventoryUIStore((state) => state.setShowImages);
  const [searchQuery, setSearchQuery] = useState("");

  // Fix: Change the activeTab value from "stickers" to "number" to match the expected type
  const { stickers, transactionMap, isLoading } = useAlbumData({
    selectedAlbumId,
    refreshKey,
    showAllAlbumStickers,
    activeTab: "number" // Changed from "stickers" to "number"
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    queryClient.invalidateQueries({ queryKey: ["stickers"] });
    queryClient.invalidateQueries({ queryKey: ["albums"] });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  };

  useEffect(() => {
    // Set up auto-refresh
    const refreshInterval = setInterval(() => {
      handleRefresh();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  if (!selectedAlbumId || albums.length === 0) {
    return (
      <EmptyState
        title="אין אלבומים זמינים"
        description="הוסף אלבום חדש כדי להתחיל"
        icon="album"
      />
    );
  }
  
  // Find the selected album
  const selectedAlbumData = albums.find(a => a.id === selectedAlbumId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-2 pb-2">
        <AlbumHeader
          albums={albums}
          selectedAlbum={selectedAlbumId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
          onRefresh={handleRefresh}
          onImportComplete={handleRefresh}
        />

        <AlbumTitle
          selectedAlbumData={selectedAlbumData}
        />

        <FilterControls
          albums={albums}
          selectedAlbum={selectedAlbumId}
          handleAlbumChange={handleAlbumChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <FilteredStickerContainer
          stickers={stickers}
          viewMode={viewMode}
          showImages={showImages}
          isLoading={isLoading}
          selectedAlbumId={selectedAlbumId}
          showAllAlbumStickers={showAllAlbumStickers}
          onRefresh={handleRefresh}
          transactionMap={transactionMap || {}}
        />
      </div>
    </div>
  );
};

// For standalone use when no props are provided (like in Index.tsx)
const AlbumViewWithState = (props: Partial<AlbumViewProps>) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(() => {
    // Try to get the last selected album from localStorage
    const stored = localStorage.getItem('selectedAlbumId');
    return stored || "";
  });
  const albums = getAllAlbums();
  
  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbumId(albumId);
    localStorage.setItem('selectedAlbumId', albumId);
  };
  
  // If no albums are available but we have a selected ID, reset it
  useEffect(() => {
    if (selectedAlbumId && albums.length > 0 && !albums.some(a => a.id === selectedAlbumId)) {
      handleAlbumChange(albums[0]?.id || "");
    }
    
    // If we have albums but no selection, select the first one
    if (!selectedAlbumId && albums.length > 0) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId]);
  
  return (
    <AlbumView
      selectedAlbumId={props.selectedAlbumId || selectedAlbumId}
      albums={props.albums || albums}
      handleAlbumChange={props.handleAlbumChange || handleAlbumChange}
      showAllAlbumStickers={props.showAllAlbumStickers}
    />
  );
};

export default AlbumViewWithState;
