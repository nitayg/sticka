
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { addAlbum } from "@/lib/data";
import { useToast } from "./ui/use-toast";

interface AddAlbumFormProps {
  onAlbumAdded?: () => void;
}

const AddAlbumForm = ({ onAlbumAdded }: AddAlbumFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [totalStickers, setTotalStickers] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalStickers) {
      toast({
        title: "שדות חסרים",
        description: "אנא מלא את כל שדות החובה",
        variant: "destructive",
      });
      return;
    }

    const newAlbum = addAlbum({
      name,
      description,
      year,
      totalStickers: parseInt(totalStickers),
      coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop"
    });

    toast({
      title: "אלבום נוסף בהצלחה",
      description: `האלבום ${newAlbum.name} נוסף בהצלחה`,
    });

    // Reset form
    setName("");
    setDescription("");
    setYear("");
    setTotalStickers("");
    
    setOpen(false);
    
    // Call the callback if provided
    if (onAlbumAdded) {
      onAlbumAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          הוסף אלבום
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת אלבום חדש</DialogTitle>
          <DialogDescription>
            הוסף אלבום חדש לאוסף שלך. שדות עם * הם שדות חובה.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם האלבום *
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
            <Label htmlFor="description" className="text-right">
              תיאור
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              שנה
            </Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalStickers" className="text-right">
              כמות מדבקות *
            </Label>
            <Input
              id="totalStickers"
              type="number"
              value={totalStickers}
              onChange={(e) => setTotalStickers(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">הוסף אלבום</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumForm;
