
import { useState, useEffect } from "react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../ui/dialog";
import { exchangeOffers } from "@/lib/data";
import ExchangePersonalInfoForm from "./form/ExchangePersonalInfoForm";
import ExchangeMethodSelector, { ExchangeMethod } from "./form/ExchangeMethodSelector";
import ExchangeStickersForm from "./form/ExchangeStickersForm";
import ExchangeFormFooter from "./form/ExchangeFormFooter";
import { useUpdateExchangeFormSubmit } from "./form/useUpdateExchangeFormSubmit";

interface UpdateExchangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: any;
  onUpdate?: () => void;
  onExchangeUpdated?: () => void;
}

const UpdateExchangeDialog = ({ isOpen, onClose, exchange, onUpdate, onExchangeUpdated }: UpdateExchangeDialogProps) => {
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>("pickup");
  const [stickersToReceive, setStickersToReceive] = useState("");
  const [stickersToGive, setStickersToGive] = useState("");
  
  // Initialize form with exchange data
  useEffect(() => {
    if (exchange && isOpen) {
      const exchangeData = exchangeOffers.find(e => e.id === exchange.id);
      if (exchangeData) {
        setPersonName(exchangeData.userName || "");
        setPhone(exchangeData.phone || "");
        setLocation(exchangeData.location || "");
        setExchangeMethod(exchangeData.exchangeMethod as ExchangeMethod || "pickup");
        setStickersToReceive(exchangeData.wantedStickerId.join(", ") || "");
        setStickersToGive(exchangeData.offeredStickerId.join(", ") || "");
      }
    }
  }, [exchange, isOpen]);
  
  const { handleSubmit, isSubmitting } = useUpdateExchangeFormSubmit({
    exchange,
    personName,
    phone,
    location,
    exchangeMethod,
    stickersToReceive,
    stickersToGive,
    onClose,
    onUpdate: onExchangeUpdated || onUpdate || (() => {})
  });
  
  return (
    isOpen && (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עדכון עסקת החלפה</DialogTitle>
          <DialogDescription>עדכן את פרטי עסקת ההחלפה</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ExchangePersonalInfoForm
            personName={personName}
            setPersonName={setPersonName}
            phone={phone}
            setPhone={setPhone}
            location={location}
            setLocation={setLocation}
          />
          
          <ExchangeMethodSelector 
            exchangeMethod={exchangeMethod}
            setExchangeMethod={setExchangeMethod}
          />
          
          <ExchangeStickersForm
            stickersToReceive={stickersToReceive}
            setStickersToReceive={setStickersToReceive}
            stickersToGive={stickersToGive}
            setStickersToGive={setStickersToGive}
          />
          
          <ExchangeFormFooter 
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        </form>
      </DialogContent>
    )
  );
};

export default UpdateExchangeDialog;
