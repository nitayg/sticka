
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FileInput } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { Album } from "@/lib/data";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
}

const ImportExcelDialog = ({ albums, selectedAlbum, setSelectedAlbum }: ImportExcelDialogProps) => {
  const { toast } = useToast();
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "הקובץ נקלט בהצלחה",
        description: `${file.name} יעובד בהמשך.`,
        duration: 3000,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileInput className="h-4 w-4 mr-2" />
          ייבוא אקסל
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ייבוא מדבקות מקובץ אקסל</DialogTitle>
          <DialogDescription>
            העלה קובץ אקסל עם המדבקות. וודא כי העמודה הראשונה היא מספר הקלף, השנייה שם השחקן, והשלישית שם הקבוצה/הסדרה.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="album" className="text-right">בחר אלבום</Label>
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר אלבום" />
              </SelectTrigger>
              <SelectContent>
                {albums.map(album => (
                  <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">בחר קובץ</Label>
            <div className="col-span-3">
              <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">ייבא מדבקות</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelDialog;
