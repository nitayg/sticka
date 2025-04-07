
import { useCallback, useState } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import { toast } from "@/components/ui/use-toast";

export const useAlbumRefresh = () => {
  const { handleRefresh } = useAlbumStore();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const [forceRefreshCount, setForceRefreshCount] = useState(0);
  const [isLoadingTimeout, setIsLoadingTimeout] = useState(false);
  
  // Throttled refresh function to prevent excessive API calls
  const throttledRefresh = useCallback(() => {
    const lastRefreshTime = parseInt(localStorage.getItem('lastRefreshTimestamp') || '0');
    const now = Date.now();
    
    // Only allow refresh every 10 seconds to prevent EGRESS abuse
    if (now - lastRefreshTime > 10000) {
      localStorage.setItem('lastRefreshTimestamp', now.toString());
      handleRefresh();
      setForceRefreshCount(count => count + 1);
      
      // Show a toast only on explicit refreshes
      if (forceRefreshCount > 1) {
        toast({
          title: "נסיון לטעון אלבומים",
          description: "מנסה לטעון את האלבומים שלך...",
        });
      }
    } else {
      console.log("[useAlbumRefresh] Refresh throttled to prevent EGRESS abuse");
    }
  }, [forceRefreshCount, handleRefresh]);

  const resetRefresh = useCallback(() => {
    setForceRefreshCount(0);
    setHasAttemptedRefresh(false);
  }, []);
  
  return {
    throttledRefresh,
    hasAttemptedRefresh,
    setHasAttemptedRefresh,
    forceRefreshCount,
    setForceRefreshCount,
    isLoadingTimeout,
    setIsLoadingTimeout,
    resetRefresh
  };
};
