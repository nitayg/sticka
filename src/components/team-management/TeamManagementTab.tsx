
import React from "react";
import TeamList from "./TeamList";

interface TeamManagementTabProps {
  teams: string[];
  teamLogos: Record<string, string>;
  onTeamSelect: (team: string | null) => void;
  selectedTeam: string | null;
  onTeamsUpdate: () => void;
}

const TeamManagementTab = ({ 
  teams, 
  teamLogos, 
  onTeamSelect, 
  selectedTeam,
  onTeamsUpdate 
}: TeamManagementTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">ניהול קבוצות</h3>
      <TeamList
        teams={teams}
        teamLogos={teamLogos}
        selectedTeam={selectedTeam}
        onTeamSelect={onTeamSelect}
        onTeamsUpdate={onTeamsUpdate}
      />
    </div>
  );
};

export default TeamManagementTab;
