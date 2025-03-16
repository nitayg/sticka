
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const Header = ({ title, subtitle, action, className }: HeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "flex flex-row items-center justify-between space-y-1 sm:space-y-0 sticky top-0 z-10",
      "animate-fade-up backdrop-blur-sm bg-background/90 pt-2",
      isMobile ? "pb-2" : "pb-3",
      className
    )}>
      <div className="smooth-fade-in">
        <h1 className={cn(
          "font-bold tracking-tight text-right gradient-text",
          isMobile ? "text-lg" : "text-xl"
        )}>{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 text-right smooth-fade-in delay-200">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 smooth-fade-in delay-100">{action}</div>
      )}
    </div>
  );
};

export default Header;
