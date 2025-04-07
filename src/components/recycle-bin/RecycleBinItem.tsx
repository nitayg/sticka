
import { Album } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "../ui/button";
import { RotateCcw, Trash } from "lucide-react";

interface RecycleBinItemProps {
  album: Album & { deletedAt?: number };
  onRestore: () => void;
  onDelete: () => void;
}

const RecycleBinItem = ({ album, onRestore, onDelete }: RecycleBinItemProps) => {
  const deletionDate = album.deletedAt ? new Date(album.deletedAt) : new Date();
  const timeAgo = formatDistanceToNow(deletionDate, { addSuffix: true, locale: he });
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-card">
      <div className="flex items-center space-x-3 space-x-reverse">
        {album.coverImage ? (
          <img 
            src={album.coverImage} 
            alt={album.name} 
            className="w-10 h-10 rounded-md object-cover" 
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">{album.name[0]}</span>
          </div>
        )}
        
        <div>
          <h4 className="font-medium">{album.name}</h4>
          <p className="text-xs text-muted-foreground">נמחק {timeAgo}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 space-x-reverse">
        <Button variant="outline" size="sm" onClick={onRestore}>
          <RotateCcw className="h-4 w-4 ml-1" />
          שחזר
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash className="h-4 w-4 ml-1" />
          מחק
        </Button>
      </div>
    </div>
  );
};

export default RecycleBinItem;
