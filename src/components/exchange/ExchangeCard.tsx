
import { useState } from "react";
import { 
  Phone, 
  MapPin, 
  Mail, 
  Package, 
  User, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExchangeOffer } from "@/lib/types";
import StickerImage from "../sticker-details/StickerImage";

interface ExchangeCardProps {
  exchange: ExchangeOffer;
}

const ExchangeCard = ({ exchange }: ExchangeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  // Parse sticker numbers from arrays
  const stickersToReceive = exchange.wantedStickerId.map(id => parseInt(id));
  const stickersToGive = exchange.offeredStickerId.map(id => parseInt(id));

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border border-border hover:shadow-md transition-shadow",
        exchange.color || "bg-card"
      )}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary order-2">
          <img 
            src={exchange.userAvatar || '/placeholder.svg'} 
            alt={exchange.userName} 
            className="h-full w-full object-cover" 
          />
        </div>
        <div className="order-3">
          <h3 className="font-medium">{exchange.userName}</h3>
          <p className="text-xs text-muted-foreground">
            {exchange.status === "pending" ? "ממתין לאישור" : 
             exchange.status === "accepted" ? "אושר" : "נדחה"}
          </p>
        </div>
        <div className="ml-auto order-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-secondary/50"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
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
      
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <h4 className="text-sm font-medium mb-2">מקבל</h4>
            <div className="grid grid-cols-8 gap-2">
              {stickersToReceive.map(stickerId => (
                <StickerImage
                  key={`receive-${stickerId}`}
                  alt={`מדבקה ${stickerId}`}
                  stickerNumber={stickerId}
                  compactView={true}
                  inTransaction={true}
                  transactionColor={exchange.color}
                  transactionPerson={exchange.userName}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">נותן</h4>
            <div className="grid grid-cols-8 gap-2">
              {stickersToGive.map(stickerId => (
                <StickerImage
                  key={`give-${stickerId}`}
                  alt={`מדבקה ${stickerId}`}
                  stickerNumber={stickerId}
                  compactView={true}
                  inTransaction={true}
                  transactionColor={exchange.color}
                  transactionPerson={exchange.userName}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex space-x-2">
        <button className="flex-1 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors">
          עדכן עסקה
        </button>
        <button className="flex-1 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors">
          בטל עסקה
        </button>
      </div>
    </div>
  );
};

export default ExchangeCard;
