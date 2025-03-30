
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface StickerNumbersInputProps {
  stickerNumbers: string;
  setStickerNumbers: (numbers: string) => void;
  placeholder?: string;
}

const StickerNumbersInput = ({ 
  stickerNumbers, 
  setStickerNumbers, 
  placeholder = "1, 2, 3, A1, B2..." 
}: StickerNumbersInputProps) => {
  // Optimize input handling to reduce state updates
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStickerNumbers(e.target.value);
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="stickerNumbers" className="text-right">
        מספרי מדבקות *
      </Label>
      <div className="col-span-3">
        <Input
          id="stickerNumbers"
          placeholder={placeholder}
          value={stickerNumbers}
          onChange={handleChange}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          יש להפריד מספרים עם פסיק (,) - ניתן להזין גם מספרי מדבקות אלפאנומריים
        </p>
      </div>
    </div>
  );
};

export default StickerNumbersInput;
