
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
      "flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0 pb-2",
      "animate-fade-up",
      className
    )}>
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );
};

export default Header;
