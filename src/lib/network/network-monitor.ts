import { toast } from "@/hooks/use-toast";

export interface NetworkStats {
  egressWarnings: number;
  bytesTransferred: number;
  isOffline: boolean;
}

export const monitorNetworkEvents = (
  setEgressWarnings: (val: number | ((prev: number) => number)) => void,
  setIsOffline: (val: boolean) => void,
  toastFn: typeof toast
) => {
  // Track egress warnings by monitoring network errors
  const handleNetworkError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const errorMessage = 
      'message' in event ? event.message : 
      (event as PromiseRejectionEvent).reason?.message || '';
      
    if (errorMessage.includes('egress') || 
        errorMessage.includes('exceeded') || 
        errorMessage.includes('limit')) {
      setEgressWarnings(prev => prev + 1);
      
      toastFn({
        title: "אזהרת תעבורת נתונים",
        description: "זוהתה תעבורת נתונים גבוהה. מומלץ לצמצם שימוש זמני.",
        variant: "destructive"
      });
    }
  };
  
  // Track online/offline status
  const handleOnlineStatus = () => {
    const isCurrentlyOffline = !navigator.onLine;
    setIsOffline(isCurrentlyOffline);
    
    if (!isCurrentlyOffline) {
      toastFn({
        title: "חזרת לחיבור",
        description: "החיבור לרשת חזר. מסנכרן נתונים...",
      });
    } else {
      toastFn({
        title: "אין חיבור לרשת",
        description: "עובד במצב לא מקוון. הנתונים יסונכרנו כשהחיבור יחזור.",
        variant: "default"
      });
    }
  };

  // Attach event listeners
  window.addEventListener('error', handleNetworkError as EventListener);
  window.addEventListener('unhandledrejection', handleNetworkError as EventListener);
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handleNetworkError as EventListener);
    window.removeEventListener('unhandledrejection', handleNetworkError as EventListener);
    window.removeEventListener('online', handleOnlineStatus);
    window.removeEventListener('offline', handleOnlineStatus);
  };
};

export const simulateNetworkUsage = (
  setBytesTransferred: (val: number | ((prev: number) => number)) => void
) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const intervalId = setInterval(() => {
    // סימולציה של תעבורת רשת לצורך הדגמה
    setBytesTransferred(prev => {
      const increment = Math.floor(Math.random() * 50000);
      return prev + increment;
    });
  }, 30000);
  
  return intervalId;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
