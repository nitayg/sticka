
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationItem[];
}

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, navigation }: MobileMenuProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div 
          className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsMenuOpen(false)}
        >
          <motion.div 
            className="pt-20 px-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <div className="absolute top-16 left-8 w-20 h-20 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          
            <nav className="grid gap-2 relative z-10">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-300 relative overflow-hidden",
                      location.pathname === item.href 
                        ? "bg-interactive text-interactive-foreground font-medium shadow-lg shadow-blue-500/20" 
                        : "hover:bg-secondary group"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {/* Subtle highlight effect */}
                    {location.pathname === item.href && (
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute left-0 top-0 h-full w-1/6 bg-white/20 transform -skew-x-12 animate-[shimmer_4s_infinite]" />
                      </div>
                    )}
                    
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-300", 
                      location.pathname !== item.href && "group-hover:scale-110"
                    )} />
                    <span className="relative">
                      {item.name}
                      
                      {/* Animated underline effect for inactive items */}
                      {location.pathname !== item.href && (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                      )}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
