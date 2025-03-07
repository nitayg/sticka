
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import SettingsButton from '@/components/settings/SettingsButton';
import SyncButton from '@/components/SyncButton';

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
