
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Sticker } from "@/lib/types";
import { useToast } from "../ui/use-toast";
import { updateSticker } from "@/lib/sticker-operations";
import BasicStickerInfo from "./BasicStickerInfo";
import LogoUploader from "./LogoUploader";

interface EditStickerFormProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditStickerForm = ({ sticker, isOpen, onClose, onUpdate }: EditStickerFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [team, setTeam] = useState("");
  const [originalTeam, setOriginalTeam] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [category, setCategory] = useState("");
  const [albumId, setAlbumId] = useState("");
  
  // For logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (sticker) {
      setName(sticker.name);
      setNumber(sticker.number.toString());
      setTeam(sticker.team);
      setOriginalTeam(sticker.team);
      setTeamLogo(sticker.teamLogo || "");
      setCategory(sticker.category);
      setAlbumId(sticker.albumId);
      setLogoFile(null);
    }
  }, [sticker]);

  if (!sticker) return null;

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Process logo file if one was selected
      let finalLogoUrl = teamLogo;
      if (logoFile) {
        finalLogoUrl = await readFileAsDataURL(logoFile);
      }
      
      // Update this sticker (the updateSticker function now handles team name propagation)
      updateSticker(sticker.id, {
        name,
        number: parseInt(number),
        team,
        teamLogo: finalLogoUrl || undefined,
        category,
        albumId,
      });
      
      // If team name changed and the update was successful
      if (team !== originalTeam) {
        toast({
          title: "שם קבוצה עודכן",
          description: `שם הקבוצה עודכן מ-${originalTeam} ל-${team} עבור כל המדבקות הרלוונטיות`,
        });
      }
      
      toast({
        title: "מדבקה עודכנה",
        description: `מדבקה ${number} (${name}) עודכנה בהצלחה`,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בניסיון לעדכן את המדבקה",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מדבקה</DialogTitle>
          <DialogDescription>
            עדכן את פרטי המדבקה. שדות עם * הינם שדות חובה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BasicStickerInfo 
            number={number}
            setNumber={setNumber}
            name={name}
            setName={setName}
            team={team}
            setTeam={setTeam}
            originalTeam={originalTeam}
            albumId={albumId}
            setAlbumId={setAlbumId}
            category={category}
            setCategory={setCategory}
          />
          
          <LogoUploader 
            teamLogo={teamLogo}
            setTeamLogo={setTeamLogo}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
            <Button type="submit">שמור שינויים</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStickerForm;
