
import { useState } from "react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../ui/dialog";
import ExchangePersonalInfoForm from "./form/ExchangePersonalInfoForm";
import ExchangeMethodSelector, { ExchangeMethod } from "./form/ExchangeMethodSelector";
import ExchangeStickersForm from "./form/ExchangeStickersForm";
import ExchangeFormFooter from "./form/ExchangeFormFooter";
import { useExchangeFormSubmit } from "./form/useExchangeFormSubmit";

interface AddExchangeDialogProps {
  onClose: () => void;
  selectedAlbumId: string;
  onExchangeAdded: () => void;
}

const AddExchangeDialog = ({ onClose, selectedAlbumId, onExchangeAdded }: AddExchangeDialogProps) => {
  const [personName, setPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>("pickup");
  const [stickersToReceive, setStickersToReceive] = useState("");
  const [stickersToGive, setStickersToGive] = useState("");
  
  const { handleSubmit, isSubmitting } = useExchangeFormSubmit({
    personName,
    phone,
    location,
    exchangeMethod,
    stickersToReceive,
    stickersToGive,
    selectedAlbumId,
    onClose,
    onExchangeAdded
  });
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>עסקת החלפה חדשה</DialogTitle>
        <DialogDescription>צור עסקת החלפה חדשה עבור אלבום זה</DialogDescription>
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
  );
};

export default AddExchangeDialog;
