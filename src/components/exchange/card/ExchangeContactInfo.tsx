
import { MapPin, Phone, Package, Mail, User } from "lucide-react";
import { ExchangeOffer } from "@/lib/types";

interface ExchangeContactInfoProps {
  exchange: ExchangeOffer;
}

const ExchangeContactInfo = ({ exchange }: ExchangeContactInfoProps) => {
  const getExchangeMethodIcon = () => {
    switch (exchange.exchangeMethod) {
      case "pickup":
        return <Package className="h-4 w-4" />;
      case "mail":
        return <Mail className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  const getExchangeMethodText = () => {
    switch (exchange.exchangeMethod) {
      case "pickup":
        return "איסוף עצמי";
      case "mail":
        return "משלוח בדואר";
      default:
        return "אחר";
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {exchange.location && (
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 ml-1" />
          <span>{exchange.location}</span>
        </div>
      )}
      
      {exchange.phone && (
        <div className="flex items-center text-sm">
          <Phone className="h-4 w-4 ml-1" />
          <span>{exchange.phone}</span>
        </div>
      )}
      
      {exchange.exchangeMethod && (
        <div className="flex items-center text-sm">
          {getExchangeMethodIcon()}
          <span className="mr-1">{getExchangeMethodText()}</span>
        </div>
      )}
    </div>
  );
};

export default ExchangeContactInfo;
