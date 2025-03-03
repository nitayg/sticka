
import React from "react";
import { Button } from "../ui/button";
import TeamListItem from "./TeamListItem";

interface TeamListProps {
  teams: string[];
  teamLogos: Record<string, string>;
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  onTeamsUpdate: () => void;
}

const TeamList = ({
  teams,
  teamLogos,
  selectedTeam,
  onTeamSelect,
  onTeamsUpdate
}: TeamListProps) => {
  if (teams.length === 0) {
    return <div className="text-center text-muted-foreground p-4">אין קבוצות באלבום</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <TeamListItem 
            key={team}
            team={team}
            teamLogo={teamLogos[team] || ""}
            selectedTeam={selectedTeam}
            onTeamSelect={onTeamSelect}
            onTeamsUpdate={onTeamsUpdate}
          />
        ))}
      </div>
      
      {selectedTeam && (
        <Button 
          variant="link" 
          className="mt-2 text-sm px-0"
          onClick={() => onTeamSelect(null)}
        >
          הצג את כל הקבוצות
        </Button>
      )}
    </div>
  );
};

export default TeamList;
