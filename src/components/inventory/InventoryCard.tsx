
import { cn } from "@/lib/utils";
import { Grid, Check, AlertCircle, Copy } from "lucide-react";

interface InventoryCardProps {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}

const InventoryCard = ({ title, value, active, onClick }: InventoryCardProps) => {
  // Select icon based on card title
  const getIcon = () => {
    switch (title) {
      case "סך הכל":
        return <Grid className="h-3.5 w-3.5" />;
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
        "flex-1 min-w-[80px] rounded-lg p-2 transition-all duration-300",
        "border",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="text-xs font-medium text-muted-foreground">{title}</div>
        <div className={cn(
          "w-5 h-5 flex items-center justify-center rounded-full",
          active ? "text-interactive" : "text-muted-foreground"
        )}>
          {getIcon()}
        </div>
      </div>
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
