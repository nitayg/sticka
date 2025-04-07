import { ReactNode, useState, useEffect } from "react";
import { Album, List, ArrowLeftRight, Home, Shield } from "lucide-react";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import { NavigationItem } from "@/lib/types";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import EgressMonitor from "./EgressMonitor";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | undefined>(undefined);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [prevPath, setPrevPath] = useState('');
  const { theme } = useTheme();
  const location = useLocation();
  
  const isAlbumView = location.pathname === "/";

  useEffect(() => {
    setPrevPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const handleAlbumChange = (event: CustomEvent) => {
      setCurrentAlbumId(event.detail.albumId);
    };

    window.addEventListener('albumChanged' as any, handleAlbumChange);

    return () => {
      window.removeEventListener('albumChanged' as any, handleAlbumChange);
    };
  }, []);

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

  const getDirection = () => {
    const pathIndex = (path: string) => {
      return navigation.findIndex(item => item.href === path);
    };
    
    const current = pathIndex(location.pathname);
    const previous = pathIndex(prevPath);
    
    return current > previous ? -1 : 1;
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 20 * getDirection()
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: -20 * getDirection()
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col w-full", 
      isAlbumView && "prevent-scroll", 
      "dir-rtl"
    )}>
      <MobileHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navigation={navigation} 
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/10 to-background z-[-1]" />
      <div className="flex flex-1">
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className={cn(
              "flex-1 pt-14 pb-24 w-full", 
              isAlbumView ? "main-content overflow-hidden" : "overflow-y-auto overflow-x-hidden"
            )}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <div className="max-w-4xl mx-auto px-1">
              {children}
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
      
      <motion.div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md text-foreground border-t border-border/40 safe-area-inset-bottom`}
        initial={{ y: 100 }}
        animate={{ y: isScrollingDown ? 100 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-full flex justify-between items-center px-6 py-2" dir="rtl">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={index}
                to={item.href}
                className="flex flex-col items-center justify-center transition-all duration-300"
              >
                <motion.div 
                  className={cn(
                    "relative flex flex-col items-center",
                    isActive ? "text-interactive" : "text-muted-foreground hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-interactive/20 rounded-full -m-1" 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300 mb-1",
                    isActive ? 'drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]' : ''
                  )} />
                  <span className={cn(
                    "text-xs text-center transition-all duration-300",
                    isActive ? 'font-medium' : ''
                  )}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
      <EgressMonitor />
    </div>
  );
};

export default Layout;
