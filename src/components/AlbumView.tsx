
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllAlbums } from "@/lib/queries";
import { getStickersByAlbumId, stickerData } from "@/lib/sticker-operations";
import StickerCollection from "./StickerCollection";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import TabsContainer from "./album/TabsContainer";
import { useAlbumStore } from "@/store/useAlbumStore";

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
  
  // Get all albums using React Query
  const { data: albums = [] } = useQuery({
    queryKey: ['albums', refreshKey],
    queryFn: fetchAllAlbums
  });
  
  // Get stickers for selected album
  const { data: stickers = [] } = useQuery({
    queryKey: ['stickers', selectedAlbumId, refreshKey],
    queryFn: () => selectedAlbumId ? getStickersByAlbumId(selectedAlbumId) : [],
    enabled: !!selectedAlbumId
  });
  
  // Set default album if none selected
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  // Listen for album data changes
  useEffect(() => {
    const handleAlbumDataChanged = () => {
      handleRefresh();
    };
    
    window.addEventListener('albumDataChanged', handleAlbumDataChanged);
    
    return () => {
      window.removeEventListener('albumDataChanged', handleAlbumDataChanged);
    };
  }, [handleRefresh]);
  
  // Calculate unique teams
  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    const stickersToCheck = activeTab === "manage" || showAllAlbumStickers ? stickerData : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team) {
        teamSet.add(sticker.team);
      }
    });
    return Array.from(teamSet).sort();
  }, [stickers, activeTab, stickerData, showAllAlbumStickers]);

  // Calculate number ranges
  const numberRanges = useMemo(() => {
    if (!stickers.length) return [];
    
    const ranges = new Set<string>();
    stickers.forEach(sticker => {
      const hundred = Math.floor(sticker.number / 100) * 100;
      const rangeEnd = hundred + 99;
      ranges.add(`${hundred}-${rangeEnd}`);
    });
    
    return Array.from(ranges).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });
  }, [stickers]);
  
  // Team logos map
  const teamLogos = useMemo(() => {
    const logoMap: Record<string, string> = {};
    const stickersToCheck = activeTab === "manage" || showAllAlbumStickers ? stickerData : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team && sticker.teamLogo) {
        logoMap[sticker.team] = sticker.teamLogo;
      }
    });
    return logoMap;
  }, [stickers, activeTab, stickerData, showAllAlbumStickers]);
  
  // Get filtered stickers based on current selections
  const getFilteredStickers = () => {
    let allStickers = (activeTab === "manage" && selectedTeam) || (showAllAlbumStickers && selectedTeam) 
      ? stickerData 
      : stickers;
    
    let filtered = allStickers;
    
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if (((activeTab === "team" || activeTab === "manage") && selectedTeam) || (showAllAlbumStickers && selectedTeam)) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    return filtered;
  };
  
  const filteredStickers = getFilteredStickers();

  return (
    <div className="space-y-4 animate-fade-in">
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
      
      <FilterControls
        albums={albums}
        selectedAlbum={selectedAlbumId}
        handleAlbumChange={handleAlbumChange}
        onTeamsManage={handleTeamsManagement}
      />
      
      <TabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        numberRanges={numberRanges}
        selectedRange={selectedRange}
        handleRangeSelect={handleRangeSelect}
        teams={teams}
        selectedTeam={selectedTeam}
        handleTeamSelect={handleTeamSelect}
        teamLogos={teamLogos}
        onTeamsUpdate={handleRefresh}
        showAllAlbums={showAllAlbumStickers}
      />
      
      <StickerCollection 
        stickers={filteredStickers}
        viewMode={viewMode}
        showImages={showImages}
        selectedAlbum={selectedAlbumId}
        onRefresh={handleRefresh}
        activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
        showMultipleAlbums={showAllAlbumStickers || (activeTab === "manage" && selectedTeam !== null)}
      />
    </div>
  );
};

export default AlbumView;
