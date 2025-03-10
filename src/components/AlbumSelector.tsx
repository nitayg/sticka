
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllAlbums } from "@/lib/album-operations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/utils";
import { addAlbum } from "@/lib/data";
import { Album } from "@/lib/types";

interface AlbumSelectorProps {
  selectedAlbumId?: string;
  albumId?: string;
  setAlbumId?: (value: string) => void;
  onAlbumChange?: (value: string) => void;
  albums?: Album[];
}

const AlbumSelector = ({
  albumId,
  setAlbumId,
  selectedAlbumId,
  onAlbumChange,
  albums: providedAlbums
}: AlbumSelectorProps) => {
  // Use provided albums or fetch them if not provided
  const albums = providedAlbums || getAllAlbums();
  const { toast } = useToast();
  
  // Determine which value and change handler to use
  const value = selectedAlbumId || albumId || "";
  const handleChange = (newValue: string) => {
    if (onAlbumChange) onAlbumChange(newValue);
    if (setAlbumId) setAlbumId(newValue);
  };
  
  const [isAddAlbumOpen, setIsAddAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [newAlbumYear, setNewAlbumYear] = useState("");
  const [newAlbumTotalStickers, setNewAlbumTotalStickers] = useState("");
  
  const handleAddAlbum = async () => {
    if (!newAlbumName) {
      toast({
        title: "שם אלבום חסר",
        description: "יש להזין שם אלבום",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newAlbumId = generateId();
      
      const album = await addAlbum({
        id: newAlbumId,
        name: newAlbumName,
        description: newAlbumDescription,
        year: newAlbumYear,
        totalStickers: parseInt(newAlbumTotalStickers) || 0,
        coverImage: ""
      });
      
      toast({
        title: "אלבום נוסף בהצלחה",
        description: `האלבום "${album.name}" נוסף בהצלחה`,
      });
      
      handleChange(album.id);
      
      setIsAddAlbumOpen(false);
      setNewAlbumName("");
      setNewAlbumDescription("");
      setNewAlbumYear("");
      setNewAlbumTotalStickers("");
      
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
    } catch (error) {
      console.error("Error adding album:", error);
      toast({
        title: "שגיאה בהוספת אלבום",
        description: "אירעה שגיאה בעת הוספת האלבום",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="albumId" className="text-right">
        אלבום *
      </Label>
      <div className="col-span-3 flex gap-2">
        <Select
          value={value}
          onValueChange={handleChange}
          required
        >
          <SelectTrigger className="flex-grow">
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
        
        <Dialog open={isAddAlbumOpen} onOpenChange={setIsAddAlbumOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" className="px-3">+</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">הוספת אלבום חדש</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  שם
                </Label>
                <Input
                  id="name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  תיאור
                </Label>
                <Textarea
                  id="description"
                  value={newAlbumDescription}
                  onChange={(e) => setNewAlbumDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  שנה
                </Label>
                <Input
                  id="year"
                  value={newAlbumYear}
                  onChange={(e) => setNewAlbumYear(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalStickers" className="text-right">
                  מספר מדבקות
                </Label>
                <Input
                  id="totalStickers"
                  type="number"
                  value={newAlbumTotalStickers}
                  onChange={(e) => setNewAlbumTotalStickers(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleAddAlbum}>
                הוסף
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AlbumSelector;
