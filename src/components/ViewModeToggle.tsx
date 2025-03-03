
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Grid, List, LayoutGrid } from "lucide-react"; 

interface ViewModeToggleProps {
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages?: boolean;
  setShowImages?: (show: boolean) => void;
}

const ViewModeToggle = ({ 
  viewMode, 
  setViewMode, 
  showImages = true, 
  setShowImages 
}: ViewModeToggleProps) => {
  return (
    <div className="flex">
      <button 
        onClick={() => setViewMode("grid")}
        className={cn(
          "p-2 rounded-md transition-colors",
          viewMode === "grid" 
            ? "bg-secondary text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="תצוגת קלפים"
      >
        <Grid size={20} />
      </button>
      <button 
        onClick={() => setViewMode("list")}
        className={cn(
          "p-2 rounded-md transition-colors",
          viewMode === "list" 
            ? "bg-secondary text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="תצוגת רשימה"
      >
        <List size={20} />
      </button>
      <button 
        onClick={() => setViewMode("compact")}
        className={cn(
          "p-2 rounded-md transition-colors",
          viewMode === "compact" 
            ? "bg-secondary text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="תצוגה קומפקטית"
      >
        <LayoutGrid size={20} />
      </button>
      
      {setShowImages && viewMode !== "compact" && (
        <button 
          onClick={() => setShowImages(!showImages)}
          className={cn(
            "p-2 rounded-md transition-colors ml-2",
            showImages
              ? "text-foreground hover:text-muted-foreground" 
              : "bg-secondary text-foreground"
          )}
          title={showImages ? "Hide images" : "Show images"}
        >
          {showImages ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      )}
    </div>
  );
};

export default ViewModeToggle;
