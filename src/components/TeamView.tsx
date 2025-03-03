
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { Button } from "./ui/button";

interface TeamViewProps {
  teams: string[];
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  teamLogos?: Record<string, string>; // New prop for team logos mapping
}

const TeamView = ({ teams, selectedTeam, onTeamSelect, teamLogos = {} }: TeamViewProps) => {
  if (teams.length === 0) {
    return <div className="text-center text-muted-foreground p-4">אין מדבקות באלבום</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {teams.map((team) => (
          <div
            key={team}
            onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
            className={cn(
              "px-4 py-3 rounded-md text-sm transition-colors w-full cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              "border flex items-center justify-start gap-2",
              selectedTeam === team
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border"
            )}
            dir="rtl"
          >
            {teamLogos[team] ? (
              <img 
                src={teamLogos[team]} 
                alt={`${team} logo`} 
                className="w-6 h-6 object-contain" 
              />
            ) : (
              <Shield className="w-5 h-5 opacity-50" />
            )}
            <span className="font-medium">{team}</span>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <Button
          variant="link"
          className="mt-4 text-sm px-0"
          onClick={() => onTeamSelect(null)}
        >
          הצג הכל
        </Button>
      )}
    </div>
  );
};

export default TeamView;
