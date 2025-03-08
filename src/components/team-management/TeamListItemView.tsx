
import React from "react";
import { Button } from "../ui/button";
import { Edit, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamListItemViewProps {
  team: string;
  teamLogo: string;
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  onEditClick: () => void;
}

const TeamListItemView = ({ 
  team, 
  teamLogo, 
  selectedTeam, 
  onTeamSelect,
  onEditClick
}: TeamListItemViewProps) => {
  return (
    <div className="flex items-center justify-between">
      <div 
        className="flex items-center gap-2 flex-grow cursor-pointer"
        onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
      >
        {teamLogo ? (
          <img 
            src={teamLogo} 
            alt={`${team} logo`} 
            className="w-6 h-6 object-contain" 
          />
        ) : (
          <Shield className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="font-medium">{team}</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="ml-2" 
        onClick={onEditClick}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TeamListItemView;
