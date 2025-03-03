
import { cn } from "@/lib/utils";

interface TeamViewProps {
  teams: string[];
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
}

const TeamView = ({ teams, selectedTeam, onTeamSelect }: TeamViewProps) => {
  if (teams.length === 0) {
    return <div className="text-center text-muted-foreground p-4">אין מדבקות באלבום</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {teams.map((team) => (
          <button
            key={team}
            onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors text-right",
              "hover:bg-accent hover:text-accent-foreground",
              selectedTeam === team
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            )}
          >
            {team}
          </button>
        ))}
      </div>

      {selectedTeam && (
        <button
          onClick={() => onTeamSelect(null)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          הצג הכל
        </button>
      )}
    </div>
  );
};

export default TeamView;
