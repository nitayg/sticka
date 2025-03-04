
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
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
    <div className="md:hidden fixed top-0 inset-x-0 h-14 border-b border-border/70 bg-background/80 backdrop-blur-sm z-50 flex items-center px-4">
      <div className="flex w-full justify-between items-center">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <h1 className="text-lg font-bold">אוסף מדבקות</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
