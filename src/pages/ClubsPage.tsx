
import { useState, useMemo, useEffect } from "react";
import { getStickerData } from "@/lib/stickers";
import ClubsList from "@/components/clubs/ClubsList";
import ClubsSingleView from "@/components/clubs/ClubsSingleView";
import ClubsHeader from "@/components/clubs/ClubsHeader";
import { Shield } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const ClubsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Extract unique team data from all stickers
  const teamsData = useMemo(() => {
    const allStickers = getStickerData();
    const teamsMap = new Map();
    
    allStickers.forEach(sticker => {
      if (sticker.team && !sticker.isDeleted) {
        if (!teamsMap.has(sticker.team)) {
          teamsMap.set(sticker.team, {
            name: sticker.team,
            logo: sticker.teamLogo,
            isStarred: false // Default value, will be updated from localStorage
          });
        }
      }
    });
    
    // Load starred status from localStorage
    const starredTeams = JSON.parse(localStorage.getItem('starredTeams') || '{}');
    teamsMap.forEach((team, teamName) => {
      team.isStarred = !!starredTeams[teamName];
    });
    
    return Array.from(teamsMap.values());
  }, [refreshKey]);

  // Handle refresh after team edits
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('teamsDataChanged'));
  };

  // Handle back button when viewing a single club
  const handleBackToList = () => {
    setSelectedClub(null);
  };

  // Empty state if no teams found
  if (teamsData.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="h-12 w-12" />}
        title="אין מועדונים"
        description="לא נמצאו מועדונים במערכת. הוסף מדבקות לאלבומים כדי לראות מועדונים."
      />
    );
  }

  return (
    <div className="space-y-4">
      {selectedClub ? (
        <>
          <ClubsHeader 
            title={selectedClub}
            onBack={handleBackToList}
            onRefresh={handleRefresh}
          />
          <ClubsSingleView 
            clubName={selectedClub} 
            onRefresh={handleRefresh}
          />
        </>
      ) : (
        <>
          <ClubsHeader 
            title="מועדונים"
            onSearch={setSearchQuery}
            onRefresh={handleRefresh}
          />
          <ClubsList 
            teams={teamsData} 
            searchQuery={searchQuery}
            onSelectClub={setSelectedClub}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </div>
  );
};

export default ClubsPage;
