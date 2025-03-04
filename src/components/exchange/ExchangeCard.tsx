
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
  
  // מידע מדומה על החלפה (בפרויקט אמיתי, זה יגיע מה-API)
  const mockExchangeDetails = {
    location: "תל אביב",
    phone: "050-1234567",
    exchangeMethod: "pickup", // pickup, mail, other
    color: "bg-purple-100",
    stickersToReceive: [1, 3, 5, 7, 9, 11],
    stickersToGive: [2, 4, 6, 8, 10]
  };
  
  const getExchangeMethodIcon = () => {
    switch (mockExchangeDetails.exchangeMethod) {
      case "pickup":
        return <Package className="h-4 w-4" />;
      case "mail":
        return <Mail className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };
  
  const getExchangeMethodText = () => {
    switch (mockExchangeDetails.exchangeMethod) {
      case "pickup":
        return "איסוף עצמי";
      case "mail":
        return "משלוח בדואר";
      default:
        return "אחר";
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow",
        mockExchangeDetails.color
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
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 ml-1" />
          <span>{mockExchangeDetails.location}</span>
        </div>
        <div className="flex items-center text-sm">
          <Phone className="h-4 w-4 ml-1" />
          <span>{mockExchangeDetails.phone}</span>
        </div>
        <div className="flex items-center text-sm">
          {getExchangeMethodIcon()}
          <span className="mr-1">{getExchangeMethodText()}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <h4 className="text-sm font-medium mb-2">מקבל</h4>
            <div className="grid grid-cols-8 gap-2">
              {mockExchangeDetails.stickersToReceive.map(stickerId => (
                <StickerImage
                  key={`receive-${stickerId}`}
                  alt={`מדבקה ${stickerId}`}
                  stickerNumber={stickerId}
                  compactView={true}
                  inTransaction={true}
                  transactionColor={mockExchangeDetails.color}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">נותן</h4>
            <div className="grid grid-cols-8 gap-2">
              {mockExchangeDetails.stickersToGive.map(stickerId => (
                <StickerImage
                  key={`give-${stickerId}`}
                  alt={`מדבקה ${stickerId}`}
                  stickerNumber={stickerId}
                  compactView={true}
                  inTransaction={true}
                  transactionColor={mockExchangeDetails.color}
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
