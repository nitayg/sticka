
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Sticker } from "@/lib/types";
import { updateSticker } from "@/lib/sticker-operations";
import { useToast } from "../ui/use-toast";
import FormFields from "../sticker-form/FormFields";

interface StickerEditFormProps {
  sticker: Sticker;
  onSave: () => void;
  onCancel: () => void;
}

const StickerEditForm = ({ sticker, onSave, onCancel }: StickerEditFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(sticker.name);
  const [number, setNumber] = useState(sticker.number.toString());
  const [team, setTeam] = useState(sticker.team);
  const [teamLogo, setTeamLogo] = useState(sticker.teamLogo || "");
  const [category, setCategory] = useState(sticker.category || "");
  const [albumId, setAlbumId] = useState(sticker.albumId);
  const [isOwned, setIsOwned] = useState(sticker.isOwned);
  const [isDuplicate, setIsDuplicate] = useState(sticker.isDuplicate);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !number.trim() || !team.trim() || !albumId) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות המסומנים בכוכבית",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateSticker(sticker.id, {
        ...sticker,
        name,
        number: number.toString(),
        team,
        teamLogo,
        category,
        albumId,
        isOwned,
        isDuplicate: isOwned ? isDuplicate : false
      });
      
      toast({
        title: "המדבקה עודכנה בהצלחה",
        description: `מדבקה ${number} עודכנה במערכת`,
      });
      
      onSave();
    } catch (error) {
      console.error("Error updating sticker:", error);
      toast({
        title: "שגיאה בעדכון המדבקה",
        description: "אירעה שגיאה בעת עדכון המדבקה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-4">
      <FormFields
        name={name}
        setName={setName}
        number={number}
        setNumber={setNumber}
        team={team}
        setTeam={setTeam}
        teamLogo={teamLogo}
        setTeamLogo={setTeamLogo}
        category={category}
        setCategory={setCategory}
        albumId={albumId}
        setAlbumId={setAlbumId}
        isOwned={isOwned}
        setIsOwned={setIsOwned}
        isDuplicate={isDuplicate}
        setIsDuplicate={setIsDuplicate}
      />
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          ביטול
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "מעדכן..." : "שמור שינויים"}
        </Button>
      </div>
    </form>
  );
};

export default StickerEditForm;
