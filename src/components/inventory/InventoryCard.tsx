
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
        "flex-1 rounded-xl p-4 text-right transition-all duration-300",
        "border",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={cn(
        "text-2xl font-bold mt-1",
        active ? "text-interactive" : "text-foreground"
      )}>
        {value}
      </div>
    </button>
  );
};

export default InventoryCard;
