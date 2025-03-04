import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import AlbumSelector from "./sticker-form/AlbumSelector";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { getAllAlbums } from "@/lib/data";

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
  onIntake: (albumId: string, stickerNumbers: number[]) => void;
}

const StickerIntakeForm = ({ isOpen, onClose, onIntake }: StickerIntakeFormProps) => {
  const [stickerNumbers, setStickerNumbers] = useState("");
  const [source, setSource] = useState<"exchange" | "pack" | "other">("pack");
  const [exchangePartner, setExchangePartner] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [validationError, setValidationError] = useState("");
  const { toast } = useToast();
  const albums = getAllAlbums();

  useEffect(() => {
    if (isOpen && albums.length > 0 && !albumId) {
      setAlbumId(albums[0].id);
    }
  }, [isOpen, albums, albumId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!stickerNumbers.trim()) {
      setValidationError("אנא הכנס מספרי מדבקות");
      return;
    }

    if (source === "exchange" && !exchangePartner) {
      setValidationError("אנא בחר שם מחליף");
      return;
    }

    if (source === "other" && !otherDetails) {
      setValidationError("אנא הכנס פרטים על מקור המדבקות");
      return;
    }

    if (!albumId) {
      setValidationError("אנא בחר אלבום");
      return;
    }

    // Parse sticker numbers
    const numbers = stickerNumbers
      .split(",")
      .map(num => num.trim())
      .filter(num => num && !isNaN(Number(num)))
      .map(num => parseInt(num));

    if (numbers.length === 0) {
      setValidationError("אנא הכנס מספרי מדבקות תקינים, מופרדים בפסיקים");
      return;
    }

    // Validate sticker numbers against album
    const albumStickers = getStickersByAlbumId(albumId);
    const albumStickerNumbers = new Set(albumStickers.map(sticker => sticker.number));
    const invalidNumbers = numbers
      .filter(num => !albumStickerNumbers.has(num));

    if (invalidNumbers.length > 0) {
      setValidationError(
        `מספרי המדבקות הבאים לא נמצאים באלבום שנבחר: ${invalidNumbers.join(", ")}`
      );
      return;
    }

    // Call the onIntake function with albumId and numbers
    onIntake(albumId, numbers);
    
    // Reset form and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStickerNumbers("");
    setSource("pack");
    setExchangePartner("");
    setOtherDetails("");
    setValidationError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">הוספת מדבקות למלאי</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <AlbumSelector albumId={albumId} setAlbumId={setAlbumId} />

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

            {validationError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-right border border-red-200">
                {validationError}
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
