
import { LayoutGrid, LayoutList, List } from "lucide-react";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const handleViewModeToggle = (mode: "grid" | "list" | "compact") => {
    setViewMode(mode);
  };

  const handleShowImagesToggle = () => {
    setShowImages(!showImages);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
          >
            {viewMode === "grid" ? (
              <LayoutGrid className="h-5 w-5" />
            ) : viewMode === "list" ? (
              <LayoutList className="h-5 w-5" />
            ) : (
              <List className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className={cn("flex justify-between", viewMode === "grid" && "font-bold")}
            onClick={() => handleViewModeToggle("grid")}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>{iconOnly ? "תצוגת רשת" : "רשת"}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("flex justify-between", viewMode === "list" && "font-bold")}
            onClick={() => handleViewModeToggle("list")}
          >
            <div className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              <span>{iconOnly ? "תצוגת רשימה" : "רשימה"}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("flex justify-between", viewMode === "compact" && "font-bold")}
            onClick={() => handleViewModeToggle("compact")}
          >
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>{iconOnly ? "תצוגה קומפקטית" : "קומפקטי"}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ViewModeToggle;
