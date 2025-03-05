
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import SettingsButton from "./settings/SettingsButton";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const MobileHeader = ({ isMenuOpen, setIsMenuOpen }: MobileHeaderProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="md:hidden fixed top-0 inset-x-0 h-12 border-b border-border/70 bg-background/90 backdrop-blur-sm z-50">
      <div className="flex h-full items-center px-3 justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img 
            src="/lovable-uploads/46e6bbf0-717d-461d-95e4-1584072c6ff0.png" 
            alt="STICKA Logo" 
            className="h-8" 
          />
        </div>
        
        <div className="flex items-center gap-1">
          <SettingsButton iconOnly />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
