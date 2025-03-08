
import { useAlbumStore } from "@/store/useAlbumStore";
import AlbumHeader from "./album/AlbumHeader";
import FilterControls from "./album/FilterControls";
import TabsContainer from "./album/TabsContainer";
import FilteredStickerContainer from "./album/FilteredStickerContainer";
import AlbumEventHandler from "./album/AlbumEventHandler";
import { useAlbumData } from "@/hooks/useAlbumData";

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
  
  // Use the custom hook to fetch and compute album-related data
  const { 
    albums, 
    stickers, 
    transactionMap, 
    teams, 
    numberRanges, 
    teamLogos 
  } = useAlbumData({ 
    selectedAlbumId, 
    refreshKey, 
    activeTab, 
    showAllAlbumStickers 
  });
  
  // Get the selected album data for the AlbumEventHandler
  const selectedAlbumData = albums.find(album => album.id === selectedAlbumId);
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Event handling component - only render if an album is selected */}
      {selectedAlbumData && <AlbumEventHandler album={selectedAlbumData} />}
      
      {/* Album header with title and actions */}
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
      
      {/* Album selection and filters */}
      <FilterControls
        albums={albums}
        selectedAlbum={selectedAlbumId}
        handleAlbumChange={handleAlbumChange}
        onTeamsManage={handleTeamsManagement}
      />
      
      {/* Tab navigation and range/team selection */}
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
      
      {/* Filtered sticker collection */}
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
      />
    </div>
  );
};

export default AlbumView;
