
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import AlbumSelector from "./sticker-form/AlbumSelector";
import StickerNumbersInput from "./sticker-intake/StickerNumbersInput";
import SourceSelector from "./sticker-intake/SourceSelector";
import ExchangePartnerSelector from "./sticker-intake/ExchangePartnerSelector";
import OtherDetailsInput from "./sticker-intake/OtherDetailsInput";
import ValidationError from "./sticker-intake/ValidationError";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { getAllAlbums } from "@/lib/data";

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
            
            <StickerNumbersInput 
              stickerNumbers={stickerNumbers} 
              setStickerNumbers={setStickerNumbers} 
            />

            <SourceSelector source={source} setSource={setSource} />

            {source === "exchange" && (
              <ExchangePartnerSelector 
                exchangePartner={exchangePartner} 
                setExchangePartner={setExchangePartner} 
              />
            )}

            {source === "other" && (
              <OtherDetailsInput 
                otherDetails={otherDetails} 
                setOtherDetails={setOtherDetails} 
              />
            )}

            <ValidationError error={validationError} />
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
