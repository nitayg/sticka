
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { clearCache } from "@/lib/sync/sync-manager";
import { useToast } from "@/hooks/use-toast";

const MonitorActions = () => {
  const { toast } = useToast();
  
  const handleClearCache = () => {
    clearCache();
    toast({
      title: "מטמון נוקה",
      description: "המטמון נוקה. המערכת תשתמש בפחות תעבורת נתונים בסנכרונים הבאים."
    });
  };
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="secondary" 
        size="sm" 
        className="w-full"
        onClick={handleClearCache}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        נקה מטמון
      </Button>
    </div>
  );
};

export default MonitorActions;
