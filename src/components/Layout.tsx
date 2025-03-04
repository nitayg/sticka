
import { ReactNode, useState, useEffect } from "react";
import { Album, Image, List, ArrowLeftRight, Moon, Sun, X } from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import MobileNavigation from "./MobileNavigation";
import { NavigationItem } from "@/lib/types";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  // Listen for album changes from children components
  useEffect(() => {
    // Create a custom event listener to receive the current album ID
    const handleAlbumChange = (event: CustomEvent) => {
      setCurrentAlbumId(event.detail.albumId);
    };

    // Add event listener
    window.addEventListener('albumChanged' as any, handleAlbumChange);

    // Cleanup
    return () => {
      window.removeEventListener('albumChanged' as any, handleAlbumChange);
    };
  }, []);

  const navigation: NavigationItem[] = [
    { name: "אלבום", href: "/", icon: Album },
    { name: "מלאי", href: "/inventory", icon: List },
    { name: "החלפות", href: "/exchange", icon: ArrowLeftRight },
    { name: "סריקה", href: "/scan", icon: Image }
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full" dir="rtl">
      {/* Mobile Header */}
      <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Mobile Menu */}
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navigation={navigation} 
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar - with collapsible functionality */}
        <DesktopSidebar 
          navigation={navigation} 
          albumId={currentAlbumId} 
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Main Content - with sidebar toggle and improved responsive padding */}
        <main className={`flex-1 p-3 sm:p-5 lg:py-6 lg:px-8 overflow-x-hidden pb-16 md:pb-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:pr-20' : 'lg:pr-8'}`}>
          <div className="max-w-6xl mx-auto w-full">
            <div className="hidden lg:flex justify-between items-center mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar} 
                className="mr-2"
              >
                {sidebarCollapsed ? <List className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="ml-auto"
              >
                {theme === 'dark' ? 
                  <Sun className="h-4 w-4" /> : 
                  <Moon className="h-4 w-4" />
                }
                <span className="sr-only">Toggle Theme</span>
              </Button>
            </div>
            
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation - improved styling */}
      <MobileNavigation navigation={navigation} />
    </div>
  );
};

export default Layout;
