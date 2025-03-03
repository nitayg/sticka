
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import NumberRangeView from "../NumberRangeView";
import TeamView from "../TeamView";

interface TabsContainerProps {
  activeTab: "number" | "team";
  setActiveTab: (tab: "number" | "team") => void;
  numberRanges: string[];
  selectedRange: string | null;
  handleRangeSelect: (range: string | null) => void;
  teams: string[];
  selectedTeam: string | null;
  handleTeamSelect: (team: string | null) => void;
  teamLogos: Record<string, string>;
}

const TabsContainer = ({
  activeTab,
  setActiveTab,
  numberRanges,
  selectedRange,
  handleRangeSelect,
  teams,
  selectedTeam,
  handleTeamSelect,
  teamLogos,
}: TabsContainerProps) => {
  return (
    <Tabs
      defaultValue="number"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "number" | "team")}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="number">לפי מספר</TabsTrigger>
        <TabsTrigger value="team">לפי קבוצה</TabsTrigger>
      </TabsList>
      
      <TabsContent value="number" className="mt-0">
        <NumberRangeView 
          ranges={numberRanges} 
          selectedRange={selectedRange}
          onRangeSelect={handleRangeSelect}
        />
      </TabsContent>
      
      <TabsContent value="team" className="mt-0">
        <TeamView 
          teams={teams} 
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          teamLogos={teamLogos}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
