
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import TeamListItemView from "./TeamListItemView";
import TeamEditForm from "./TeamEditForm";

interface TeamListItemProps {
  team: string;
  teamLogo: string;
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  onTeamsUpdate: () => void;
}

const TeamListItem = ({ 
  team, 
  teamLogo, 
  selectedTeam, 
  onTeamSelect, 
  onTeamsUpdate 
}: TeamListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div 
      className={cn(
        "border rounded-md p-3 transition-all",
        isEditing ? "border-primary shadow-sm" : "border-border",
        selectedTeam === team && !isEditing ? "bg-muted" : ""
      )}
    >
      {isEditing ? (
        <TeamEditForm
          team={team}
          teamLogo={teamLogo}
          onCancel={handleCancelEdit}
          onTeamsUpdate={onTeamsUpdate}
        />
      ) : (
        <TeamListItemView
          team={team}
          teamLogo={teamLogo}
          selectedTeam={selectedTeam}
          onTeamSelect={onTeamSelect}
          onEditClick={handleEditClick}
          onTeamsUpdate={onTeamsUpdate}
        />
      )}
    </div>
  );
};

export default TeamListItem;
