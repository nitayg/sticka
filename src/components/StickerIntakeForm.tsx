
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { toggleStickerOwned } from "@/lib/sticker-operations";

// Mock exchange partners data - in a real app, this would come from your data store
const exchangePartners = [
  { id: "user1", name: "דני" },
  { id: "user2", name: "יוסי" },
  { id: "user3", name: "רותי" },
  { id: "user4", name: "משה" },
];

interface StickerIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onIntake: () => void;
}

const StickerIntakeForm = ({ isOpen, onClose, onIntake }: StickerIntakeFormProps) => {
  const [stickerNumbers, setStickerNumbers] = useState("");
  const [source, setSource] = useState<"exchange" | "pack" | "other">("pack");
  const [exchangePartner, setExchangePartner] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!stickerNumbers.trim()) {
      toast({
        title: "שדות חסרים",
        description: "אנא הכנס מספרי מדבקות",
        variant: "destructive"
      });
      return;
    }

    if (source === "exchange" && !exchangePartner) {
      toast({
        title: "שדות חסרים",
        description: "אנא בחר שם מחליף",
        variant: "destructive"
      });
      return;
    }

    if (source === "other" && !otherDetails) {
      toast({
        title: "שדות חסרים",
        description: "אנא הכנס פרטים על מקור המדבקות",
        variant: "destructive"
      });
      return;
    }

    // Parse sticker numbers
    const numbers = stickerNumbers
      .split(",")
      .map(num => num.trim())
      .filter(num => num && !isNaN(Number(num)));

    if (numbers.length === 0) {
      toast({
        title: "קלט לא תקין",
        description: "אנא הכנס מספרי מדבקות תקינים, מופרדים בפסיקים",
        variant: "destructive"
      });
      return;
    }

    // Process the stickers based on their existence in the data
    // This would normally call a function to update your data store
    // For now, let's add a simple mock implementation
    const addedStickers = numbers.map(numStr => {
      const num = parseInt(numStr);
      return { number: num };
    });

    // Here you would normally update your data store with the new stickers
    // For demonstration purposes, let's just show a success message
    const sourceText = source === "pack" ? "מעטפה" : 
                     source === "exchange" ? `החלפה עם ${exchangePartner}` : 
                     `אחר: ${otherDetails}`;

    toast({
      title: "מדבקות נוספו בהצלחה",
      description: `${addedStickers.length} מדבקות נוספו למלאי (מקור: ${sourceText})`,
    });

    // Reset form and close
    resetForm();
    onIntake();
    onClose();
  };

  const resetForm = () => {
    setStickerNumbers("");
    setSource("pack");
    setExchangePartner("");
    setOtherDetails("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">הוספת מדבקות למלאי</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stickerNumbers" className="text-right">
                מספרי מדבקות *
              </Label>
              <div className="col-span-3">
                <Input
                  id="stickerNumbers"
                  placeholder="1, 2, 3, 4"
                  value={stickerNumbers}
                  onChange={(e) => setStickerNumbers(e.target.value)}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  יש להפריד מספרים עם פסיק (,)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                מקור *
              </Label>
              <Select 
                value={source} 
                onValueChange={(value) => setSource(value as "exchange" | "pack" | "other")}
              >
                <SelectTrigger id="source" className="col-span-3">
                  <SelectValue placeholder="בחר מקור" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pack">מעטפה</SelectItem>
                  <SelectItem value="exchange">החלפה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {source === "exchange" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exchangePartner" className="text-right">
                  שם המחליף *
                </Label>
                <Select 
                  value={exchangePartner} 
                  onValueChange={setExchangePartner}
                >
                  <SelectTrigger id="exchangePartner" className="col-span-3">
                    <SelectValue placeholder="בחר מחליף" />
                  </SelectTrigger>
                  <SelectContent>
                    {exchangePartners.map(partner => (
                      <SelectItem key={partner.id} value={partner.name}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {source === "other" && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="otherDetails" className="text-right pt-2">
                  פירוט *
                </Label>
                <Textarea
                  id="otherDetails"
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  className="col-span-3 text-right"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit">הוסף מדבקות</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StickerIntakeForm;
