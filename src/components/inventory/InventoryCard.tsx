
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}

const InventoryCard = ({ title, value, active, onClick }: InventoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg p-2 text-right transition-all duration-300",
        "border",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <div className={cn(
        "text-xl font-bold",
        active ? "text-interactive" : "text-foreground"
      )}>
        {value}
      </div>
    </button>
  );
};

export default InventoryCard;
