
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
        return <Grid className="h-5 w-5" />;
      case "ברשותי":
        return <Check className="h-5 w-5" />;
      case "חסרים":
        return <AlertCircle className="h-5 w-5" />;
      case "כפולים":
        return <Copy className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl p-4 transition-all duration-300",
        "border flex items-center justify-between",
        "text-right",
        active 
          ? "border-interactive bg-interactive/5 shadow-sm" 
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <div className="text-lg font-bold">
        {value}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-base font-medium">
          {title}
        </div>
        <div className={cn(
          "flex items-center justify-center",
          active ? "text-interactive" : "text-muted-foreground"
        )}>
          {getIcon()}
        </div>
      </div>
    </button>
  );
};

export default InventoryCard;
