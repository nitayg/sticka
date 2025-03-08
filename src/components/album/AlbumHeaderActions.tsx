
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
  
  // Facebook-style action buttons - icons only
  return (
    <div className="flex items-center justify-center py-2 gap-2 w-full">
      <TooltipProvider>
        <div className="flex gap-2 justify-center w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-gray-800"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
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
                className="h-10 w-10 rounded-full bg-gray-800"
                onClick={() => setIsRecycleBinOpen(true)}
              >
                <Recycle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              סל מיחזור
            </TooltipContent>
          </Tooltip>
          
          {selectedAlbum && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-gray-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  מחק אלבום
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>מחיקת אלבום</AlertDialogTitle>
                  <AlertDialogDescription>
                    האם אתה בטוח שברצונך למחוק את האלבום "{selectedAlbumData?.name}"?
                    האלבום וכל המדבקות שלו יועברו לסל המיחזור.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex space-x-2 justify-end">
                  <AlertDialogCancel className="p-0 m-0">
                    <Button variant="outline" size="icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAlbum}
                    className="p-0 m-0"
                  >
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TooltipProvider>
      
      <RecycleBinDialog
        open={isRecycleBinOpen}
        onOpenChange={setIsRecycleBinOpen}
      />
    </div>
  );
};

export default AlbumHeaderActions;
