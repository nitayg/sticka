
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { getStickersByAlbumId, addStickersToInventory } from "@/lib/sticker-operations";
import { getAllAlbums, getAlbumById } from "@/lib/data";
import { useFormState } from "./useFormState";
import FormFields from "./FormFields";
import { useIntakeLogStore } from "@/store/useIntakeLogStore";

interface StickerIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onIntake: (albumId: string, stickerNumbers: (number | string)[]) => void;
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
  const {
    albumId, setAlbumId,
    stickerNumbers, setStickerNumbers,
    source, setSource,
    exchangePartner, setExchangePartner,
    otherDetails, setOtherDetails,
    validationError, setValidationError,
    isSubmitting, setIsSubmitting,
    resetForm
  } = useFormState(defaultStickerNumbers, defaultExchangePartner);
  
  const { toast } = useToast();
  const { addLogEntry } = useIntakeLogStore();
  const albums = getAllAlbums();

  useEffect(() => {
    if (isOpen && albums.length > 0 && !albumId) {
      setAlbumId(albums[0].id);
    }
    
    if (isOpen) {
      if (defaultStickerNumbers) {
        setStickerNumbers(defaultStickerNumbers);
      }
      
      if (defaultExchangePartner) {
        setExchangePartner(defaultExchangePartner);
        setSource("exchange");
      }
    }
  }, [isOpen, albums, albumId, defaultStickerNumbers, defaultExchangePartner, setAlbumId, setStickerNumbers, setExchangePartner, setSource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    const numbers: (number | string)[] = stickerNumbers
      .split(",")
      .map(num => num.trim())
      .filter(num => num)
      .map(num => {
        const isAlphanumeric = /[^0-9]/.test(num);
        return isAlphanumeric ? num : parseInt(num, 10);
      });

    if (numbers.length === 0) {
      setValidationError("אנא הכנס מספרי מדבקות תקינים, מופרדים בפסיקים");
      return;
    }

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
      const { newlyOwned, duplicatesUpdated, notFound } = addStickersToInventory(albumId, numbers);
      
      const sourceText = source === "exchange" 
        ? `החלפה עם ${exchangePartner}` 
        : source === "other" 
          ? otherDetails 
          : "קנייה של חבילת מדבקות";
      
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
      
      const totalUpdated = newlyOwned.length + duplicatesUpdated.length;
      toast({
        title: `נוספו ${totalUpdated} מדבקות למלאי`,
        description: `נוספו ${newlyOwned.length} מדבקות חדשות ו-${duplicatesUpdated.length} כפולות לאלבום ${album?.name}`,
      });
      
      onIntake(albumId, numbers);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">הוספת מדבקות למלאי</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <FormFields
              albumId={albumId}
              setAlbumId={setAlbumId}
              stickerNumbers={stickerNumbers}
              setStickerNumbers={setStickerNumbers}
              source={source}
              setSource={setSource}
              exchangePartner={exchangePartner}
              setExchangePartner={setExchangePartner}
              otherDetails={otherDetails}
              setOtherDetails={setOtherDetails}
              defaultExchangePartner={defaultExchangePartner}
              validationError={validationError}
            />
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
