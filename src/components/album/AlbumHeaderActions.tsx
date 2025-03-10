
import React, { useState } from "react";
import { Download, Upload, Trash2, Recycle, RefreshCw, Plus, FileSpreadsheet } from "lucide-react";
import { Button } from "../ui/button";
import ViewModeToggle from "../ViewModeToggle";
import AddAlbumForm from "../add-album-form";
import ImportExcelDialog from "../ImportExcelDialog";
import { Album } from "@/lib/types";
import { moveAlbumToRecycleBin } from "@/lib/recycle-bin";
import { useToast } from "../ui/use-toast";
import RecycleBinDialog from "../recycle-bin/RecycleBinDialog";
import { forceSync } from "@/lib/sync";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  
  // Action buttons
  const actionButtons = (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-800"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            סנכרן עכשיו
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <AddAlbumForm onAlbumAdded={onRefresh} iconOnly />
          </TooltipTrigger>
          <TooltipContent>
            הוסף אלבום
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <ImportExcelDialog 
              albums={albums} 
              selectedAlbum={selectedAlbum} 
              setSelectedAlbum={() => {}} 
              onImportComplete={onImportComplete}
              iconOnly
            />
          </TooltipTrigger>
          <TooltipContent>
            יבא מאקסל
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-gray-800"
              onClick={() => setIsRecycleBinOpen(true)}
            >
              <Recycle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            סל מיחזור
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <RecycleBinDialog
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
      />
    </div>
  );
  
  return (
    <div className="flex gap-2 items-center">
      <ViewModeToggle 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      {actionButtons}
    </div>
  );
};

export default AlbumHeaderActions;
