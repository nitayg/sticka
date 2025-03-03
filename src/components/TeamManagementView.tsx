
import { useState, useMemo } from "react";
import { stickerData } from "@/lib/sticker-operations";
import Header from "./Header";
import TeamManagementTab from "./TeamManagementTab";

const TeamManagementView = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    stickerData.forEach(sticker => {
      if (sticker.team) {
        teamSet.add(sticker.team);
      }
    });
    return Array.from(teamSet).sort();
  }, [refreshKey]);

  const teamLogos = useMemo(() => {
    const logoMap: Record<string, string> = {};
    stickerData.forEach(sticker => {
      if (sticker.team && sticker.teamLogo) {
        logoMap[sticker.team] = sticker.teamLogo;
      }
    });
    return logoMap;
  }, [refreshKey]);

  const handleTeamsUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="ניהול קבוצות" 
        subtitle="ערוך שמות קבוצות והוסף סמלים"
      />
      
      <div className="border rounded-lg p-6 bg-card">
        <TeamManagementTab
          teams={teams}
          teamLogos={teamLogos}
          onTeamSelect={setSelectedTeam}
          selectedTeam={selectedTeam}
          onTeamsUpdate={handleTeamsUpdate}
        />
      </div>
    </div>
  );
};

export default TeamManagementView;
