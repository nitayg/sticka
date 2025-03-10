
import { useEffect, useState } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import AlbumEventHandler from "./album/AlbumEventHandler";
import { useAlbumData } from "@/hooks/useAlbumData";
import EmptyState from "./EmptyState";
import { Album } from "lucide-react";
import AddAlbumForm from "./add-album-form";

const AlbumView = () => {
  const {
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    activeTab,
    setActiveTab,
    selectedAlbumId,
    selectedRange,
    selectedTeam,
    showAllAlbumStickers,
    refreshKey,
    handleRefresh,
    handleAlbumChange,
    handleRangeSelect,
    handleTeamSelect,
    handleTeamsManagement
  } = useAlbumStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use the custom hook to fetch and compute album-related data
  const { 
    albums, 
    stickers, 
    transactionMap, 
    teams, 
    numberRanges, 
    teamLogos,
    isLoading
  } = useAlbumData({ 
    selectedAlbumId, 
    refreshKey, 
    activeTab, 
    showAllAlbumStickers 
  });
  
  // Get the selected album data for the AlbumEventHandler
  const selectedAlbumData = albums.find(album => album.id === selectedAlbumId);
  
  // Set selected album from local storage if available
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      // Try to get last selected album from localStorage
      const lastSelectedAlbum = localStorage.getItem('lastSelectedAlbumId');
      if (lastSelectedAlbum && albums.some(album => album.id === lastSelectedAlbum)) {
        handleAlbumChange(lastSelectedAlbum);
      } else {
        handleAlbumChange(albums[0].id);
      }
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Store selected album ID when it changes
  useEffect(() => {
    if (selectedAlbumId) {
      localStorage.setItem('lastSelectedAlbumId', selectedAlbumId);
    }
  }, [selectedAlbumId]);
  
  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (albums.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in p-4">
        <EmptyState
          icon={<Album className="h-12 w-12" />}
          title="אין אלבומים פעילים"
          description="הוסף אלבום חדש כדי להתחיל"
          action={
            <AddAlbumForm onAlbumAdded={handleRefresh} />
          }
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Event handling component - only render if an album is selected */}
      {selectedAlbumData && <AlbumEventHandler album={selectedAlbumData} />}
      
      {/* Album selection grid (Facebook Stories style) */}
      <FilterControls
        albums={albums}
        selectedAlbum={selectedAlbumId}
        handleAlbumChange={handleAlbumChange}
        onTeamsManage={handleTeamsManagement}
      />
      
      {/* Album header with title, search and actions */}
      <AlbumHeader 
        albums={albums}
        selectedAlbum={selectedAlbumId}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
        onRefresh={handleRefresh}
        onImportComplete={handleRefresh}
        onSearch={handleSearch}
      />
      
      {/* Filtered sticker collection with horizontal scrolling */}
      <FilteredStickerContainer
        stickers={stickers}
        selectedAlbumId={selectedAlbumId}
        activeTab={activeTab}
        selectedRange={selectedRange}
        selectedTeam={selectedTeam}
        showAllAlbumStickers={showAllAlbumStickers}
        viewMode={viewMode}
        showImages={showImages}
        onRefresh={handleRefresh}
        transactionMap={transactionMap}
        searchQuery={searchQuery}
        useHorizontalScroll={true}
      />
    </div>
  );
};

export default AlbumView;
