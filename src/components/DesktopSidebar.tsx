
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import StatsPanel from "./StatsPanel";
import { NavigationItem } from "@/lib/types";

interface DesktopSidebarProps {
  navigation: NavigationItem[];
  albumId: string | undefined;
}

const DesktopSidebar = ({ navigation, albumId }: DesktopSidebarProps) => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex h-screen sticky top-0 z-30 w-64 shrink-0 border-l border-border">
      <div className="flex w-full flex-col gap-2 p-4">
        <div className="px-2 py-6">
          <h2 className="text-xl font-semibold">אוסף מדבקות</h2>
          <p className="text-xs text-muted-foreground mt-1">נהל את האוסף שלך</p>
        </div>
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                location.pathname === item.href 
                  ? "bg-interactive text-interactive-foreground font-medium" 
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2 py-4">
          <StatsPanel albumId={albumId} />
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
