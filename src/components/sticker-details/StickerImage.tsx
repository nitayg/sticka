
import { Image } from "lucide-react";
import { Album } from "@/lib/types";

interface StickerImageProps {
  imageUrl?: string;
  fallbackImage?: string;
  alt: string;
  stickerNumber?: number;
  showImage?: boolean;
}

const StickerImage = ({ 
  imageUrl, 
  fallbackImage, 
  alt, 
  stickerNumber,
  showImage = true 
}: StickerImageProps) => {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border order-1 md:order-2">
      {showImage ? (
        imageUrl ? (
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
        )
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
          <Image className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
          {stickerNumber && <div className="text-3xl font-bold">{stickerNumber}</div>}
        </div>
      )}
    </div>
  );
};

export default StickerImage;
