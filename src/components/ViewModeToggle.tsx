
import { LayoutGrid, List, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ViewModeToggleProps {
  viewMode: "grid" | "list" | "compact";
  setViewMode: (mode: "grid" | "list" | "compact") => void;
  showImages: boolean;
  setShowImages: (show: boolean) => void;
  iconOnly?: boolean;
}

const ViewModeToggle = ({ 
  viewMode, 
  setViewMode, 
  showImages,
  setShowImages,
  iconOnly = false
}: ViewModeToggleProps) => {
  const getNextMode = () => {
    switch (viewMode) {
      case "grid":
        return "list";
      case "list":
        return "compact";
      case "compact":
        return "grid";
    }
  };

  const getIconForMobile = () => {
    switch (viewMode) {
      case "grid":
        return <LayoutGrid className="h-5 w-5" />;
      case "list":
        return <List className="h-5 w-5" />;
      case "compact":
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  // Simplified toggle - just cycles through the view modes
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setViewMode(getNextMode())}
          >
            {getIconForMobile()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>שנה תצוגה</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewModeToggle;
