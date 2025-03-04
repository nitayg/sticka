
import { useState } from "react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { 
  Package, 
  Mail, 
  User 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddExchangeDialogProps {
  onClose: () => void;
  selectedAlbumId: string;
}

type ExchangeMethod = "pickup" | "mail" | "other";

const AddExchangeDialog = ({ onClose, selectedAlbumId }: AddExchangeDialogProps) => {
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>("pickup");
  const [stickersToReceive, setStickersToReceive] = useState("");
  const [stickersToGive, setStickersToGive] = useState("");
  
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
    
    // בפרויקט אמיתי, כאן נשלח את הנתונים לשרת
    toast({
      title: "הצלחה",
      description: "עסקת ההחלפה נוצרה בהצלחה",
    });
    
    onClose();
  };
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>עסקת החלפה חדשה</DialogTitle>
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
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button type="submit">
            צור עסקה
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddExchangeDialog;
