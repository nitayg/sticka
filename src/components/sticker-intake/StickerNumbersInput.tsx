
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface StickerNumbersInputProps {
  stickerNumbers: string;
  setStickerNumbers: (numbers: string) => void;
}

const StickerNumbersInput = ({ stickerNumbers, setStickerNumbers }: StickerNumbersInputProps) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="stickerNumbers" className="text-right">
        מספרי מדבקות *
      </Label>
      <div className="col-span-3">
        <Input
          id="stickerNumbers"
          placeholder="1, 2, 3, 4"
          value={stickerNumbers}
          onChange={(e) => setStickerNumbers(e.target.value)}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          יש להפריד מספרים עם פסיק (,)
        </p>
      </div>
    </div>
  );
};

export default StickerNumbersInput;
