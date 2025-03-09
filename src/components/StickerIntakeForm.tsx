
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
import { getStickersByAlbumId, addStickersToInventory } from "@/lib/sticker-operations";
import { getAllAlbums, getAlbumById } from "@/lib/data";
import { useIntakeLogStore } from "@/store/useIntakeLogStore";

interface StickerIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onIntake: (albumId: string, stickerNumbers: number[]) => void;
  defaultStickerNumbers?: string;
  defaultExchangePartner?: string;
}

const StickerIntakeForm = ({ 
  isOpen, 
  onClose, 
  onIntake,
  defaultStickerNumbers = "",
  defaultExchangePartner = ""
}: StickerIntakeFormProps) => {
  const [stickerNumbers, setStickerNumbers] = useState("");
  const [source, setSource] = useState<"exchange" | "pack" | "other">("pack");
  const [exchangePartner, setExchangePartner] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addLogEntry } = useIntakeLogStore();
  const albums = getAllAlbums();

  useEffect(() => {
    if (isOpen && albums.length > 0 && !albumId) {
      setAlbumId(albums[0].id);
    }
    
    // Set default values when provided and form is opened
    if (isOpen) {
      if (defaultStickerNumbers) {
        setStickerNumbers(defaultStickerNumbers);
      }
      
      if (defaultExchangePartner) {
        setExchangePartner(defaultExchangePartner);
        setSource("exchange");
      }
    }
  }, [isOpen, albums, albumId, defaultStickerNumbers, defaultExchangePartner]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    setValidationError("");
    
    try {
      // Call the addStickersToInventory function with albumId and numbers
      const { newlyOwned, duplicatesUpdated, notFound } = await addStickersToInventory(albumId, numbers);
      
      // Get source details for log
      const sourceText = source === "exchange" 
        ? `החלפה עם ${exchangePartner}` 
        : source === "other" 
          ? otherDetails 
          : "קנייה של חבילת מדבקות";
      
      // Add entry to log
      const album = getAlbumById(albumId);
      addLogEntry({
        albumId,
        albumName: album?.name || "אלבום לא ידוע",
        source: sourceText,
        sourceDetails: source === "other" ? otherDetails : undefined,
        newStickers: newlyOwned,
        newDuplicates: [],
        updatedDuplicates: duplicatesUpdated,
      });
      
      // הצגת הודעה למשתמש
      const totalUpdated = newlyOwned.length + duplicatesUpdated.length;
      toast({
        title: `נוספו ${totalUpdated} מדבקות למלאי`,
        description: `נוספו ${newlyOwned.length} מדבקות חדשות ו-${duplicatesUpdated.length} כפולות לאלבום ${album?.name}`,
      });
      
      // Call the onIntake callback
      onIntake(albumId, numbers);
      
      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "שגיאה בעדכון המלאי",
        description: "אירעה שגיאה בעת עדכון מלאי המדבקות",
        variant: "destructive",
      });
      setValidationError("אירעה שגיאה בעת עדכון מלאי המדבקות");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStickerNumbers("");
    setSource("pack");
    setExchangePartner("");
    setOtherDetails("");
    setValidationError("");
    setIsSubmitting(false);
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
                defaultPartner={defaultExchangePartner}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs ml-1"></span>
              ) : (
                "הוסף מדבקות"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              ביטול
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StickerIntakeForm;
