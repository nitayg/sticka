
import { useQuery } from "@tanstack/react-query";
import { fetchAllAlbums } from "@/lib/queries/album-queries";
import { fetchExchangeOffers } from "@/lib/supabase";
import { useState, useEffect } from "react";

/**
 * Custom hook for fetching album and exchange data
 */
export const useAlbumFetch = (refreshKey: number) => {
  const [localAlbums, setLocalAlbums] = useState<any[]>([]);
  
  // Fetch albums with better error handling
  const { data: albums = [], isLoading: isAlbumsLoading } = useQuery({
    queryKey: ['albums', refreshKey],
    queryFn: fetchAllAlbums,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 10000), // Exponential backoff
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false, // Prevent excessive refetching
    meta: {
      onError: (error: Error) => {
        console.error("[useAlbumFetch] Error fetching albums:", error);
      }
    }
  });
  
  // Attempt to get albums from local cache if React Query fails
  useEffect(() => {
    if (albums.length === 0 && !isAlbumsLoading) {
      // Try to get albums from localStorage as fallback
      const cachedAlbums = localStorage.getItem('albums');
      if (cachedAlbums) {
        try {
          const parsedAlbums = JSON.parse(cachedAlbums);
          if (Array.isArray(parsedAlbums) && parsedAlbums.length > 0) {
            console.log("[useAlbumFetch] Using cached albums from localStorage:", parsedAlbums.length);
            setLocalAlbums(parsedAlbums);
          }
        } catch (e) {
          console.error("[useAlbumFetch] Error parsing cached albums:", e);
        }
      }
    }
  }, [albums, isAlbumsLoading]);
  
  // Use local albums if available and React Query didn't return any
  const effectiveAlbums = albums.length > 0 ? albums : localAlbums;
  
  // Fetch exchange offers
  const { data: exchangeOffers = [], isLoading: isExchangesLoading } = useQuery({
    queryKey: ['exchangeOffers', refreshKey],
    queryFn: async () => {
      const offers = await fetchExchangeOffers() || [];
      return offers.filter(offer => !offer.isDeleted);
    },
    retry: 2,
    enabled: effectiveAlbums.length > 0, // Only fetch exchanges if we have albums
    staleTime: 120000, // 2 minutes
    meta: {
      onError: (error: Error) => {
        console.error("[useAlbumFetch] Error fetching exchange offers:", error);
      }
    }
  });

  console.log("[useAlbumFetch] Albums loaded:", effectiveAlbums.length);

  // Cache albums in localStorage for resilience
  useEffect(() => {
    if (albums.length > 0) {
      try {
        localStorage.setItem('albums', JSON.stringify(albums));
      } catch (e) {
        console.error("[useAlbumFetch] Error caching albums:", e);
      }
    }
  }, [albums]);

  return {
    albums: effectiveAlbums,
    exchangeOffers,
    isAlbumsLoading: isAlbumsLoading && localAlbums.length === 0,
    isExchangesLoading
  };
};
