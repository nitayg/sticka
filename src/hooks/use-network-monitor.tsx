
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { monitorNetworkEvents, simulateNetworkUsage } from '@/lib/network/network-monitor';

export const useNetworkMonitor = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [egressWarnings, setEgressWarnings] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();
  
  // Only show monitor automatically if there are warnings
  useEffect(() => {
    if (egressWarnings > 0 && !isExpanded) {
      setIsExpanded(true);
      
      toast({
        title: "ניטור תעבורת נתונים",
        description: "מוניטור התעבורה נפתח אוטומטית עקב זיהוי תעבורת יתר",
        variant: "destructive"
      });
    }
  }, [egressWarnings, isExpanded, toast]);
  
  useEffect(() => {
    // Listen for toggle events from the header button
    const handleToggleFromHeader = () => {
      setIsExpanded(prev => !prev);
    };
    
    window.addEventListener('toggleEgressMonitor', handleToggleFromHeader);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('toggleEgressMonitor', handleToggleFromHeader);
    };
  }, []);
  
  useEffect(() => {
    // We only set up monitoring if the component is mounted
    // This helps reduce unnecessary processing when monitoring isn't visible
    // Set up network monitoring
    const cleanupNetworkMonitoring = monitorNetworkEvents(
      setEgressWarnings,
      setIsOffline,
      toast
    );
    
    // Simulate network usage in development - only if expanded to save resources
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isExpanded) {
      intervalId = simulateNetworkUsage(setBytesTransferred);
    }
    
    // Clean up
    return () => {
      cleanupNetworkMonitoring();
      if (intervalId) clearInterval(intervalId);
    };
  }, [toast, isExpanded]);
  
  return {
    isExpanded,
    setIsExpanded,
    egressWarnings,
    bytesTransferred,
    isOffline
  };
};
