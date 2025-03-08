import React, { useState } from "react";
import { Download, Upload, Trash2, Recycle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";
import { moveAlbumToRecycleBin } from "@/lib/recycle-bin";
import { useToast } from "../ui/use-toast";
import RecycleBinDialog from "../recycle-bin/RecycleBinDialog";
import { forceSync } from "@/lib/sync-manager";
import { StorageEvents } from '@/lib/sync';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AlbumHeaderActionsProps {
  selectedAlbum: string;
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  onRefresh: () => void;
  albums: Album[];
  onImportComplete: () => void;
}

const AlbumHeaderActions = ({
  selectedAlbum,
  viewMode,
  setViewMode,
  showImages,
  setShowImages,
  onRefresh,
  albums,
  onImportComplete
}: AlbumHeaderActionsProps) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const selectedAlbumData = albums.find(album => album.id === selectedAlbum);
  
  const handleDeleteAlbum = () => {
    if (!selectedAlbum) return;
    
    moveAlbumToRecycleBin(selectedAlbum);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "אלבום הועבר לסל המיחזור",
      description: "האלבום הועבר לסל המיחזור ויימחק לצמיתות אחרי 30 יום",
    });
    
    onRefresh();
  };
  
  const handleSync = async () => {
    setIsSyncing(true);
    await forceSync();
    setTimeout(() => {
      setIsSyncing(false);
      onRefresh();
      toast({
        title: "סנכרון הושלם",
        description: "כל הנתונים סונכרנו עם השרת בהצלחה",
      });
    }, 1000);
  };
  
  return (
    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing}
      >
        <RefreshCw className={`h-4 w-4 ml-1 rtl:mr-0 rtl:ml-1 ${isSyncing ? 'animate-spin' : ''}`} />
        סנכרן עכשיו
      </Button>
      
      <AddAlbumForm onAlbumAdded={onRefresh} />
      
      <ImportExcelDialog 
        albums={albums} 
        selectedAlbum={selectedAlbum} 
        setSelectedAlbum={() => {}} 
        onImportComplete={onImportComplete} 
      />
      
      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      
      <div className="rtl:space-x-reverse space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRecycleBinOpen(true)}
        >
          <Recycle className="h-4 w-4 ml-1 rtl:mr-0 rtl:ml-1" />
          סל מיחזור
        </Button>
        
        {selectedAlbum && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 ml-1 rtl:mr-0 rtl:ml-1" />
                מחק אלבום
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>מחיקת אלבום</AlertDialogTitle>
                <AlertDialogDescription>
                  האם אתה בטוח שברצונך למחוק את האלבום "{selectedAlbumData?.name}"?
                  האלבום וכל המדבקות שלו יועברו לסל המיחזור.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse justify-start">
                <AlertDialogAction 
                  onClick={handleDeleteAlbum}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  העבר לסל המיחזור
                </AlertDialogAction>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <RecycleBinDialog
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
      />
    </div>
  );
};

export default AlbumHeaderActions;
