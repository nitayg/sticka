
import { Image } from "lucide-react";
import { Album } from "@/lib/types";

interface StickerImageProps {
  imageUrl?: string;
  fallbackImage?: string;
  alt: string;
}

const StickerImage = ({ imageUrl, fallbackImage, alt }: StickerImageProps) => {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border order-1 md:order-2">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      ) : fallbackImage ? (
        <img 
          src={fallbackImage} 
          alt={alt} 
          className="w-full h-full object-cover opacity-60"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Image className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default StickerImage;
