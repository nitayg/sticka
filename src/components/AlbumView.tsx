
import { useState, useEffect, useMemo } from "react";
import { getAllAlbums } from "@/lib/data";
import { getStickersByAlbumId, stickerData } from "@/lib/sticker-operations";
import StickerCollection from "./StickerCollection";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import TabsContainer from "./album/TabsContainer";
import TeamManagementTab from "./TeamManagementTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"number" | "team" | "manage">("number");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showAllAlbumStickers, setShowAllAlbumStickers] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  
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
    // Reset filters when changing albums or tabs
    if (!showAllAlbumStickers) {
      setSelectedRange(null);
      setSelectedTeam(null);
    }
  }, [selectedAlbum, showAllAlbumStickers]);

  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    // For team management or when viewing all albums, we want to see teams from all albums
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
    // For team management or when viewing all albums, we want to include logos from all albums
    const stickersToCheck = activeTab === "manage" || showAllAlbumStickers ? stickerData : stickers;
    
    stickersToCheck.forEach(sticker => {
      if (sticker.team && sticker.teamLogo) {
        logoMap[sticker.team] = sticker.teamLogo;
      }
    });
    return logoMap;
  }, [stickers, activeTab, stickerData, showAllAlbumStickers]);
  
  const getFilteredStickers = () => {
    // When a team is selected in team mode or when viewing all albums, show stickers from all albums
    let allStickers = (activeTab === "team" && selectedTeam && showAllAlbumStickers) 
      ? stickerData 
      : stickers;
    
    let filtered = allStickers.filter(sticker => 
      selectedCategory === "הכל" || sticker.category === selectedCategory
    );
    
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if (activeTab === "team" && selectedTeam) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
      
      // If we're showing all albums, get stickers from all albums for this team
      if (showAllAlbumStickers) {
        filtered = stickerData.filter(sticker => sticker.team === selectedTeam);
      }
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
    
    // If a team is selected in team view, show stickers from all albums
    if (team && activeTab === "team") {
      setShowAllAlbumStickers(true);
    }
  };
  
  const handleTeamsManagement = () => {
    setIsTeamManagementOpen(true);
  };

  const handleTeamsUpdate = () => {
    handleRefresh();
    setIsTeamManagementOpen(false);
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
        selectedAlbum={selectedAlbum}
        onRefresh={handleRefresh}
        activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
        showMultipleAlbums={showAllAlbumStickers}
      />

      {/* Team Management Dialog */}
      <Dialog open={isTeamManagementOpen} onOpenChange={setIsTeamManagementOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ניהול קבוצות</DialogTitle>
          </DialogHeader>
          <TeamManagementTab
            teams={teams}
            teamLogos={teamLogos}
            onTeamSelect={handleTeamSelect}
            selectedTeam={selectedTeam}
            onTeamsUpdate={handleTeamsUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlbumView;
