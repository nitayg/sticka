
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
          "relative group aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 hover:border-primary",
          isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
        )}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-full h-full bg-muted relative">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={name} 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/30">
              <span className="text-4xl font-bold text-foreground/30">
                {name.substring(0, 1).toLocaleUpperCase()}
              </span>
            </div>
          )}

          {/* Darkened overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Album name */}
          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs font-semibold text-white line-clamp-2 text-center">
            {name}
          </div>

          {/* Action buttons */}
          <TooltipProvider>
            <div className={`absolute top-1 right-1 flex gap-1 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 bg-white/90 rounded-full hover:bg-white text-gray-800"
                    onClick={handleEdit}
                  >
                    <Pencil size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ערוך אלבום</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 bg-white/90 rounded-full hover:bg-white text-gray-800"
                    onClick={handleDelete}
                  >
                    <Trash size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>העבר לסל המיחזור</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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
