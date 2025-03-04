
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
            <nav className="grid gap-2">
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
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                      location.pathname === item.href 
                        ? "bg-interactive text-interactive-foreground font-medium" 
                        : "hover:bg-secondary"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
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
