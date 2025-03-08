
import { ReactNode, useState, useEffect } from "react";
import { Album, List, ArrowLeftRight, Home } from "lucide-react";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import { NavigationItem } from "@/lib/types";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

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
  ];

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
        {/* Main Content */}
        <main className="flex-1 pt-14 pb-20 overflow-y-auto overflow-x-hidden w-full">
          <div className="max-w-4xl mx-auto px-1">
            {children}
          </div>
        </main>
      </div>

      {/* Footer navigation that hides when scrolling down */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t border-gray-800 transition-transform duration-300 ${isScrollingDown ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="w-full flex justify-between items-center px-2 pt-2 pb-8">
          {navigation.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`flex flex-col items-center justify-center p-1 ${
                location.pathname === item.href ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
