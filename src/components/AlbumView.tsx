
import { useState, useEffect, useMemo } from "react";
import { getAllAlbums } from "@/lib/data";
import { getStickersByAlbumId, stickerData } from "@/lib/sticker-operations";
import StickerCollection from "./StickerCollection";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import TabsContainer from "./album/TabsContainer";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"number" | "team" | "manage">("number");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const albums = getAllAlbums();
  const categories = ["הכל", "שחקנים", "קבוצות", "אצטדיונים", "סמלים"];
  
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
    setSelectedRange(null);
    setSelectedTeam(null);
  }, [selectedAlbum]);

  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    // כשנמצאים בלשונית הניהול, אנחנו רוצים לראות את כל הקבוצות מכל האלבומים
    const stickersToCheck = activeTab === "manage" ? stickerData : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team) {
        teamSet.add(sticker.team);
      }
    });
    return Array.from(teamSet).sort();
  }, [stickers, activeTab, stickerData]);

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
    // כאן גם אנחנו רוצים לכלול את כל הלוגואים מכל האלבומים בלשונית הניהול
    const stickersToCheck = activeTab === "manage" ? stickerData : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team && sticker.teamLogo) {
        logoMap[sticker.team] = sticker.teamLogo;
      }
    });
    return logoMap;
  }, [stickers, activeTab, stickerData]);
  
  const getFilteredStickers = () => {
    // אם נבחרה קבוצה בלשונית הניהול, אנחנו רוצים להציג מדבקות מכל האלבומים
    let allStickers = activeTab === "manage" && selectedTeam ? stickerData : stickers;
    
    let filtered = allStickers.filter(sticker => 
      selectedCategory === "הכל" || sticker.category === selectedCategory
    );
    
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if ((activeTab === "team" || activeTab === "manage") && selectedTeam) {
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
  };

  const handleRangeSelect = (range: string | null) => {
    setSelectedRange(range);
  };

  const handleTeamSelect = (team: string | null) => {
    setSelectedTeam(team);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <AlbumHeader 
        albums={albums}
        selectedAlbum={selectedAlbum}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={handleRefresh}
        onImportComplete={handleRefresh}
      />
      
      <FilterControls
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        albums={albums}
        selectedAlbum={selectedAlbum}
        handleAlbumChange={handleAlbumChange}
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
      />
      
      <StickerCollection 
        stickers={filteredStickers}
        viewMode={viewMode}
        selectedAlbum={selectedAlbum}
        onRefresh={handleRefresh}
        activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
      />
    </div>
  );
};

export default AlbumView;
