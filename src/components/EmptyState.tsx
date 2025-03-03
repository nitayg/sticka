
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      "animate-fade-in",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
