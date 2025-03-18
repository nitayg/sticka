
import { LayoutList, Image, Grid2X2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  // Check if device is iOS
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const isiOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isiOSDevice);
  }, []);

  const handleViewModeToggle = () => {
    // Cycle through view modes: grid -> compact -> list -> grid 
    // On iOS, skip list mode which can cause issues on smaller devices
    if (viewMode === "grid") {
      setViewMode("compact");
    } else if (viewMode === "compact") {
      setViewMode(isIOS ? "grid" : "list"); // Skip list mode on iOS
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
          <Grid2X2 className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ViewModeToggle;
