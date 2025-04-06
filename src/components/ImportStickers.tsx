
import { CSVImportDialog } from "./csv-import/CSVImportDialog";
import { useToast } from "./ui/use-toast";
import { useEffect } from "react";

interface ImportStickersProps {
  albumId: string;
  onImportComplete: () => void;
}

const ImportStickers = ({ albumId, onImportComplete }: ImportStickersProps) => {
  const { toast } = useToast();
  
  // Handle special event for import completion
  useEffect(() => {
    const handleStickerImported = (e: CustomEvent) => {
      const { count, albumId: importedAlbumId } = e.detail || {};
      
      if (importedAlbumId === albumId && count) {
        toast({
          title: "ייבוא מדבקות",
          description: `${count} מדבקות יובאו בהצלחה`,
        });
        
        // Notify parent component
        onImportComplete();
      }
    };
    
    // Add event listener for sticker data changes
    window.addEventListener(
      'stickerDataChanged', 
      handleStickerImported as EventListener
    );
    
    // Cleanup
    return () => {
      window.removeEventListener(
        'stickerDataChanged', 
        handleStickerImported as EventListener
      );
    };
  }, [albumId, onImportComplete, toast]);

  return <CSVImportDialog albumId={albumId} onImportComplete={onImportComplete} />;
};

export default ImportStickers;
