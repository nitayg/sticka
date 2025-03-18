
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
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || 
                            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      // Auto switch to compact view on small mobile devices
      if (isMobileDevice && viewMode === "list" && window.innerWidth < 375) {
        setViewMode("compact");
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleViewModeToggle = () => {
    // Cycle through view modes: grid -> list -> compact -> grid
    // On iOS devices, skip the list mode to avoid crashes
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    
    if (viewMode === "grid") {
      if (isIOS) {
        setViewMode("compact");
      } else {
        setViewMode("list");
      }
    } else if (viewMode === "list") {
      setViewMode("compact");
    } else {
      setViewMode("grid");
    }
    
    // Log the change for debugging
    console.log(`View mode changed to: ${viewMode} on device: ${navigator.userAgent}`);
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
