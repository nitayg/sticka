
import { ReactNode, useState, useEffect } from "react";
import { Album, List, ArrowLeftRight, Home, Shield } from "lucide-react";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import { NavigationItem } from "@/lib/types";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();
  
  // Track if we're on the main album view to control overflow behavior
  const isAlbumView = location.pathname === "/";

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

  // Handle scroll direction
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 10);
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigation: NavigationItem[] = [
    { name: "בית", href: "/", icon: Home },
    { name: "מלאי", href: "/inventory", icon: List },
    { name: "עסקאות", href: "/exchange", icon: ArrowLeftRight },
    { name: "מועדונים", href: "/clubs", icon: Shield },
  ];

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col w-full", 
      isAlbumView && "prevent-scroll", 
      "dir-rtl" // Ensure RTL direction
    )}>
      {/* Mobile Header */}
      <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Mobile Menu */}
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navigation={navigation} 
      />

      {/* Background gradient subtle effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/10 to-background z-[-1]" />

      <div className="flex flex-1">
        {/* Main Content */}
        <main className={cn(
          "flex-1 pt-14 pb-16 w-full", 
          isAlbumView ? "main-content overflow-hidden" : "overflow-y-auto overflow-x-hidden"
        )}>
          <div className="max-w-4xl mx-auto px-1 animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Footer navigation that hides when scrolling down */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md text-foreground border-t border-border/40 transition-transform duration-300 ease-in-out ${isScrollingDown ? 'translate-y-full' : 'translate-y-0'} safe-area-inset-bottom`}>
        <div className="w-full flex justify-between items-center px-2 py-2" dir="rtl">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={index}
                to={item.href}
                className={`flex flex-col items-center justify-center py-1 px-1 transition-all duration-300 ${
                  isActive 
                    ? "text-interactive" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`relative ${isActive ? 'nav-icon-active' : ''}`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-interactive/20 rounded-full -m-1 animate-pulse" />
                  )}
                  <item.icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]' : ''}`} />
                </div>
                <span className={`text-xs mt-1 transition-all duration-300 ${
                  isActive ? 'font-medium' : ''
                }`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;
