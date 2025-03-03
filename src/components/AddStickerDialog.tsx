
import { useState } from "react";
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
import { addSticker } from "@/lib/data";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddStickerDialogProps {
  albumId: string;
  onStickerAdded: () => void;
}

const AddStickerDialog = ({ albumId, onStickerAdded }: AddStickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [stickerData, setStickerData] = useState({
    number: "",
    name: "",
    team: "",
    category: "שחקנים",
    isOwned: true,
    isDuplicate: false
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setStickerData({
      ...stickerData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAddSticker = () => {
    if (!stickerData.number.trim() || isNaN(Number(stickerData.number))) {
      toast({
        title: "שגיאה",
        description: "מספר מדבקה לא תקין",
        variant: "destructive"
      });
      return;
    }

    if (!stickerData.name.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין שם למדבקה",
        variant: "destructive"
      });
      return;
    }

    addSticker({
      number: Number(stickerData.number),
      name: stickerData.name,
      team: stickerData.team,
      category: stickerData.category,
      isOwned: stickerData.isOwned,
      isDuplicate: stickerData.isDuplicate,
      albumId
    });

    toast({
      title: "המדבקה נוספה בהצלחה",
      description: `מדבקה מספר ${stickerData.number} (${stickerData.name}) נוספה לאלבום`
    });

    setOpen(false);
    setStickerData({
      number: "",
      name: "",
      team: "",
      category: "שחקנים",
      isOwned: true,
      isDuplicate: false
    });
    onStickerAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 ml-2" />
          הוספת מדבקה
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת מדבקה חדשה</DialogTitle>
          <DialogDescription>
            הוסף מדבקה חדשה לאלבום שלך
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number" className="text-right">
              מספר
            </Label>
            <Input
              id="number"
              name="number"
              type="number"
              value={stickerData.number}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם
            </Label>
            <Input
              id="name"
              name="name"
              value={stickerData.name}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">
              קבוצה
            </Label>
            <Input
              id="team"
              name="team"
              value={stickerData.team}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              קטגוריה
            </Label>
            <Input
              id="category"
              name="category"
              value={stickerData.category}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Input
              id="isOwned"
              name="isOwned"
              type="checkbox"
              checked={stickerData.isOwned}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <Label htmlFor="isOwned" className="ml-2">
              ברשותי
            </Label>
            
            <Input
              id="isDuplicate"
              name="isDuplicate"
              type="checkbox"
              checked={stickerData.isDuplicate}
              onChange={handleInputChange}
              className="w-4 h-4 mr-4"
            />
            <Label htmlFor="isDuplicate" className="ml-2">
              כפולה
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddSticker}>הוסף מדבקה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStickerDialog;
