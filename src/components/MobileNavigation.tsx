
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "@/lib/types";

interface MobileNavigationProps {
  navigation: NavigationItem[];
}

const MobileNavigation = ({ navigation }: MobileNavigationProps) => {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-border/70 pb-5 safe-area-inset-bottom">
      <nav className="flex justify-around">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors relative",
              location.pathname === item.href 
                ? "text-interactive" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {location.pathname === item.href && (
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-interactive rounded-full" />
            )}
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-center mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileNavigation;
