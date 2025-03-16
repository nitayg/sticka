
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
      "flex flex-row items-center justify-between sticky top-0 z-10",
      "animate-fade-up backdrop-blur-sm bg-background/90",
      isMobile ? "pb-2 pt-1.5 space-y-0.5" : "pb-3 pt-2 space-y-1",
      className
    )}>
      <div className="smooth-fade-in">
        <h1 className={cn(
          "font-bold tracking-tight text-right gradient-text",
          isMobile ? "text-lg" : "text-xl"
        )}>{title}</h1>
        {subtitle && (
          <p className={cn(
            "text-muted-foreground mt-0.5 text-right smooth-fade-in delay-200",
            isMobile ? "text-[10px]" : "text-xs"
          )}>{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 smooth-fade-in delay-100">{action}</div>
      )}
    </div>
  );
};

export default Header;
