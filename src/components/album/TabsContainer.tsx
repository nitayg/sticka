
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import NumberRangeView from "../NumberRangeView";
import TeamView from "../TeamView";
import TeamManagementTab from "../TeamManagementTab";

interface TabsContainerProps {
  activeTab: "number" | "team" | "manage";
  setActiveTab: (tab: "number" | "team" | "manage") => void;
  numberRanges: string[];
  selectedRange: string | null;
  handleRangeSelect: (range: string | null) => void;
  teams: string[];
  selectedTeam: string | null;
  handleTeamSelect: (team: string | null) => void;
  teamLogos: Record<string, string>;
  onTeamsUpdate: () => void;
  showAllAlbums?: boolean; // New prop
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
  onTeamsUpdate,
  showAllAlbums = false
}: TabsContainerProps) => {
  return (
    <Tabs
      defaultValue="number"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "number" | "team" | "manage")}
      className="w-full"
      dir="rtl"
    >
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="number">לפי מספר</TabsTrigger>
        <TabsTrigger value="team">לפי קבוצה</TabsTrigger>
        <TabsTrigger value="manage">ניהול קבוצות</TabsTrigger>
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
          showAllAlbums={showAllAlbums}
        />
      </TabsContent>
      
      <TabsContent value="manage" className="mt-0">
        <TeamManagementTab
          teams={teams}
          teamLogos={teamLogos}
          onTeamSelect={handleTeamSelect}
          selectedTeam={selectedTeam}
          onTeamsUpdate={onTeamsUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;
