
import { LayoutGrid, List, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const getIcon = () => {
    switch (viewMode) {
      case "grid":
        return <LayoutGrid className="h-4 w-4 ml-2" />;
      case "list":
        return <List className="h-4 w-4 ml-2" />;
      case "compact":
        return <ImageIcon className="h-4 w-4 ml-2" />;
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

  return (
    <>
      {iconOnly ? (
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
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {getIcon()}
              <span>תצוגה</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4 ml-2" />
              <span>גריד</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 ml-2" />
              <span>רשימה</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("compact")}>
              <ImageIcon className="h-4 w-4 ml-2" />
              <span>קומפקטי</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowImages(!showImages)}>
              <ImageIcon className="h-4 w-4 ml-2" />
              <span>{showImages ? 'הסתר תמונות' : 'הצג תמונות'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default ViewModeToggle;
