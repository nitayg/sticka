
import React, { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2, AlertTriangle } from "lucide-react";
import { updateTeamNameAcrossStickers } from "@/lib/sticker-operations";
import { useToast } from "@/components/ui/use-toast";

interface TeamDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  team: string;
  teamLogo: string;
  onTeamsUpdate: () => void;
}

const TeamDeleteDialog = ({
  isOpen,
  onClose,
  team,
  teamLogo,
  onTeamsUpdate
}: TeamDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Update stickers with this team to empty team name
      const updatedCount = updateTeamNameAcrossStickers(team, "", "");
      
      // Close the dialog
      onClose();
      
      // Refresh the team list
      onTeamsUpdate();
      
      // Show success message
      toast({
        title: "קבוצה נמחקה",
        description: `קבוצת "${team}" נמחקה. עודכנו ${updatedCount} מדבקות.`,
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "שגיאה במחיקת הקבוצה",
        description: "אירעה שגיאה במחיקת הקבוצה. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            מחיקת קבוצה
          </AlertDialogTitle>
          <AlertDialogDescription>
            האם למחוק את קבוצת "{team}"? פעולה זו תסיר את שם הקבוצה מכל המדבקות המשויכות אליה.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center justify-center gap-3 bg-muted p-4 rounded-md">
            {teamLogo ? (
              <img src={teamLogo} alt={team} className="w-10 h-10 object-contain" />
            ) : (
              <Shield className="w-10 h-10 text-muted-foreground" />
            )}
            <span className="text-lg font-semibold">{team}</span>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "מוחק..." : "מחק קבוצה"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TeamDeleteDialog;
