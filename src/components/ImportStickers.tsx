
import { CSVImportDialog } from "./csv-import/CSVImportDialog";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";
import { StorageEvents } from "@/lib/sync/constants";
import { useQueryUtils } from "@/hooks/useQueryUtils";

interface ImportStickersProps {
  albumId: string;
  onImportComplete: () => void;
}

const ImportStickers = ({ albumId, onImportComplete }: ImportStickersProps) => {
  const { toast } = useToast();
  const { invalidateQueries } = useQueryUtils();
  
  // Handle special events for import completion
  useEffect(() => {
    // Listen for the specific sticker import event
    const handleStickerImported = (e: CustomEvent) => {
      const { count, albumId: importedAlbumId } = e.detail || {};
      
      if (importedAlbumId === albumId && count) {
        toast({
          title: "ייבוא מדבקות",
          description: `${count} מדבקות יובאו בהצלחה`,
        });
        
        // Actively invalidate React Query cache for this album's stickers
        invalidateQueries(['stickers', albumId]);
        
        // Notify parent component
        onImportComplete();
      }
    };
    
    // Also listen for the new import-complete event (more reliable)
    const handleImportComplete = (e: CustomEvent) => {
      const { count, albumId: importedAlbumId } = e.detail || {};
      
      if (importedAlbumId === albumId) {
        console.log(`Import complete event received for album ${albumId}, count: ${count}`);
        
        // Actively invalidate React Query cache for this album's stickers
        invalidateQueries(['stickers', albumId]);
        
        // Force parent refresh
        onImportComplete();
      }
    };
    
    // Add event listeners for all relevant events
    window.addEventListener(
      'stickerDataChanged', 
      handleStickerImported as EventListener
    );
    
    window.addEventListener(
      StorageEvents.IMPORT_COMPLETE,
      handleImportComplete as EventListener
    );
    
    window.addEventListener(
      StorageEvents.STICKERS,
      () => invalidateQueries(['stickers', albumId])
    );
    
    // Cleanup
    return () => {
      window.removeEventListener(
        'stickerDataChanged', 
        handleStickerImported as EventListener
      );
      
      window.removeEventListener(
        StorageEvents.IMPORT_COMPLETE,
        handleImportComplete as EventListener
      );
      
      window.removeEventListener(
        StorageEvents.STICKERS,
        () => invalidateQueries(['stickers', albumId])
      );
    };
  }, [albumId, onImportComplete, toast, invalidateQueries]);

  return <CSVImportDialog albumId={albumId} onImportComplete={onImportComplete} />;
};

export default ImportStickers;
