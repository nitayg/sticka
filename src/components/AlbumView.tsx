import { useState, useEffect, useMemo } from "react";
import { getAllAlbums } from "@/lib/data";
import { getStickersByAlbumId, stickerData } from "@/lib/sticker-operations";
import StickerCollection from "./StickerCollection";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import TabsContainer from "./album/TabsContainer";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("compact");
  const [showImages, setShowImages] = useState<boolean>(true);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"number" | "team" | "manage">("number");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showAllAlbumStickers, setShowAllAlbumStickers] = useState(false);
  
  const albums = getAllAlbums();
  
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbum) {
      setSelectedAlbum(albums[0].id);
    }
  }, [albums]);
  
  useEffect(() => {
    if (selectedAlbum) {
      const albumStickers = getStickersByAlbumId(selectedAlbum);
      setStickers(albumStickers);
      
      const event = new CustomEvent('albumChanged', { detail: { albumId: selectedAlbum } });
      window.dispatchEvent(event);
    }
  }, [selectedAlbum, refreshKey]);
  
  useEffect(() => {
    if (!showAllAlbumStickers) {
      setSelectedRange(null);
      setSelectedTeam(null);
    }
  }, [selectedAlbum, showAllAlbumStickers]);

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
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbum(albumId);
    setShowAllAlbumStickers(false);
  };

  const handleRangeSelect = (range: string | null) => {
    setSelectedRange(range);
  };

  const handleTeamSelect = (team: string | null) => {
    setSelectedTeam(team);
  };
  
  const handleTeamsManagement = () => {
    setActiveTab("manage");
    setShowAllAlbumStickers(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <AlbumHeader 
        albums={albums}
        selectedAlbum={selectedAlbum}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
        onRefresh={handleRefresh}
        onImportComplete={handleRefresh}
      />
      
      <FilterControls
        albums={albums}
        selectedAlbum={selectedAlbum}
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
        selectedAlbum={selectedAlbum}
        onRefresh={handleRefresh}
        activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
        showMultipleAlbums={showAllAlbumStickers || (activeTab === "manage" && selectedTeam !== null)}
      />
    </div>
  );
};

export default AlbumView;
