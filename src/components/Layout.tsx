import { ReactNode, useState, useEffect } from "react";
import { Album, Image, List, Search, Shield } from "lucide-react";
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

  useEffect(() => {
    const handleAlbumChange = (event: CustomEvent) => {
      setCurrentAlbumId(event.detail.albumId);
    };

    window.addEventListener('albumChanged' as any, handleAlbumChange);

    return () => {
      window.removeEventListener('albumChanged' as any, handleAlbumChange);
    };
  }, []);

  const navigation: NavigationItem[] = [
    { name: "אלבום", href: "/", icon: Album },
    { name: "מלאי", href: "/inventory", icon: List },
    { name: "החלפות", href: "/exchange", icon: Search },
    { name: "סריקה", href: "/scan", icon: Image },
    { name: "ניהול קבוצות", href: "/teams", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col w-full" dir="rtl">
      <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navigation={navigation} 
      />
      <div className="flex flex-1">
        <DesktopSidebar navigation={navigation} albumId={currentAlbumId} />
        <main className="flex-1 p-4 sm:p-6 lg:py-8 lg:px-10 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <MobileNavigation navigation={navigation} />
    </div>
  );
};

export default Layout;
