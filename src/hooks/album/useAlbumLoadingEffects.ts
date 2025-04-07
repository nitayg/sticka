
import { useEffect } from "react";

interface UseAlbumLoadingEffectsProps {
  isLoading: boolean;
  albums: any[];
  hasAttemptedRefresh: boolean;
  setHasAttemptedRefresh: (value: boolean) => void;
  throttledRefresh: () => void;
  setIsLoadingTimeout: (value: boolean) => void;
}

export const useAlbumLoadingEffects = ({
  isLoading,
  albums,
  hasAttemptedRefresh,
  setHasAttemptedRefresh,
  throttledRefresh,
  setIsLoadingTimeout
}: UseAlbumLoadingEffectsProps) => {
  // Force a refresh if we have no albums but should have
  useEffect(() => {
    if (albums.length === 0 && !isLoading && !hasAttemptedRefresh) {
      // Only try to force refresh once to avoid infinite loops
      console.log("[useAlbumLoadingEffects] No albums found, forcing refresh");
      setHasAttemptedRefresh(true);
      
      // Add a small delay before refreshing
      const timer = setTimeout(() => {
        throttledRefresh();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [albums, isLoading, throttledRefresh, hasAttemptedRefresh, setHasAttemptedRefresh]);
  
  // Reset the refresh attempt flag if loading state changes or albums are loaded
  useEffect(() => {
    if (isLoading || albums.length > 0) {
      setHasAttemptedRefresh(false);
    }
  }, [isLoading, albums, setHasAttemptedRefresh]);
  
  // Set a timeout on loading to prevent infinite loading states
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingTimeout(true);
      }, 10000); // Show timeout message after 10 seconds of loading
      
      return () => clearTimeout(timer);
    } else {
      setIsLoadingTimeout(false);
    }
  }, [isLoading, setIsLoadingTimeout]);
};
