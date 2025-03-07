
import { Settings, Plus, Upload, Trash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import SettingsButton from '@/components/settings/SettingsButton';
import SyncButton from '@/components/SyncButton';
import { Album } from '@/lib/types';
import ViewModeToggle from '@/components/ViewModeToggle';

interface AlbumHeaderActionsProps {
  albums?: Album[];
  selectedAlbum?: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
}

const AlbumHeaderActions = ({
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  onImportComplete
}: AlbumHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View mode toggle */}
      <ViewModeToggle 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        showImages={showImages} 
        setShowImages={setShowImages} 
      />
      
      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Add Album button */}
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">הוסף אלבום</span>
        </Button>
        
        {/* Import Excel button */}
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">ייבא אקסל</span>
        </Button>
        
        {/* Delete button */}
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Trash className="h-4 w-4" />
          <span className="hidden sm:inline">מחק</span>
        </Button>
        
        {/* Recycle Bin button */}
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">סל מחזור</span>
        </Button>
        
        {/* Sync button */}
        <SyncButton />
        
        {/* Settings button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SettingsButton />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AlbumHeaderActions;
