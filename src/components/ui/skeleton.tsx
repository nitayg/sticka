
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 relative overflow-hidden", 
        isMobile && "h-[90%] w-[90%]", // Smaller skeleton on mobile
        className
      )}
      {...props}
    >
      {/* Add shine effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

export { Skeleton }
