
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Edit, Shield, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamDeleteDialog from "./TeamDeleteDialog";

interface TeamListItemViewProps {
  team: string;
  teamLogo: string;
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  onEditClick: () => void;
  onTeamsUpdate: () => void;
}

const TeamListItemView = ({ 
  team, 
  teamLogo, 
  selectedTeam, 
  onTeamSelect,
  onEditClick,
  onTeamsUpdate
}: TeamListItemViewProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
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
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onEditClick}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">ערוך קבוצה</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">מחק קבוצה</span>
          </Button>
        </div>
      </div>

      <TeamDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        team={team}
        teamLogo={teamLogo}
        onTeamsUpdate={onTeamsUpdate}
      />
    </>
  );
};

export default TeamListItemView;
