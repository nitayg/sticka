
import { useState } from "react";
import { useToast } from "../../../hooks/use-toast";
import { exchangeOffers } from "@/lib/data";
import { ExchangeMethod } from "./ExchangeMethodSelector";

interface UseUpdateExchangeFormSubmitProps {
  exchange: any;
  personName: string;
  phone: string;
  location: string;
  exchangeMethod: ExchangeMethod;
  stickersToReceive: string;
  stickersToGive: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const useUpdateExchangeFormSubmit = ({
  exchange,
  personName,
  phone,
  location,
  exchangeMethod,
  stickersToReceive,
  stickersToGive,
  onClose,
  onUpdate
}: UseUpdateExchangeFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personName || !phone || !location || !stickersToReceive || !stickersToGive) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse sticker IDs from comma-separated strings
      const stickersToReceiveArray = stickersToReceive.split(',').map(s => s.trim());
      const stickersToGiveArray = stickersToGive.split(',').map(s => s.trim());
      
      // Find exchange in array
      const exchangeIndex = exchangeOffers.findIndex(e => e.id === exchange.id);
      if (exchangeIndex !== -1) {
        // Update exchange
        exchangeOffers[exchangeIndex] = {
          ...exchangeOffers[exchangeIndex],
          userName: personName,
          phone: phone,
          location: location,
          exchangeMethod: exchangeMethod,
          offeredStickerId: stickersToGiveArray,
          offeredStickerName: stickersToGive,
          wantedStickerId: stickersToReceiveArray,
          wantedStickerName: stickersToReceive
        };
        
        // Show success notification
        toast({
          title: "הצלחה",
          description: "עסקת ההחלפה עודכנה בהצלחה",
        });
        
        // Trigger refresh in parent component
        onUpdate();
        
        // Close dialog
        onClose();
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון עסקת ההחלפה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
