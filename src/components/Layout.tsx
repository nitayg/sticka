
import { cn } from "@/lib/utils";
import { Album, Image, List, Search } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "אלבום", href: "/", icon: Album },
    { name: "מלאי", href: "/inventory", icon: List },
    { name: "החלפות", href: "/exchange", icon: Search },
    { name: "סריקה", href: "/scan", icon: Image }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col w-full" dir="rtl">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border h-14 flex items-center justify-between px-4">
        <div className="flex items-center">
          <span className="font-semibold text-lg">אוסף מדבקות</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
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
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
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
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-medium mb-2">סטטוס האוסף</h3>
                <div className="text-xs text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>סה"כ מדבקות</span>
                    <span className="font-medium">250</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>נאספו</span>
                    <span className="font-medium">182</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>חסרות</span>
                    <span className="font-medium">68</span>
                  </div>
                  <div className="flex justify-between">
                    <span>כפולות</span>
                    <span className="font-medium">45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:py-8 lg:px-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
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
    </div>
  );
};

export default Layout;
