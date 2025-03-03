
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Edit, Save, X, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { updateTeamNameAcrossStickers } from "@/lib/sticker-operations";

interface TeamListItemProps {
  team: string;
  teamLogo: string;
  selectedTeam: string | null;
  onTeamSelect: (team: string | null) => void;
  onTeamsUpdate: () => void;
}

const TeamListItem = ({ 
  team, 
  teamLogo, 
  selectedTeam, 
  onTeamSelect, 
  onTeamsUpdate 
}: TeamListItemProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewTeamName(team);
    setLogoUrl(teamLogo || "");
    setLogoFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewTeamName("");
    setLogoUrl("");
    setLogoFile(null);
  };

  const handleSaveEdit = async () => {
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
      const updatedCount = updateTeamNameAcrossStickers(team, newTeamName, newLogoUrl);
      
      toast({
        title: "הקבוצה עודכנה",
        description: `עודכנו ${updatedCount} מדבקות מקבוצה "${team}" לשם החדש "${newTeamName}"`,
      });
      
      setIsEditing(false);
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

  return (
    <div 
      className={cn(
        "border rounded-md p-3 transition-all",
        isEditing ? "border-primary shadow-sm" : "border-border",
        selectedTeam === team && !isEditing ? "bg-muted" : ""
      )}
    >
      {isEditing ? (
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
                <span>URL</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-1 text-xs">
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
                onClick={handleSaveEdit}
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
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamListItem;
