
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCache } from "@/lib/sync/sync-manager";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Component to monitor and help reduce egress traffic
const EgressMonitor = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [egressWarnings, setEgressWarnings] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
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
    
    // Track online/offline status
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) {
        toast({
          title: "חזרת לחיבור",
          description: "החיבור לרשת חזר. מסנכרן נתונים...",
        });
      } else {
        toast({
          title: "אין חיבור לרשת",
          description: "עובד במצב לא מקוון. הנתונים יסונכרנו כשהחיבור יחזור.",
          variant: "default"
        });
      }
    };
    
    // Simulate tracking bytes transferred in development
    let intervalId;
    if (process.env.NODE_ENV === 'development') {
      intervalId = setInterval(() => {
        // סימולציה של תעבורת רשת לצורך הדגמה
        setBytesTransferred(prev => {
          const increment = Math.floor(Math.random() * 50000);
          return prev + increment;
        });
      }, 30000);
    }
    
    window.addEventListener('error', handleNetworkError);
    window.addEventListener('unhandledrejection', handleNetworkError);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('error', handleNetworkError);
      window.removeEventListener('unhandledrejection', handleNetworkError);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      if (intervalId) clearInterval(intervalId);
    };
  }, [toast]);
  
  const handleClearCache = () => {
    clearCache();
    toast({
      title: "מטמון נוקה",
      description: "המטמון נוקה. המערכת תשתמש בפחות תעבורת נתונים בסנכרונים הבאים."
    });
  };
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="fixed bottom-4 left-4 z-50 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setIsExpanded(true)}
            >
              {isOffline ? (
                <WifiOff className="h-4 w-4 text-orange-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-500" />
              )}
              {egressWarnings > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                  {egressWarnings}
                </span>
              )}
              מונה רשת
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 z-50 w-80"
          >
            <Card className="shadow-lg border-blue-200/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isOffline ? (
                      <WifiOff className="h-4 w-4 text-orange-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                    מונה תעבורת רשת
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  מסייע בצמצום תעבורת נתונים ועלויות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className={cn(
                      "flex items-center justify-between mb-2 p-2 rounded",
                      isOffline ? "bg-orange-100/10 text-orange-500" : "bg-blue-100/10 text-blue-500"
                    )}>
                      <span className="font-semibold">סטטוס רשת:</span>
                      <span>{isOffline ? "לא מחובר" : "מחובר"}</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EgressMonitor;
