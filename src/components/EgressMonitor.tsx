
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCache } from "@/lib/sync/sync-manager";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Component to monitor and help reduce egress traffic
const EgressMonitor = ({ inHeader = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [egressWarnings, setEgressWarnings] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    // Track egress warnings by monitoring network errors
    const handleNetworkError = (event) => {
      const errorMessage = event.message || event.error?.message || '';
      if (errorMessage.includes('egress') || 
          errorMessage.includes('exceeded') || 
          errorMessage.includes('limit')) {
        setEgressWarnings(prev => prev + 1);
        
        toast({
          title: "אזהרת תעבורת נתונים",
          description: "זוהתה תעבורת נתונים גבוהה. מומלץ לצמצם שימוש זמני.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('error', handleNetworkError);
    window.addEventListener('unhandledrejection', handleNetworkError);
    
    return () => {
      window.removeEventListener('error', handleNetworkError);
      window.removeEventListener('unhandledrejection', handleNetworkError);
    };
  }, [toast]);
  
  const handleClearCache = () => {
    clearCache();
    toast({
      title: "מטמון נוקה",
      description: "המטמון נוקה. המערכת תשתמש בפחות תעבורת נתונים בסנכרונים הבאים."
    });
  };
  
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  // If included in header, only show icon
  if (inHeader) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        className="h-9 w-9 rounded-full hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300"
        onClick={toggleExpanded}
        title="מונה תעבורת רשת"
      >
        <AlertCircle className="h-5 w-5 text-red-500" />
        {egressWarnings > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
            {egressWarnings}
          </span>
        )}
      </Button>
    );
  }
  
  // Regular monitor panel
  if (!isExpanded) {
    return null; // Hide when not expanded
  }
  
  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">מונה תעבורת רשת</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          מסייע בצמצום תעבורת נתונים ועלויות
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-semibold">אזהרות תעבורה:</span> {egressWarnings}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              שים לב: תעבורה גבוהה מדי עלולה להוביל לעלויות נוספות בסופרבייס
            </p>
          </div>
          
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
          
          <div className="text-xs text-muted-foreground mt-2">
            <ul className="list-disc list-inside space-y-1">
              <li>השתמש בפחות סנכרונים אוטומטיים</li>
              <li>הגבל עדכוני זמן אמת לפי צורך</li>
              <li>שמור נתונים מקומית במידת האפשר</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EgressMonitor;
