
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface ExchangePersonalInfoFormProps {
  personName: string;
  setPersonName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
}

const ExchangePersonalInfoForm = ({
  personName,
  setPersonName,
  phone,
  setPhone,
  location,
  setLocation
}: ExchangePersonalInfoFormProps) => {
  return (
    <>
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
    </>
  );
};

export default ExchangePersonalInfoForm;
