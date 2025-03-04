
import { ReactNode, useState, useEffect } from "react";
import { Album, Image, List, Search } from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import MobileNavigation from "./MobileNavigation";
import { NavigationItem } from "@/lib/types";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);

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
    { name: "החלפות", href: "/exchange", icon: Search },
    { name: "סריקה", href: "/scan", icon: Image }
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
        {/* Desktop Sidebar - improved visibility */}
        <DesktopSidebar navigation={navigation} albumId={currentAlbumId} />

        {/* Main Content - improved padding for better content presentation */}
        <main className="flex-1 p-3 sm:p-5 lg:py-6 lg:px-8 overflow-x-hidden pb-16 md:pb-6">
          <div className="max-w-6xl mx-auto">
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
