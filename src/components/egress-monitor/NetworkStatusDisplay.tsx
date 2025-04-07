
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/network/network-monitor";
import { WifiOff } from "lucide-react";

interface NetworkStatusDisplayProps {
  isOffline: boolean;
  egressWarnings: number;
  bytesTransferred: number;
}

const NetworkStatusDisplay = ({ 
  isOffline, 
  egressWarnings, 
  bytesTransferred 
}: NetworkStatusDisplayProps) => {
  return (
    <div className="space-y-2">
      <div className={cn(
        "flex items-center justify-between mb-2 p-2 rounded",
        isOffline ? "bg-orange-100/10 text-orange-500" : "bg-blue-100/10 text-blue-500"
      )}>
        <span className="font-semibold">סטטוס רשת:</span>
        <span className="flex items-center gap-1">
          {isOffline && <WifiOff className="h-3 w-3" />}
          {isOffline ? "לא מחובר" : "מחובר"}
        </span>
      </div>
      
      <div className="mb-2">
        <span className="font-semibold">אזהרות תעבורה:</span> {egressWarnings}
      </div>
      
      {bytesTransferred > 0 && (
        <div className="mb-2">
          <span className="font-semibold">תעבורה מוערכת:</span> {formatBytes(bytesTransferred)}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mb-4">
        שים לב: תעבורה גבוהה מדי עלולה להוביל לעלויות נוספות בסופרבייס
      </p>
    </div>
  );
};

export default NetworkStatusDisplay;
