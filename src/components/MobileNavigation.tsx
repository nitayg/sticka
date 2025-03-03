
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { NavigationItem } from "@/lib/types";

interface MobileNavigationProps {
  navigation: NavigationItem[];
}

const MobileNavigation = ({ navigation }: MobileNavigationProps) => {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <nav className="flex justify-around">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center py-3 px-2 text-xs font-medium",
              location.pathname === item.href 
                ? "text-interactive" 
                : "text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MobileNavigation;
