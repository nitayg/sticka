
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStats } from "@/lib/sticker-operations";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { getAllAlbums } from "@/lib/album-operations";
import SyncInstructionsDialog from "./sync/SyncInstructionsDialog";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const MobileHeader = ({ isMenuOpen, setIsMenuOpen }: MobileHeaderProps) => {
  // חישוב הסטטיסטיקות בזמן הרנדור
  const allAlbums = getAllAlbums();
  const stats = getStats();
  
  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-card border-b z-30 md:hidden flex items-center justify-between px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="h-9 w-9"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">תפריט</span>
      </Button>
      
      <div className="flex items-center gap-2">
        <SyncInstructionsDialog 
          trigger={
            <Button size="sm" variant="outline" className="text-xs px-2 h-7">
              סנכרון
            </Button>
          } 
        />
        <div className="text-xs font-medium">
          {stats.owned}/{stats.total}
          <span className="text-muted-foreground"> מדבקות</span>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
