
import React, { useState } from "react";
import { Label } from "../ui/label";
import { UploadCloud } from "lucide-react";
import { Sticker } from "@/lib/types";
import ImageUploadUrl from "./ImageUploadUrl";
import ImageUploadFile from "./ImageUploadFile";
import StickerImage from "./StickerImage";

interface StickerImageManagerProps {
  sticker: Sticker;
  onImageUpdate: (imageUrl: string) => void;
}

const StickerImageManager = ({ sticker, onImageUpdate }: StickerImageManagerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-muted/50 rounded-lg overflow-hidden">
      <div className="relative overflow-hidden">
        <StickerImage 
          imageUrl={sticker.imageUrl} 
          fallbackImage={sticker.teamLogo} 
          alt={sticker.name}
          stickerNumber={sticker.number}
          isOwned={sticker.isOwned}
          isDuplicate={sticker.isDuplicate}
        />
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-0 right-0 bg-black/50 text-white p-2 m-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <UploadCloud className="h-5 w-5" />
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-3 bg-card space-y-3 border-t">
          <Label className="text-sm font-medium">עדכון תמונת המדבקה</Label>
          <div className="space-y-2">
            <ImageUploadUrl onUpload={onImageUpdate} />
            <div className="my-2 flex items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-2 text-xs text-muted-foreground">או</span>
              <div className="flex-grow border-t border-border"></div>
            </div>
            <ImageUploadFile onUpload={onImageUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerImageManager;
