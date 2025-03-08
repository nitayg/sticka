
import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppSettingsPanel from "./AppSettingsPanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SettingsButtonProps {
  variant?: "default" | "ghost";
  iconOnly?: boolean;
}

const SettingsButton = ({ variant = "ghost", iconOnly = false }: SettingsButtonProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={variant} 
              size="icon"
              onClick={openSettings}
              className={iconOnly ? "h-9 w-9 rounded-full" : ""}
            >
              <Settings className={iconOnly ? "h-5 w-5" : "h-4 w-4 ml-2"} />
              {!iconOnly && <span>הגדרות</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>פתח הגדרות אפליקציה</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AppSettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={closeSettings} 
      />
    </>
  );
};

export default SettingsButton;
