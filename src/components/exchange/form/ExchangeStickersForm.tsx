
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface ExchangeStickersFormProps {
  stickersToReceive: string;
  setStickersToReceive: (value: string) => void;
  stickersToGive: string;
  setStickersToGive: (value: string) => void;
}

const ExchangeStickersForm = ({
  stickersToReceive,
  setStickersToReceive,
  stickersToGive,
  setStickersToGive
}: ExchangeStickersFormProps) => {
  return (
    <>
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
    </>
  );
};

export default ExchangeStickersForm;
