import { Menu, Plus, Search, MessageCircle, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import SettingsButton from "./settings/SettingsButton";
import ViewModeToggle from "./ViewModeToggle";
import { useAlbumStore } from "@/store/useAlbumStore";
import SyncIndicator from "./SyncIndicator";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const MobileHeader = ({ isMenuOpen, setIsMenuOpen }: MobileHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { viewMode, setViewMode, showImages, setShowImages } = useAlbumStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="fixed top-0 inset-x-0 h-14 bg-background z-50 border-b border-gray-800">
      <div className="flex h-full items-center px-4 justify-between">
        {/* Right side - Logo */}
        <div className="flex items-center order-1">
          <img 
            src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png" 
            alt="STICKA Logo" 
            className="h-8" 
          />
          <span className="text-xl font-bold mr-2 text-foreground hidden sm:block">STICKA</span>
        </div>
        
        {/* Left side - Action buttons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse order-2">
          <SyncIndicator headerPosition={true} />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <SettingsButton iconOnly />
          
          <ViewModeToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
            showImages={showImages}
            setShowImages={setShowImages}
            iconOnly
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
