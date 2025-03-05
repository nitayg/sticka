
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";

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
        
        <h1 className="text-base font-bold">STICKA</h1>
        
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
  );
};

export default MobileHeader;
