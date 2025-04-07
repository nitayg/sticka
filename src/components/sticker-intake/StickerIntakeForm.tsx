
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import FormFields from "./FormFields";
import { useFormState } from "./useFormState";

interface StickerIntakeFormProps {
  onStickerAdded?: () => void;
  defaultStickerNumbers?: string;
  defaultExchangePartner?: string;
  selectedAlbumId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onIntake?: (albumId: string, stickerNumbers: (number | string)[]) => void;
}

const StickerIntakeForm = ({ 
  onStickerAdded, 
  defaultStickerNumbers = "", 
  defaultExchangePartner = "",
  selectedAlbumId = "",
  isOpen,
  onClose,
  onIntake
}: StickerIntakeFormProps) => {
  const { toast } = useToast();
  const {
    stickerNumbers, setStickerNumbers,
    source, setSource,
    exchangePartner, setExchangePartner,
    otherDetails, setOtherDetails,
    albumId, setAlbumId,
    validationError, setValidationError,
    isSubmitting, setIsSubmitting,
    resetForm
  } = useFormState(defaultStickerNumbers, defaultExchangePartner);
  
  // Set the album ID from props if provided
  useEffect(() => {
    if (selectedAlbumId) {
      setAlbumId(selectedAlbumId);
    }
  }, [selectedAlbumId, setAlbumId]);

  const validateForm = () => {
    // Reset any previous validation errors
    setValidationError("");
    
    // Check if album is selected
    if (!albumId) {
      setValidationError("יש לבחור אלבום");
      return false;
    }
    
    // Check if sticker numbers are provided
    if (!stickerNumbers) {
      setValidationError("יש להזין מספרי מדבקות");
      return false;
    }
    
    // Check if exchange partner is provided when source is exchange
    if (source === "exchange" && !exchangePartner) {
      setValidationError("יש לבחור שם של המחליף");
      return false;
    }
    
    // Check if other details are provided when source is other
    if (source === "other" && !otherDetails) {
      setValidationError("יש להזין פירוט עבור מקור המדבקות");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse the sticker numbers
      const stickerNumbersArray = stickerNumbers
        .split(",")
        .map(num => num.trim())
        .filter(Boolean)
        .map(num => {
          const parsedNum = parseInt(num, 10);
          return isNaN(parsedNum) ? num : parsedNum;
        });
        
      // If onIntake is provided, use it (for external handling)
      if (onIntake) {
        await onIntake(albumId, stickerNumbersArray);
        
        if (onClose) {
          onClose();
        }
      } else {
        // Add stickers to the system (placeholder for actual implementation)
        toast({
          title: "מדבקות נוספו בהצלחה",
          description: `נוספו ${stickerNumbersArray.length} מדבקות חדשות`,
        });
        
        // Trigger a refresh of the parent component
        if (onStickerAdded) {
          onStickerAdded();
        }
      }
      
      // Trigger a global event for other components to refresh
      window.dispatchEvent(new CustomEvent('stickerDataChanged'));
      
      // Reset the form
      resetForm();
    } catch (error) {
      console.error("Error adding stickers:", error);
      toast({
        title: "שגיאה בהוספת מדבקות",
        description: "אירעה שגיאה בהוספת המדבקות",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "מוסיף מדבקות..." : "הוסף מדבקות"}
      </Button>
    </form>
  );
};

export default StickerIntakeForm;
