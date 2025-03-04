
import { cn } from "@/lib/utils";
import { LayoutGrid, Check, AlertCircle, Copy } from "lucide-react";

interface InventoryCardProps {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}

const InventoryCard = ({ title, value, active, onClick }: InventoryCardProps) => {
  // Select appropriate icon based on title
  const getIcon = () => {
    switch (title) {
      case "סך הכל":
        return <LayoutGrid className="h-3.5 w-3.5" />;
      case "ברשותי":
        return <Check className="h-3.5 w-3.5" />;
      case "חסרים":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "כפולים":
        return <Copy className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

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
      <div className="flex justify-between items-start">
        <div className={cn(
          "p-1 rounded-sm",
          active ? "text-interactive" : "text-muted-foreground"
        )}>
          {getIcon()}
        </div>
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-muted-foreground">{title}</div>
          <div className={cn(
            "text-xl font-bold",
            active ? "text-interactive" : "text-foreground"
          )}>
            {value}
          </div>
        </div>
      </div>
    </button>
  );
};

export default InventoryCard;
