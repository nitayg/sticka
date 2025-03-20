
import { Sticker } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BookOpen, Shield } from "lucide-react";
import { getAlbumById } from "@/lib/album-operations";

interface CompactCardProps {
  sticker: Sticker;
  onClick?: () => void;
  showImages: boolean;
  showAlbumInfo: boolean;
  transaction?: { person: string; color: string };
  isRecentlyAdded?: boolean;
  className?: string;
}

// Helper function to get first name only
const getFirstName = (fullName: string): string => {
  return fullName.split(' ')[0];
};

const CompactCard = ({
  sticker,
  onClick,
  showImages,
  showAlbumInfo,
  transaction,
  isRecentlyAdded = false,
  className
}: CompactCardProps) => {
  // Get the album to use its image as a fallback
  const album = getAlbumById(sticker.albumId);
  const backgroundImageUrl = showImages && (sticker.imageUrl || album?.coverImage);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer",
        "card-hover sticker-shadow",
        "transition-all duration-300 ease-out",
        "w-full h-full min-w-[120px] max-w-[160px]",
        isRecentlyAdded && "border-yellow-400",
        transaction ? transaction.color : "",
        sticker.isOwned && !transaction ? "border-2 border-green-500" : "",
        className
      )}
      style={backgroundImageUrl ? {
        backgroundImage: `url('${backgroundImageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {
        backgroundColor: 'hsl(var(--muted))'
      }}
    >
      {/* Overlay for cards without image */}
      {!backgroundImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-3xl",
            sticker.isOwned && !transaction ? "text-green-600" : "text-muted-foreground"
          )}>
            {sticker.number}
          </span>
        </div>
      )}
      
      {/* Duplicate indicator */}
      {(sticker.isDuplicate && sticker.isOwned) && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center justify-center w-6 h-6 bg-interactive text-interactive-foreground rounded-full text-xs font-semibold">
            {sticker.duplicateCount && sticker.duplicateCount > 0 ? (sticker.duplicateCount + 1) : '2+'}
          </div>
        </div>
      )}
      
      {/* Album indicator */}
      {showAlbumInfo && album && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center justify-center px-2 py-0.5 bg-black/50 text-white rounded-full text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            {album.name}
          </div>
        </div>
      )}
      
      {/* Recently added indicator */}
      {isRecentlyAdded && (
        <div className="absolute top-0 left-0 w-0 h-0 border-solid border-t-[16px] border-t-yellow-400 border-r-[16px] border-r-transparent z-10"></div>
      )}
      
      {/* Text content overlay at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-gray-800/50 rounded-b-xl px-2 py-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white dark:text-gray-300">
            #{sticker.number}
          </span>
          <div className="flex items-center gap-1 text-xs font-medium text-white dark:text-gray-300">
            {sticker.teamLogo ? (
              <img src={sticker.teamLogo} alt={sticker.team} className="w-4 h-4 object-contain" />
            ) : (
              <Shield className="w-3 h-3 opacity-50" />
            )}
            <span>{sticker.team}</span>
          </div>
        </div>
        <h3 className="font-semibold text-white dark:text-white line-clamp-1 text-sm">
          {sticker.name}
        </h3>
        
        {/* Transaction info */}
        {transaction && (
          <div className="mt-1 text-xs font-medium text-white bg-black/50 rounded-sm px-1 py-0.5 text-center truncate">
            {getFirstName(transaction.person)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactCard;
