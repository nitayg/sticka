
import { Menu, Plus, Search, MessageCircle, Sun, Moon, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import SettingsButton from "./settings/SettingsButton";
import ViewModeToggle from "./ViewModeToggle";
import { useAlbumStore } from "@/store/useAlbumStore";
import SyncIndicator from "./SyncIndicator";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const MobileHeader = ({ isMenuOpen, setIsMenuOpen }: MobileHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { viewMode, setViewMode, showImages, setShowImages } = useAlbumStore();
  const [egressWarnings, setEgressWarnings] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // Track egress warnings by monitoring network errors
    const handleNetworkError = (event) => {
      const errorMessage = event.message || event.error?.message || '';
      if (errorMessage.includes('egress') || 
          errorMessage.includes('exceeded') || 
          errorMessage.includes('limit')) {
        setEgressWarnings(prev => prev + 1);
      }
    };
    
    // Track online/offline status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('error', handleNetworkError);
    window.addEventListener('unhandledrejection', handleNetworkError);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('error', handleNetworkError);
      window.removeEventListener('unhandledrejection', handleNetworkError);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Function to handle click on the EgressMonitor button in header
  const handleEgressButtonClick = () => {
    // Dispatch a custom event that EgressMonitor will listen for
    window.dispatchEvent(new CustomEvent('toggleEgressMonitor'));
  };

  return (
    <div className="fixed top-0 inset-x-0 h-14 bg-gradient-to-r from-background to-background/90 backdrop-blur-md z-50 border-b border-gray-800/50 shadow-sm">
      <div className="flex h-full items-center px-4 justify-between">
        {/* Right side - Logo */}
        <div className="flex items-center order-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 bg-blue-500/20 blur-lg transition-opacity duration-300"></div>
            <img 
              src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png" 
              alt="STICKA Logo" 
              className="h-8 relative z-10 transition-transform duration-300" 
            />
          </div>
          <span className="text-xl font-bold mr-2 text-foreground hidden sm:block gradient-text">
            STICKA
          </span>
        </div>
        
        {/* Left side - Action buttons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse order-2">
          <SyncIndicator headerPosition={true} />
          
          <div className="h-9 w-9 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-500/10"
              onClick={handleEgressButtonClick}
            >
              {isOffline ? (
                <WifiOff className="h-4 w-4 text-orange-500" />
              ) : (
                <div className="relative">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  {egressWarnings > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                      {egressWarnings > 9 ? '9+' : egressWarnings}
                    </span>
                  )}
                </div>
              )}
            </Button>
          </div>
          
          <div>
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
              <span className="sr-only">החלפת ערכת נושא</span>
            </Button>
          </div>
          
          <div>
            <SettingsButton iconOnly />
          </div>
          
          <div>
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
    </div>
  );
};

export default MobileHeader;
