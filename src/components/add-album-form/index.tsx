
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { addAlbum } from "@/lib/album-operations";
import AlbumBasicInfo from "./AlbumBasicInfo";
import AlbumImageUploader from "./AlbumImageUploader";
import { v4 as uuidv4 } from "uuid";

interface AddAlbumFormProps {
  onAlbumAdded: () => void;
  iconOnly?: boolean;
}

const AddAlbumForm = ({ onAlbumAdded, iconOnly = false }: AddAlbumFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [totalStickers, setTotalStickers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setYear("");
    setTotalStickers("");
    setImageUrl("");
  };

  const handleAddAlbum = async () => {
    if (!name || !totalStickers) {
      toast({
        title: "שגיאה בהוספת אלבום",
        description: "שם האלבום ומספר המדבקות הם שדות חובה",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addAlbum({
        id: uuidv4(),
        name,
        description,
        year,
        totalStickers: parseInt(totalStickers) || 0,
        coverImage: imageUrl
      });
      
      toast({
        title: "האלבום נוסף בהצלחה",
        description: `האלבום "${name}" נוסף למערכת`,
      });
      
      resetForm();
      setOpen(false);
      onAlbumAdded();
    } catch (error) {
      console.error("Error adding album:", error);
      toast({
        title: "שגיאה בהוספת אלבום",
        description: "אירעה שגיאה בהוספת האלבום",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size={iconOnly ? "icon" : "default"}
          className={iconOnly ? "h-8 w-8 rounded-full bg-gray-800" : ""}
        >
          <Plus className={iconOnly ? "h-4 w-4" : "h-5 w-5 ml-2"} />
          {!iconOnly && "הוסף אלבום"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת אלבום חדש</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <AlbumBasicInfo
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            year={year}
            setYear={setYear}
            totalStickers={totalStickers}
            setTotalStickers={setTotalStickers}
          />
          
          <AlbumImageUploader
            imageUrl={imageUrl}
            onImageChange={setImageUrl}
          />
          
          <Button 
            onClick={handleAddAlbum} 
            className="w-full mt-4"
          >
            הוסף אלבום
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
