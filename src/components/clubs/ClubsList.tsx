
import { useState, useMemo } from "react";
import { Star, StarOff, Shield, Pencil } from "lucide-react";
import TeamEditDialog from "../team-management/TeamEditForm";
import { cn } from "@/lib/utils";

interface TeamData {
  name: string;
  logo?: string;
  isStarred: boolean;
}

interface ClubsListProps {
  teams: TeamData[];
  searchQuery: string;
  onSelectClub: (clubName: string) => void;
  onRefresh: () => void;
}

const ClubsList = ({ teams, searchQuery, onSelectClub, onRefresh }: ClubsListProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    return teams
      .filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        // First sort by starred status (starred teams first)
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        
        // Then sort alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [teams, searchQuery]);
  
  const toggleStarred = (teamName: string) => {
    // Get current starred teams from localStorage
    const starredTeams = JSON.parse(localStorage.getItem('starredTeams') || '{}');
    
    // Toggle starred status
    if (starredTeams[teamName]) {
      delete starredTeams[teamName];
    } else {
      starredTeams[teamName] = true;
    }
    
    // Save back to localStorage
    localStorage.setItem('starredTeams', JSON.stringify(starredTeams));
    
    // Refresh the list
    onRefresh();
  };
  
  const handleEditClick = (teamName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the team
    setSelectedTeam(teamName);
    setIsEditDialogOpen(true);
  };
  
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {filteredAndSortedTeams.map(team => (
        <div
          key={team.name}
          className={cn(
            "flex flex-col items-center justify-center py-4 px-3 rounded-xl",
            "relative bg-white text-foreground dark:bg-card transition-all duration-200",
            "cursor-pointer hover:shadow-md border border-border",
            team.isStarred && "border-yellow-500/30 dark:border-yellow-500/20"
          )}
          onClick={() => onSelectClub(team.name)}
        >
          {/* Star toggle button */}
          <button 
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarred(team.name);
            }}
          >
            {team.isStarred ? (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </button>
          
          {/* Edit button */}
          <button 
            className="absolute top-2 left-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => handleEditClick(team.name, e)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          
          {/* Team logo */}
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-2 overflow-hidden bg-muted">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={team.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <Shield className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>
          
          {/* Team name */}
          <h3 className="text-sm font-medium text-center line-clamp-2">
            {team.name}
          </h3>
        </div>
      ))}
      
      {/* Edit dialog */}
      {selectedTeam && (
        <TeamEditDialog
          teamName={selectedTeam}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onComplete={() => {
            onRefresh();
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
};

export default ClubsList;
