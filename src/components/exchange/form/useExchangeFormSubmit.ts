
import { useState } from "react";
import { useToast } from "../../../hooks/use-toast";
import { saveExchangeOffer } from "@/lib/supabase/exchange-offers";
import { ExchangeOffer } from "@/lib/types";
import { ExchangeMethod } from "./ExchangeMethodSelector";

// Updated colors for different exchanges - more vibrant
const exchangeColors = [
  "bg-purple-200 border-purple-500",
  "bg-blue-200 border-blue-500",
  "bg-pink-200 border-pink-500",
  "bg-green-200 border-green-500",
  "bg-orange-200 border-orange-500",
  "bg-yellow-200 border-yellow-500",
  "bg-indigo-200 border-indigo-500",
  "bg-red-200 border-red-500",
  "bg-teal-200 border-teal-500"
];

interface UseExchangeFormSubmitProps {
  personName: string;
  phone: string;
  location: string;
  exchangeMethod: ExchangeMethod;
  stickersToReceive: string;
  stickersToGive: string;
  selectedAlbumId: string;
  onClose: () => void;
  onExchangeAdded: () => void;
}

export const useExchangeFormSubmit = ({
  personName,
  phone,
  location,
  exchangeMethod,
  stickersToReceive,
  stickersToGive,
  selectedAlbumId,
  onClose,
  onExchangeAdded
}: UseExchangeFormSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personName || !phone || !location || !stickersToReceive || !stickersToGive || !selectedAlbumId) {
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
      
      // Get a random color for this exchange person
      const randomColor = exchangeColors[Math.floor(Math.random() * exchangeColors.length)];
      
      // Create new exchange offer without userId field to avoid foreign key constraint
      const newExchange: ExchangeOffer = {
        id: `e${Date.now()}`, // Use timestamp to ensure unique ID
        userName: personName, 
        offeredStickerId: stickersToGiveArray,
        offeredStickerName: stickersToGive,
        wantedStickerId: stickersToReceiveArray,
        wantedStickerName: stickersToReceive,
        status: "pending",
        exchangeMethod: exchangeMethod,
        location: location,
        phone: phone,
        color: randomColor,
        albumId: selectedAlbumId,
        lastModified: Date.now()
      };
      
      console.log('Saving new exchange offer:', newExchange);
      
      // Save to Supabase
      const success = await saveExchangeOffer(newExchange);
      
      if (success) {
        // Notify success
        toast({
          title: "הצלחה",
          description: "עסקת ההחלפה נוצרה בהצלחה",
        });
        
        // Trigger refresh in parent component
        onExchangeAdded();
        
        // Trigger data change events
        window.dispatchEvent(new CustomEvent('exchangeOffersDataChanged'));
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
        window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
        
        // Close dialog
        onClose();
      } else {
        throw new Error('Failed to save exchange offer');
      }
    } catch (error) {
      console.error('Error creating exchange offer:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת עסקת ההחלפה",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
