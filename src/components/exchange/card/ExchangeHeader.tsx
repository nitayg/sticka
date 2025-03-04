
import { useState } from "react";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { ExchangeOffer } from "@/lib/types";

interface ExchangeHeaderProps {
  exchange: ExchangeOffer;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const ExchangeHeader = ({ exchange, isExpanded, setIsExpanded }: ExchangeHeaderProps) => {
  return (
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
  );
};

export default ExchangeHeader;
