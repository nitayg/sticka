
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const Header = ({ title, subtitle, action, className }: HeaderProps) => {
  return (
    <div className={cn(
      "flex flex-row items-center justify-between space-y-0 pb-2 sticky top-0 z-10", // Reduced padding
      "animate-fade-up backdrop-blur-sm bg-background/90 pt-1", // Reduced padding
      className
    )}>
      <div className="smooth-fade-in">
        <h1 className="text-lg font-bold tracking-tight text-right gradient-text">{title}</h1> {/* Reduced text size */}
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
