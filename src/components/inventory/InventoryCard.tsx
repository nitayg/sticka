
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  title: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const InventoryCard = ({
  title,
  value,
  active = false,
  onClick,
  className
}: InventoryCardProps) => {
  return (
    <div
      className={cn(
        "bg-card rounded-lg p-2 text-center cursor-pointer transition-all border",
        active
          ? "border-interactive bg-interactive/10 shadow-sm"
          : "border-border hover:border-interactive/40",
        className
      )}
      onClick={onClick}
    >
      <p className="text-lg font-bold">{value}</p>
      <h3 className="text-xs text-muted-foreground mt-1">{title}</h3>
    </div>
  );
};

export default InventoryCard;
