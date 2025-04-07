
import React, { useState } from "react";
import { Button } from "../ui/button";
import { PlusCircle, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import TeamEditForm from "./TeamEditForm";
import TeamDeleteDialog from "./TeamDeleteDialog";
import { getTeamLogo } from "@/lib/sticker-operations";

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  
  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    
    // In a real implementation, we would add the team to the database
    // For now, we'll just close the dialog and trigger a refresh
    setIsAddDialogOpen(false);
    setNewTeamName("");
    onTeamsUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">ניהול קבוצות</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          הוסף קבוצה
        </Button>
      </div>
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {teams.map(team => {
            const logo = getTeamLogo(team, teamLogos);
            return (
              <div 
                key={team} 
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1" 
                  onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
                >
                  {logo && (
                    <img src={logo} alt={team} className="h-8 w-8 object-contain" />
                  )}
                  <span>{team}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setEditingTeam(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => setTeamToDelete(team)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          אין קבוצות להצגה
        </div>
      )}
      
      {/* Add Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת קבוצה חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input 
              placeholder="שם הקבוצה" 
              value={newTeamName} 
              onChange={(e) => setNewTeamName(e.target.value)} 
            />
            <Button 
              className="w-full" 
              onClick={handleAddTeam}
              disabled={!newTeamName.trim()}
            >
              הוסף קבוצה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Team Dialog */}
      {editingTeam && (
        <Dialog 
          open={!!editingTeam} 
          onOpenChange={(open) => !open && setEditingTeam(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת קבוצה</DialogTitle>
            </DialogHeader>
            <TeamEditForm 
              team={editingTeam}
              teamLogo={teamLogos[editingTeam] || ""}
              onCancel={() => setEditingTeam(null)}
              onTeamsUpdate={onTeamsUpdate}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Team Dialog */}
      {teamToDelete && (
        <TeamDeleteDialog
          isOpen={!!teamToDelete}
          onClose={() => setTeamToDelete(null)}
          team={teamToDelete}
          teamLogo={teamLogos[teamToDelete] || ""}
          onTeamsUpdate={onTeamsUpdate}
        />
      )}
    </div>
  );
};

export default TeamManagementTab;
