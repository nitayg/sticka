
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import StatsPanel from "./StatsPanel";
import { NavigationItem } from "@/lib/types";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/hooks/use-theme";
import SettingsButton from "./settings/SettingsButton";

interface DesktopSidebarProps {
  navigation: NavigationItem[];
  albumId: string | undefined;
  collapsed?: boolean;
  onToggle?: () => void;
}

const DesktopSidebar = ({ 
  navigation, 
  albumId, 
  collapsed = false,
  onToggle
}: DesktopSidebarProps) => {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <aside 
      className={cn(
        "hidden lg:flex h-screen sticky top-0 z-30 shrink-0 border-l border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex w-full flex-col gap-2 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "py-6 flex items-center",
          collapsed ? "justify-center px-0" : "px-2"
        )}>
          {!collapsed && (
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/38a92b8b-bd90-442f-b21a-fc868063cbe5.png" 
                alt="STICKA Logo" 
                className="h-8 w-8 mr-3" 
              />
              <div>
                <h2 className="text-xl font-semibold">STICKA</h2>
                <p className="text-xs text-muted-foreground mt-1">נהל את האוסף שלך</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <img 
              src="/lovable-uploads/38a92b8b-bd90-442f-b21a-fc868063cbe5.png" 
              alt="STICKA Logo" 
              className="h-8 w-8" 
            />
          )}
          
          {onToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              className={cn(
                "p-0 h-6 w-6 ml-auto rounded-full",
                collapsed ? "mr-0" : "mr-2"
              )}
            >
              {collapsed ? 
                <ChevronLeft className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          )}
        </div>
        
        <nav className={cn(
          "grid gap-1",
          collapsed ? "px-1" : "px-2"
        )}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                location.pathname === item.href 
                  ? "bg-interactive text-interactive-foreground font-medium" 
                  : "text-foreground hover:bg-secondary",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5", collapsed && "h-5 w-5")} />
              {!collapsed && item.name}
            </Link>
          ))}
        </nav>
        
        <div className={cn(
          "mt-auto",
          collapsed ? "px-1 py-2" : "px-2 py-4"
        )}>
          {!collapsed && (
            <>
              <StatsPanel albumId={albumId} />
              
              <div className="mt-6 border-t border-border pt-4">
                <SettingsButton variant="ghost" />
              </div>
            </>
          )}
          
          {collapsed && albumId && (
            <div className="flex flex-col items-center py-2">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mb-2">
                <span className="text-xs font-medium">S</span>
              </div>
              <div className="text-[10px] text-muted-foreground">סטטיסטיקה</div>
              
              <div className="mt-4 border-t border-border pt-4 w-full flex justify-center">
                <SettingsButton iconOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
