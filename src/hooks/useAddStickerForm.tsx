
import { useState } from "react";
import { addSticker } from "@/lib/sticker-operations";
import { getAlbumById } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";

interface UseAddStickerFormProps {
  defaultAlbumId?: string;
  onStickerAdded?: () => void;
}

export const useAddStickerForm = ({ defaultAlbumId, onStickerAdded }: UseAddStickerFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [team, setTeam] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [category, setCategory] = useState("שחקנים");
  const [albumId, setAlbumId] = useState(defaultAlbumId || "");
  const [isOwned, setIsOwned] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const resetForm = () => {
    setName("");
    setNumber("");
    setTeam("");
    setTeamLogo("");
    setCategory("שחקנים");
    setIsOwned(true);
    setIsDuplicate(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !number || !team || !albumId) {
      toast({
        title: "שדות חסרים",
        description: "אנא מלא את כל שדות החובה",
        variant: "destructive",
      });
      return;
    }

    const selectedAlbum = getAlbumById(albumId);
    if (!selectedAlbum) {
      toast({
        title: "שגיאה",
        description: "האלבום שנבחר אינו קיים",
        variant: "destructive",
      });
      return;
    }

    const newSticker = addSticker({
      name,
      number: parseInt(number),
      team,
      teamLogo: teamLogo || undefined,
      category,
      albumId,
      isOwned,
      isDuplicate,
      imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    });

    toast({
      title: "מדבקה נוספה בהצלחה",
      description: `מדבקה ${newSticker.number} (${newSticker.name}) נוספה לאלבום ${selectedAlbum.name}`,
    });

    resetForm();
    setOpen(false);
    
    if (onStickerAdded) {
      onStickerAdded();
    }
  };

  return {
    open,
    setOpen,
    name,
    setName,
    number,
    setNumber,
    team,
    setTeam,
    teamLogo,
    setTeamLogo,
    category,
    setCategory,
    albumId,
    setAlbumId,
    isOwned,
    setIsOwned,
    isDuplicate,
    setIsDuplicate,
    handleSubmit
  };
};
