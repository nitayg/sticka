
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

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
    <div className="w-full flex justify-end">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {teams.map((team) => (
          <button
            key={team}
            onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors w-full",
              "hover:bg-accent hover:text-accent-foreground",
              "flex items-center justify-end gap-2",
              selectedTeam === team
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            )}
            dir="rtl"
          >
            <span>{team}</span>
            {teamLogos[team] ? (
              <img 
                src={teamLogos[team]} 
                alt={`${team} logo`} 
                className="w-5 h-5 object-contain" 
              />
            ) : (
              <Shield className="w-4 h-4 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {selectedTeam && (
        <button
          onClick={() => onTeamSelect(null)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-right w-full"
        >
          הצג הכל
        </button>
      )}
    </div>
  );
};

export default TeamView;
