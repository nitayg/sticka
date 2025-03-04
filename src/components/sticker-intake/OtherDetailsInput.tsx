
import React from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface OtherDetailsInputProps {
  otherDetails: string;
  setOtherDetails: (details: string) => void;
}

const OtherDetailsInput = ({ otherDetails, setOtherDetails }: OtherDetailsInputProps) => {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="otherDetails" className="text-right pt-2">
        פירוט *
      </Label>
      <Textarea
        id="otherDetails"
        value={otherDetails}
        onChange={(e) => setOtherDetails(e.target.value)}
        className="col-span-3 text-right"
        rows={3}
      />
    </div>
  );
};

export default OtherDetailsInput;
