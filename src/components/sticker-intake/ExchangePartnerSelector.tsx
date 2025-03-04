
import React from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Mock exchange partners data - in a real app, this would come from your data store
const exchangePartners = [
  { id: "user1", name: "דני" },
  { id: "user2", name: "יוסי" },
  { id: "user3", name: "רותי" },
  { id: "user4", name: "משה" },
];

interface ExchangePartnerSelectorProps {
  exchangePartner: string;
  setExchangePartner: (partner: string) => void;
}

const ExchangePartnerSelector = ({ exchangePartner, setExchangePartner }: ExchangePartnerSelectorProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="exchangePartner" className="text-right">
        שם המחליף *
      </Label>
      <Select 
        value={exchangePartner} 
        onValueChange={setExchangePartner}
      >
        <SelectTrigger id="exchangePartner" className="col-span-3">
          <SelectValue placeholder="בחר מחליף" />
        </SelectTrigger>
        <SelectContent>
          {exchangePartners.map(partner => (
            <SelectItem key={partner.id} value={partner.name}>
              {partner.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExchangePartnerSelector;
