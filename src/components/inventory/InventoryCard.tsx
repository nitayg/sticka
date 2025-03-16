
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
        "relative bg-card rounded-lg p-2 text-center cursor-pointer transition-all duration-300 overflow-hidden",
        "hover-lift backdrop-blur-sm border transform hover:scale-105",
        active
          ? "border-interactive/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-interactive/5"
          : "border-border hover:border-interactive/30 group",
        className
      )}
      onClick={onClick}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
      
      {/* Glow effect for active card */}
      {active && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/40 to-blue-400/40 blur-sm opacity-50"/>
      )}

      <div className="relative z-10">
        <p className={cn(
          "text-lg font-bold transition-all duration-300",
          active ? "text-interactive" : "group-hover:text-interactive"
        )}>{value}</p>
        <h3 className="text-xs text-muted-foreground mt-1">{title}</h3>
      </div>
      
      {/* Enhanced shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shine-effect" />
    </div>
  );
};

export default InventoryCard;
