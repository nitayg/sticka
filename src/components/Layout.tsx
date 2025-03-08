
import { ReactNode, useState, useEffect } from "react";
import { Album, List, ArrowLeftRight, Image, Home, Users, ShoppingBag, Bell, Menu } from "lucide-react";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import { NavigationItem } from "@/lib/types";
import { useTheme } from "@/hooks/use-theme";
import StatsPanel from "./StatsPanel";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);
  const { theme } = useTheme();

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
    { name: "בית", href: "/", icon: Home },
    { name: "מלאי", href: "/inventory", icon: List },
    { name: "חברים", href: "/exchange", icon: Users },
    { name: "חנות", href: "/scan", icon: ShoppingBag },
    { name: "התראות", href: "#", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col w-full" dir="rtl">
      {/* Mobile Header - Facebook style */}
      <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Mobile Menu */}
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navigation={navigation} 
      />

      <div className="flex flex-1">
        {/* Main Content - with improved padding and scrolling */}
        <main className="flex-1 pt-14 pb-16 overflow-y-auto overflow-x-hidden w-full">
          <div className="max-w-4xl mx-auto px-1">
            {children}
          </div>
        </main>
      </div>

      {/* Facebook-style footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white border-t border-gray-800">
        <div className="w-full flex justify-between items-center px-2 py-2 safe-area-inset-bottom">
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center p-1 ${
                window.location.pathname === item.href ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
