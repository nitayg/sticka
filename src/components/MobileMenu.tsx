
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "@/lib/types";

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavigationItem[];
}

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, navigation }: MobileMenuProps) => {
  const location = useLocation();
  
  if (!isMenuOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-30 glass" onClick={() => setIsMenuOpen(false)}>
      <div className="pt-20 px-6">
        <nav className="grid gap-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
