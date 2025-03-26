
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { deleteAlbum } from "@/lib/album-operations";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { getStats } from "@/lib/stickers/stats-operations";
import { useAlbumOrderStore } from "@/store/useAlbumOrderStore";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isEditModeActive } = useAlbumOrderStore();
  
  // Calculate completion percentage for this album
  const stats = getStats(id);
  const completionPercentage = stats.total > 0 
    ? Math.round((stats.owned / stats.total) * 100) 
    : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit && !isEditModeActive) {
      onEdit(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditModeActive) {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteAlbum(id);
      
      if (success) {
        toast({
          title: "האלבום נמחק בהצלחה",
          description: `האלבום "${name}" נמחק בהצלחה`,
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['albums'] });
        queryClient.invalidateQueries({ queryKey: ['stickers'] });
        
        // Dispatch event for other components to know about the change
        window.dispatchEvent(new CustomEvent('albumDataChanged'));
      } else {
        throw new Error("Failed to delete album");
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      toast({
        title: "שגיאה במחיקת האלבום",
        description: "אירעה שגיאה בעת מחיקת האלבום",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "h-full w-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group hover-lift",
          "border relative",
          isSelected 
            ? "border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
            : "border-gray-800 hover:border-gray-700",
          isEditModeActive && "cursor-grab"
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
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-3xl text-gray-500">?</span>
            </div>
          )}

          {/* Enhanced gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-80" />

          <TooltipProvider>
            <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${(hovered && !isEditModeActive) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800 transition-transform hover:scale-110 shadow-lg"
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
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white text-gray-800 transition-transform hover:scale-110 shadow-lg"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>מחק אלבום</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Completion progress bar at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-black/40">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[90%] relative">
                <Progress 
                  value={completionPercentage} 
                  className="h-2.5 bg-gray-800/50 overflow-hidden"
                />
                {hovered && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/70 px-2 py-0.5 rounded">
                    {completionPercentage}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Selection indicator */}
        {isSelected && !isEditModeActive && (
          <div className="absolute top-0 left-0 w-0 h-0 border-t-[24px] border-l-[24px] border-blue-500 border-r-transparent border-b-transparent">
            <div className="absolute -top-[18px] -left-[14px] text-white text-[10px]">✓</div>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-morphism">
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את האלבום?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את האלבום "{name}" והמדבקות שלו מהשרת. הפעולה אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-end gap-2">
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90 transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  מוחק...
                </span>
              ) : (
                "מחק"
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="transition-colors">ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AlbumGridItem;
