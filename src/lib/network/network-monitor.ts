
import { toast } from "@/hooks/use-toast";

export interface NetworkStats {
  egressWarnings: number;
  bytesTransferred: number;
  isOffline: boolean;
}

// Track previous API calls to detect duplicate fetches
const recentCalls: Record<string, { timestamp: number, count: number }> = {};

export const monitorNetworkEvents = (
  setEgressWarnings: (val: number | ((prev: number) => number)) => void,
  setIsOffline: (val: boolean) => void,
  toastFn: typeof toast
) => {
  // Only monitor network events in development to avoid performance overhead
  if (!import.meta.env.DEV) {
    return () => {};
  }
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
      
      // Log the issue to help with debugging
      console.error("EGRESS WARNING DETECTED:", errorMessage);
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

  // Monitor fetch requests to detect duplicate calls
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : '';
    
    // Only track Supabase calls
    if (url.includes('supabase')) {
      const callKey = url.split('?')[0]; // Strip query params for key
      const now = Date.now();
      
      // Track this call
      if (!recentCalls[callKey]) {
        recentCalls[callKey] = { timestamp: now, count: 1 };
      } else {
        // Check if this is a duplicate call within 2 seconds
        if (now - recentCalls[callKey].timestamp < 2000) {
          recentCalls[callKey].count++;
          
          // If the same endpoint is called more than 3 times in 2 seconds, log a warning
          if (recentCalls[callKey].count > 3) {
            console.warn(`Potential duplicate fetch call detected: ${callKey} called ${recentCalls[callKey].count} times in 2 seconds`);
            
            // If extremely excessive, show a toast
            if (recentCalls[callKey].count > 10) {
              toastFn({
                title: "בעיית תעבורת נתונים",
                description: "זוהו קריאות חוזרות רבות לשרת. מומלץ לבדוק את קוד האפליקציה.",
                variant: "destructive"
              });
            }
          }
        } else {
          // Reset for new time window
          recentCalls[callKey] = { timestamp: now, count: 1 };
        }
      }
      
      // Clean up old entries every 10 seconds
      if (now % 10000 < 100) { // About every 10 seconds
        for (const key in recentCalls) {
          if (now - recentCalls[key].timestamp > 5000) {
            delete recentCalls[key];
          }
        }
      }
    }
    
    return originalFetch.apply(this, [input, init]);
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
    
    // Restore original fetch
    window.fetch = originalFetch;
  };
};

export const simulateNetworkUsage = (
  setBytesTransferred: (val: number | ((prev: number) => number)) => void
) => {
  if (!import.meta.env.DEV) return null;
  
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

// Added utility to reduce egress by helping developers apply proper caching strategies
export const detectQueryIssues = () => {
  // List endpoints that are being called frequently
  const frequentEndpoints: { url: string, calls: number, lastCalled: number }[] = [];
  
  for (const key in recentCalls) {
    if (recentCalls[key].count > 3) {
      frequentEndpoints.push({
        url: key,
        calls: recentCalls[key].count,
        lastCalled: recentCalls[key].timestamp
      });
    }
  }
  
  return {
    frequentEndpoints,
    hasIssues: frequentEndpoints.length > 0
  };
};
