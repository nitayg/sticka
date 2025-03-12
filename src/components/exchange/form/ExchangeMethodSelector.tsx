
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { 
  Package, 
  Mail, 
  User 
} from "lucide-react";

export type ExchangeMethod = "pickup" | "mail" | "other";

interface ExchangeMethodSelectorProps {
  exchangeMethod: ExchangeMethod;
  setExchangeMethod: (method: ExchangeMethod) => void;
}

const ExchangeMethodSelector = ({
  exchangeMethod,
  setExchangeMethod
}: ExchangeMethodSelectorProps) => {
  return (
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
  );
};

export default ExchangeMethodSelector;
