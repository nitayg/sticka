
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import SettingsButton from '@/components/settings/SettingsButton';
import SyncButton from '@/components/SyncButton';
import { Album } from '@/lib/types';

interface AlbumHeaderActionsProps {
  albums: Album[];
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  onImportComplete: () => void;
}

const AlbumHeaderActions = () => {
  return (
    <div className="flex items-center gap-2">
      <SyncButton />
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
  );
};

export default AlbumHeaderActions;
