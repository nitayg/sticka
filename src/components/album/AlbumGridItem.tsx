
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { moveAlbumToRecycleBin } from "@/lib/recycle-bin";

interface AlbumGridItemProps {
  id: string;
  name: string;
  coverImage?: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (id: string) => void;
}

const AlbumGridItem = ({ id, name, coverImage, isSelected, onSelect, onEdit }: AlbumGridItemProps) => {
  const [hovered, setHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await moveAlbumToRecycleBin(id);
      toast({
        title: "האלבום הועבר לסל המיחזור",
        description: `האלבום "${name}" הועבר לסל המיחזור בהצלחה`,
      });
      
      // Force refresh albums
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        title: "שגיאה במחיקת האלבום",
        description: "אירעה שגיאה בעת העברת האלבום לסל המיחזור",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "h-full w-full rounded-lg overflow-hidden cursor-pointer transition-all border",
          isSelected ? "border-2 border-blue-500" : "border-gray-800"
        )}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-full h-full relative">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-800 flex items-center justify-center">
              <span className="text-3xl text-gray-500">?</span>
            </div>
          )}

          {/* Darkened overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Action buttons */}
          <TooltipProvider>
            <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800"
                    onClick={handleEdit}
                  >
                    <Pencil size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ערוך אלבום</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800"
                    onClick={handleDelete}
                  >
                    <Trash size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>העבר לסל המיחזור</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Album name */}
          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-white truncate">
            {name}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את האלבום?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תעביר את האלבום "{name}" לסל המיחזור. תוכל לשחזר אותו מאוחר יותר.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-end gap-2">
            <AlertDialogAction onClick={confirmDelete}>העבר לסל המיחזור</AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AlbumGridItem;
