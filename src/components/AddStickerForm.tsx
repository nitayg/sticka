
import React from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { DialogFooter } from "./ui/dialog";
import { useAddStickerForm } from "@/hooks/useAddStickerForm";
import StickerFormDialog from "./sticker-form/StickerFormDialog";
import FormFields from "./sticker-form/FormFields";

interface AddStickerFormProps {
  onStickerAdded?: () => void;
  defaultAlbumId?: string;
}

const AddStickerForm = ({ onStickerAdded, defaultAlbumId }: AddStickerFormProps) => {
  const { 
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
  } = useAddStickerForm({ defaultAlbumId, onStickerAdded });

  return (
    <StickerFormDialog
      open={open}
      setOpen={setOpen}
      trigger={
        <Button>
          <Plus className="h-4 w-4 ml-1" />
          הוסף
        </Button>
      }
      title="הוספת מדבקה חדשה"
      description="הוסף מדבקה חדשה לאוסף שלך. שדות עם * הם שדות חובה."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <DialogFooter>
          <Button type="submit">הוסף מדבקה</Button>
        </DialogFooter>
      </form>
    </StickerFormDialog>
  );
};

export default AddStickerForm;
