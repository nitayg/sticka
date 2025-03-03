
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { albums, addAlbum, Album } from "@/lib/data";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlbumSelectorProps {
  selectedAlbumId: string;
  onAlbumChange: (albumId: string) => void;
}

const AlbumSelector = ({ selectedAlbumId, onAlbumChange }: AlbumSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newAlbum, setNewAlbum] = useState<Omit<Album, "id" | "totalStickers">>({
    name: "",
    description: "",
    year: new Date().getFullYear().toString()
  });
  const { toast } = useToast();

  const handleCreateAlbum = () => {
    if (!newAlbum.name.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם לאלבום",
        variant: "destructive"
      });
      return;
    }

    const createdAlbum = addAlbum({
      ...newAlbum,
      totalStickers: 0
    });

    toast({
      title: "האלבום נוצר בהצלחה",
      description: `האלבום ${createdAlbum.name} נוצר בהצלחה`
    });

    setOpen(false);
    onAlbumChange(createdAlbum.id);
    setNewAlbum({
      name: "",
      description: "",
      year: new Date().getFullYear().toString()
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedAlbumId} onValueChange={onAlbumChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="בחר אלבום" />
        </SelectTrigger>
        <SelectContent>
          {albums.map((album) => (
            <SelectItem key={album.id} value={album.id}>
              {album.name} ({album.year})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>הוספת אלבום חדש</DialogTitle>
            <DialogDescription>
              צור אלבום חדש לאיסוף המדבקות שלך
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                שם
              </Label>
              <Input
                id="name"
                value={newAlbum.name}
                onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                תיאור
              </Label>
              <Input
                id="description"
                value={newAlbum.description}
                onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                שנה
              </Label>
              <Input
                id="year"
                value={newAlbum.year}
                onChange={(e) => setNewAlbum({ ...newAlbum, year: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateAlbum}>צור אלבום</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlbumSelector;
