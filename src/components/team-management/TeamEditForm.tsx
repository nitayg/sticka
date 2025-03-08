
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Save, X } from "lucide-react";
import { useToast } from "../ui/use-toast";
import LogoUploader from "./LogoUploader";
import { updateTeamNameAcrossStickers } from "@/lib/sticker-operations";

interface TeamEditFormProps {
  team: string;
  teamLogo: string;
  onCancel: () => void;
  onTeamsUpdate: () => void;
}

const TeamEditForm = ({ 
  team, 
  teamLogo, 
  onCancel,
  onTeamsUpdate 
}: TeamEditFormProps) => {
  const { toast } = useToast();
  const [newTeamName, setNewTeamName] = useState(team);
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");
  const [logoUrl, setLogoUrl] = useState(teamLogo || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
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
      
      onCancel();
      onTeamsUpdate();
    } catch (error) {
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בעדכון הקבוצה",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input 
          value={newTeamName} 
          onChange={(e) => setNewTeamName(e.target.value)} 
          className="flex-grow"
          placeholder="שם הקבוצה"
        />
      </div>
      
      <LogoUploader
        logoSource={logoSource}
        setLogoSource={setLogoSource}
        logoUrl={logoUrl}
        setLogoUrl={setLogoUrl}
        handleFileChange={handleFileChange}
        logoFile={logoFile}
        newTeamName={newTeamName}
      />
      
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
            onClick={onCancel}
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
  );
};

export default TeamEditForm;
