
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AlbumHeader from "./album/AlbumHeader";
import { useInventoryUIStore } from "@/store/useInventoryUIStore";
import TabsContainer from "./album/TabsContainer";
import AlbumTitle from "./album/AlbumTitle";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import { useAlbumData } from "@/hooks/useAlbumData";
import { Album } from "@/lib/types";
import { REFRESH_INTERVAL } from "@/lib/sync/constants";
import AlbumEventHandler from "./album/AlbumEventHandler";
import EmptyState from "./EmptyState";
import FilterControls from "./album/FilterControls";

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

  // Fix: Add activeTab with a default value of "stickers"
  const { stickers, album, categories, teams, isLoading } = useAlbumData({
    selectedAlbumId,
    refreshKey,
    showAllAlbumStickers,
    activeTab: "stickers" // Added the missing required prop
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AlbumEventHandler onRefresh={handleRefresh} />

      <div className="px-4 pt-2 pb-2">
        <AlbumHeader
          album={album}
          stickers={stickers}
          selectedAlbum={selectedAlbumId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showImages={showImages}
          setShowImages={setShowImages}
          onRefresh={handleRefresh}
          albums={albums}
        />

        <AlbumTitle
          album={album}
          stickers={stickers}
          onSearch={setSearchQuery}
        />

        <FilterControls
          albums={albums}
          selectedAlbum={selectedAlbumId}
          handleAlbumChange={handleAlbumChange}
          // Fix: Remove the onTeamsManage prop as it's no longer needed
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <FilteredStickerContainer
          stickers={stickers}
          viewMode={viewMode}
          searchQuery={searchQuery}
          isLoading={isLoading}
          showImages={showImages}
          selectedAlbumId={selectedAlbumId}
        />
      </div>
    </div>
  );
};

export default AlbumView;
