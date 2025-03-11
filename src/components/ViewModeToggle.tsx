
import { LayoutGrid, LayoutList, List, Image } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
  viewMode?: "grid" | "list" | "compact";
  setViewMode?: (mode: "grid" | "list" | "compact") => void;
  showImages?: boolean;
  setShowImages?: (show: boolean) => void;
  iconOnly?: boolean;
}

const ViewModeToggle = ({
  viewMode = "grid",
  setViewMode = () => {},
  showImages = true,
  setShowImages = () => {},
  iconOnly = false
}: ViewModeToggleProps) => {
  const handleViewModeToggle = () => {
    // Cycle through view modes: grid -> list -> compact -> grid
    if (viewMode === "grid") {
      setViewMode("list");
    } else if (viewMode === "list") {
      setViewMode("compact");
    } else {
      setViewMode("grid");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={handleViewModeToggle}
        title={
          viewMode === "grid" 
            ? (iconOnly ? "תצוגת רשת" : "רשת") 
            : viewMode === "list" 
              ? (iconOnly ? "תצוגת רשימה" : "רשימה") 
              : (iconOnly ? "תצוגה קומפקטית" : "קומפקטי")
        }
      >
        {viewMode === "grid" ? (
          <Image className="h-5 w-5" />
        ) : viewMode === "list" ? (
          <LayoutList className="h-5 w-5" />
        ) : (
          <List className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ViewModeToggle;
