
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus } from "lucide-react";
import { addSticker, getAlbumById, getAllAlbums } from "@/lib/data";
import { useToast } from "./ui/use-toast";

interface AddStickerFormProps {
  onStickerAdded?: () => void;
  defaultAlbumId?: string;
}

const AddStickerForm = ({ onStickerAdded, defaultAlbumId }: AddStickerFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [team, setTeam] = useState("");
  const [teamLogo, setTeamLogo] = useState(""); // New state for team logo
  const [category, setCategory] = useState("שחקנים");
  const [albumId, setAlbumId] = useState(defaultAlbumId || "");
  const [isOwned, setIsOwned] = useState(true);
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const albums = getAllAlbums();
  const categories = ["שחקנים", "קבוצות", "אצטדיונים", "סמלים", "אחר"];

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
      teamLogo: teamLogo || undefined, // Add team logo to the sticker
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

    // Reset form
    setName("");
    setNumber("");
    setTeam("");
    setTeamLogo("");
    setCategory("שחקנים");
    setIsOwned(true);
    setIsDuplicate(false);
    
    setOpen(false);
    
    // Call the callback if provided
    if (onStickerAdded) {
      onStickerAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-1" />
          הוסף
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת מדבקה חדשה</DialogTitle>
          <DialogDescription>
            הוסף מדבקה חדשה לאוסף שלך. שדות עם * הם שדות חובה.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="albumId" className="text-right">
              אלבום *
            </Label>
            <Select
              value={albumId}
              onValueChange={setAlbumId}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר אלבום" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number" className="text-right">
              מספר *
            </Label>
            <Input
              id="number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">
              קבוצה/סדרה *
            </Label>
            <Input
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          {/* New field for team logo */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teamLogo" className="text-right">
              סמל קבוצה
            </Label>
            <Input
              id="teamLogo"
              value={teamLogo}
              onChange={(e) => setTeamLogo(e.target.value)}
              className="col-span-3"
              placeholder="URL של סמל הקבוצה"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              קטגוריה
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              סטטוס
            </Label>
            <div className="col-span-3 flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="isOwned"
                  checked={isOwned}
                  onChange={(e) => setIsOwned(e.target.checked)}
                  className="form-checkbox h-4 w-4"
                />
                <Label htmlFor="isOwned" className="cursor-pointer">יש ברשותי</Label>
              </div>
              
              {isOwned && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="isDuplicate"
                    checked={isDuplicate}
                    onChange={(e) => setIsDuplicate(e.target.checked)}
                    className="form-checkbox h-4 w-4"
                  />
                  <Label htmlFor="isDuplicate" className="cursor-pointer">כפול</Label>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">הוסף מדבקה</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStickerForm;
