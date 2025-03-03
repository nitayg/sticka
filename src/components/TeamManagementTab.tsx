
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Shield, Edit, Save, X, Upload, Link as LinkIcon, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";
import { updateTeamNameAcrossStickers } from "@/lib/sticker-operations";

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
  const { toast } = useToast();
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleEditClick = (team: string) => {
    setEditingTeam(team);
    setNewTeamName(team);
    setLogoUrl(teamLogos[team] || "");
    setLogoFile(null);
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setNewTeamName("");
    setLogoUrl("");
    setLogoFile(null);
  };

  const handleSaveEdit = async (oldTeamName: string) => {
    if (!newTeamName.trim()) {
      toast({
        title: "שגיאה",
        description: "שם הקבוצה לא יכול להיות ריק",
        variant: "destructive",
      });
      return;
    }

    try {
      let newLogoUrl = logoUrl;
      
      // אם נבחר קובץ, נמיר אותו ל-Data URL
      if (logoFile) {
        newLogoUrl = await readFileAsDataURL(logoFile);
      }
      
      // עדכון שם הקבוצה וסמל בכל המדבקות
      const updatedCount = updateTeamNameAcrossStickers(oldTeamName, newTeamName, newLogoUrl);
      
      toast({
        title: "הקבוצה עודכנה",
        description: `עודכנו ${updatedCount} מדבקות מקבוצה "${oldTeamName}" לשם החדש "${newTeamName}"`,
      });
      
      setEditingTeam(null);
      setNewTeamName("");
      setLogoUrl("");
      setLogoFile(null);
      onTeamsUpdate();
    } catch (error) {
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעדכון הקבוצה",
        variant: "destructive",
      });
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  if (teams.length === 0) {
    return <div className="text-center text-muted-foreground p-4">אין קבוצות באלבום</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">ניהול קבוצות</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div 
            key={team}
            className={cn(
              "border rounded-md p-3 transition-all",
              editingTeam === team ? "border-primary shadow-sm" : "border-border",
              selectedTeam === team && editingTeam !== team ? "bg-muted" : ""
            )}
          >
            {editingTeam === team ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    value={newTeamName} 
                    onChange={(e) => setNewTeamName(e.target.value)} 
                    className="flex-grow"
                    placeholder="שם הקבוצה"
                  />
                </div>
                
                <Tabs value={logoSource} onValueChange={(v) => setLogoSource(v as "url" | "file")}>
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="url" className="flex items-center gap-1 text-xs">
                      <LinkIcon className="h-3 w-3" />
                      <span>URL</span>
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center gap-1 text-xs">
                      <Upload className="h-3 w-3" />
                      <span>העלאה</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="mt-0">
                    <Input 
                      placeholder="הקלד URL של הסמל" 
                      value={logoUrl} 
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="file" className="mt-0">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </TabsContent>
                </Tabs>
                
                {/* תצוגה מקדימה של הלוגו */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleSaveEdit(team)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      שמור
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-1" />
                      בטל
                    </Button>
                  </div>
                  
                  <div className="w-10 h-10 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0 ml-2">
                    {(logoUrl || logoFile) && (
                      <img 
                        src={logoFile ? URL.createObjectURL(logoFile) : logoUrl} 
                        alt={`${newTeamName} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=X";
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 flex-grow cursor-pointer"
                  onClick={() => onTeamSelect(selectedTeam === team ? null : team)}
                >
                  {teamLogos[team] ? (
                    <img 
                      src={teamLogos[team]} 
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
                  onClick={() => handleEditClick(team)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedTeam && (
        <Button 
          variant="link" 
          className="mt-2 text-sm px-0"
          onClick={() => onTeamSelect(null)}
        >
          הצג את כל הקבוצות
        </Button>
      )}
    </div>
  );
};

export default TeamManagementTab;
