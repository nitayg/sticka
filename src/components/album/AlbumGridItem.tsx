
import { useState } from "react";
import { Album } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from "../ui/alert-dialog";
import { moveAlbumToRecycleBin } from "@/lib/recycle-bin";
import { useToast } from "../ui/use-toast";

interface AlbumGridItemProps {
  album: Album;
  isSelected: boolean;
  onClick: () => void;
  onRefresh: () => void;
}

const AlbumGridItem = ({ album, isSelected, onClick, onRefresh }: AlbumGridItemProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add edit functionality
    console.log("Edit album", album.id);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    moveAlbumToRecycleBin(album.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "אלבום הועבר לסל המיחזור",
      description: `האלבום "${album.name}" הועבר לסל המיחזור ויימחק לצמיתות אחרי 30 יום`,
    });
    
    onRefresh();
  };
  
  return (
    <>
      <div 
        className={`fb-story-item aspect-[9/16] cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsHovering(true)}
        onTouchEnd={() => setTimeout(() => setIsHovering(false), 2000)}
      >
        {/* Album cover */}
        <img 
          src={album.coverImage || "/placeholder.svg"} 
          alt={album.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Album gradient overlay */}
        <div className="fb-story-gradient">
          <p className="fb-story-title">{album.name}</p>
        </div>
        
        {/* Edit & Delete icons */}
        {(isHovering || isSelected) && (
          <div className="absolute top-1 right-1 flex flex-col gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full bg-black/50 hover:bg-black/70"
              onClick={handleEditClick}
            >
              <Pencil className="h-3.5 w-3.5 text-white" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full bg-black/50 hover:bg-red-500/70"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת אלבום</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את האלבום "{album.name}"?
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
              onClick={confirmDelete}
              className="p-0 m-0"
            >
              <Button variant="destructive" size="icon">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AlbumGridItem;
