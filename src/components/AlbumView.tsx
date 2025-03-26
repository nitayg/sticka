
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import { getAllAlbums } from "@/lib/data";
import { Album } from "@/lib/types";
import AlbumHeader from "./album/AlbumHeader";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import AlbumCarouselGrid from "./album/AlbumCarouselGrid";
import EditAlbumForm from "./add-album-form";
import AlbumEventHandler from "./album/AlbumEventHandler";
import { useAlbumOrderStore } from "@/store/useAlbumOrderStore";

const AlbumView = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<string | null>(null);
  const { selectedAlbumId, setSelectedAlbumId, viewMode, setViewMode, showImages, setShowImages } = useAlbumStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const { orderedAlbumIds, initializeOrder } = useAlbumOrderStore();
  
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  // Get all albums and update state
  useEffect(() => {
    let allAlbums = getAllAlbums();
    
    // Sort albums by the order in orderedAlbumIds
    if (orderedAlbumIds.length > 0) {
      allAlbums = [...allAlbums].sort((a, b) => {
        const indexA = orderedAlbumIds.indexOf(a.id);
        const indexB = orderedAlbumIds.indexOf(b.id);
        
        // If album is not in the orderedAlbumIds, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    }
    
    setAlbums(allAlbums);
    
    // If no album is selected yet and we have albums, select the first one
    if (allAlbums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(allAlbums[0].id);
    }
    
    // Initialize order if needed
    initializeOrder();
  }, [selectedAlbumId, setSelectedAlbumId, refreshKey, orderedAlbumIds, initializeOrder]);
  
  useEffect(() => {
    const handleAlbumDataChanged = () => {
      handleRefresh();
    };
    
    window.addEventListener('albumDataChanged', handleAlbumDataChanged);
    return () => {
      window.removeEventListener('albumDataChanged', handleAlbumDataChanged);
    };
  }, [handleRefresh]);
  
  const handleAlbumChange = useCallback((albumId: string) => {
    setSelectedAlbumId(albumId);
  }, [setSelectedAlbumId]);
  
  const handleEditAlbum = useCallback((albumId: string) => {
    setAlbumToEdit(albumId);
    setShowEditForm(true);
  }, []);
  
  const handleSaveAlbum = useCallback(() => {
    setShowEditForm(false);
    handleRefresh();
    setAlbumToEdit(null);
  }, [handleRefresh]);
  
  // If no albums, show empty state
  if (albums.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center">אין אלבומים</h1>
        <p className="text-center mt-2">הוסף אלבום חדש כדי להתחיל</p>
        <div className="flex justify-center mt-4">
          <EditAlbumForm onAlbumAdded={handleSaveAlbum} />
        </div>
      </div>
    );
  }
  
  // Find the selected album
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId) || albums[0];
  
  return (
    <>
      {selectedAlbum && <AlbumEventHandler album={selectedAlbum} onDataChange={handleRefresh} />}
      
      <div className="flex flex-col h-full pt-14 pb-16">
        <AlbumHeader 
          albums={[selectedAlbum]} 
          onRefresh={handleRefresh}
        />
        
        <div className="px-2">
          <AlbumCarouselGrid 
            albums={albums}
            selectedAlbumId={selectedAlbumId}
            onAlbumChange={handleAlbumChange}
            onEdit={handleEditAlbum}
          />
        </div>
        
        <FilteredStickerContainer 
          stickers={[]} 
          selectedAlbumId={selectedAlbumId}
          activeTab="number"
          selectedRange={null}
          selectedTeam={null}
          showAllAlbumStickers={false}
          viewMode={viewMode}
          showImages={showImages}
          onRefresh={handleRefresh}
          transactionMap={{}}
        />
      </div>
      
      {showEditForm && albumToEdit && (
        <EditAlbumForm 
          onAlbumAdded={handleSaveAlbum}
          albumId={albumToEdit}
        />
      )}
    </>
  );
};

export default AlbumView;
