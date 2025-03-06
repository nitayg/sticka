
import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/lib/types";
import { Button } from "./ui/button";
import SyncInstructionsDialog from "./sync/SyncInstructionsDialog";

interface DesktopSidebarProps {
  navigation: NavigationItem[];
  albumId?: string;
  collapsed: boolean;
  onToggle: () => void;
}

const DesktopSidebar = ({ navigation, albumId, collapsed, onToggle }: DesktopSidebarProps) => {
  return (
    <aside
      className={cn(
        "border-l fixed top-0 bottom-0 right-0 z-30 bg-card hidden md:flex flex-col transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className={cn("flex items-center", collapsed ? "hidden" : "")}>
          <span className="font-semibold text-lg">אלבום מדבקות</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="mt-2 flex-1 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href + (item.href === "/" && albumId ? `?album=${albumId}` : "")}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-interactive/10 text-interactive"
                      : "text-foreground/80 hover:bg-muted/40 hover:text-foreground"
                  )
                }
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mx-auto" : "")} />
                <span className={cn(collapsed ? "hidden" : "block")}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t">
        {collapsed ? (
          <SyncInstructionsDialog
            trigger={
              <Button variant="secondary" size="icon" className="w-full" title="סנכרון בין מכשירים">
                <Cloud className="h-4 w-4" />
              </Button>
            }
          />
        ) : (
          <SyncInstructionsDialog
            trigger={
              <Button variant="secondary" className="w-full text-sm" title="סנכרון בין מכשירים">
                <Cloud className="h-4 w-4 mr-2" />
                סנכרון מכשירים
              </Button>
            }
          />
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;
