
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, AlertCircle } from "lucide-react";
import { clearCache } from "@/lib/sync/sync-manager";
import { useToast } from "@/hooks/use-toast";
import { detectQueryIssues } from "@/lib/network/network-monitor";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MonitorActions = () => {
  const { toast } = useToast();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const handleClearCache = () => {
    clearCache();
    toast({
      title: "מטמון נוקה",
      description: "המטמון נוקה. המערכת תשתמש בפחות תעבורת נתונים בסנכרונים הבאים."
    });
  };
  
  const handleShowDiagnostics = () => {
    setShowDiagnostics(true);
  };
  
  const queryIssues = detectQueryIssues();
  
  return (
    <div>
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
        
        {queryIssues.hasIssues && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleShowDiagnostics}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            אבחון תעבורה
          </Button>
        )}
      </div>
      
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>אבחון תעבורת נתונים</DialogTitle>
            <DialogDescription>
              זוהו קריאות חוזרות לנקודות קצה הבאות:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-2 max-h-[300px] overflow-auto">
            {queryIssues.frequentEndpoints.map((endpoint, index) => (
              <div key={index} className="p-2 bg-muted rounded text-xs">
                <div><span className="font-bold">נקודת קצה:</span> {endpoint.url}</div>
                <div><span className="font-bold">מספר קריאות:</span> {endpoint.calls}</div>
                <div><span className="font-bold">קריאה אחרונה:</span> {new Date(endpoint.lastCalled).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm">
            <p className="font-semibold">המלצות להפחתת תעבורה:</p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
              <li>השתמש ב-useQuery עם staleTime ארוך יותר</li>
              <li>הוסף מטמון מקומי עבור נתונים שאינם משתנים</li>
              <li>צמצם את כמות השדות שנשלפים</li>
              <li>השתמש בפילטרים צד-שרת במקום לשלוף את כל הנתונים</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitorActions;
