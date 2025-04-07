
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { monitorNetworkEvents, simulateNetworkUsage } from '@/lib/network/network-monitor';

export const useNetworkMonitor = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [egressWarnings, setEgressWarnings] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();
  
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
    // Set up network monitoring
    const cleanupNetworkMonitoring = monitorNetworkEvents(
      setEgressWarnings,
      setIsOffline,
      toast
    );
    
    // Simulate network usage in development
    const intervalId = simulateNetworkUsage(setBytesTransferred);
    
    // Clean up
    return () => {
      cleanupNetworkMonitoring();
      if (intervalId) clearInterval(intervalId);
    };
  }, [toast]);
  
  return {
    isExpanded,
    setIsExpanded,
    egressWarnings,
    bytesTransferred,
    isOffline
  };
};
