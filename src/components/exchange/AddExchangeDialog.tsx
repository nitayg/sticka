import { useState } from "react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { 
  Package, 
  Mail, 
  User 
} from "lucide-react";
import { useToast } from "../ui/use-toast";
import { ExchangeOffer } from "@/lib/types";
import { saveExchangeOffer } from "@/lib/supabase/exchange-offers";

interface AddExchangeDialogProps {
  onClose: () => void;
  selectedAlbumId: string;
  onExchangeAdded: () => void;
}

type ExchangeMethod = "pickup" | "mail" | "other";

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

const AddExchangeDialog = ({ onClose, selectedAlbumId, onExchangeAdded }: AddExchangeDialogProps) => {
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>("pickup");
  const [stickersToReceive, setStickersToReceive] = useState("");
  const [stickersToGive, setStickersToGive] = useState("");
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
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>עסקת החלפה חדשה</DialogTitle>
        <DialogDescription>צור עסקת החלפה חדשה עבור אלבום זה</DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="personName">שם האספן</Label>
          <Input
            id="personName"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="שם האספן"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">מספר טלפון</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="050-1234567"
          />
        </div>
        
        <div>
          <Label htmlFor="location">מקום מגורים</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="עיר / יישוב"
          />
        </div>
        
        <div>
          <Label>אופן ההחלפה</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button
              type="button"
              variant={exchangeMethod === "pickup" ? "default" : "outline"}
              className="flex flex-col items-center py-3 h-auto"
              onClick={() => setExchangeMethod("pickup")}
            >
              <Package className="h-6 w-6 mb-1" />
              <span className="text-xs">איסוף עצמי</span>
            </Button>
            <Button
              type="button"
              variant={exchangeMethod === "mail" ? "default" : "outline"}
              className="flex flex-col items-center py-3 h-auto"
              onClick={() => setExchangeMethod("mail")}
            >
              <Mail className="h-6 w-6 mb-1" />
              <span className="text-xs">משלוח בדואר</span>
            </Button>
            <Button
              type="button"
              variant={exchangeMethod === "other" ? "default" : "outline"}
              className="flex flex-col items-center py-3 h-auto"
              onClick={() => setExchangeMethod("other")}
            >
              <User className="h-6 w-6 mb-1" />
              <span className="text-xs">אחר</span>
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="stickersToReceive">מדבקות לקבלה (מספרים מופרדים בפסיקים)</Label>
          <Input
            id="stickersToReceive"
            value={stickersToReceive}
            onChange={(e) => setStickersToReceive(e.target.value)}
            placeholder="לדוגמה: 1,5,23,45"
          />
        </div>
        
        <div>
          <Label htmlFor="stickersToGive">מדבקות לנתינה (מספרים מופרדים בפסיקים)</Label>
          <Input
            id="stickersToGive"
            value={stickersToGive}
            onChange={(e) => setStickersToGive(e.target.value)}
            placeholder="לדוגמה: 2,10,30,50"
          />
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'שומר...' : 'צור עסקה'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddExchangeDialog;
