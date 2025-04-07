
import { Menu, Plus, Search, MessageCircle, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import SettingsButton from "./settings/SettingsButton";
import ViewModeToggle from "./ViewModeToggle";
import { useAlbumStore } from "@/store/useAlbumStore";
import SyncIndicator from "./SyncIndicator";
import EgressMonitor from "./EgressMonitor";

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
    <div className="fixed top-0 inset-x-0 h-14 bg-gradient-to-r from-background to-background/90 backdrop-blur-md z-50 border-b border-gray-800/50 shadow-sm transition-all duration-300">
      <div className="flex h-full items-center px-4 justify-between">
        {/* Right side - Logo */}
        <div className="flex items-center order-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-blue-500/20 blur-lg transition-opacity duration-300"></div>
            <img 
              src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png" 
              alt="STICKA Logo" 
              className="h-8 relative z-10 hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <span className="text-xl font-bold mr-2 text-foreground hidden sm:block gradient-text">STICKA</span>
        </div>
        
        {/* Left side - Action buttons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse order-2">
          <SyncIndicator headerPosition={true} />
          
          <EgressMonitor inHeader={true} />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 transition-transform hover:rotate-45 duration-300" />
            ) : (
              <Moon className="h-5 w-5 transition-transform hover:rotate-12 duration-300" />
            )}
            <span className="sr-only">Toggle theme</span>
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
