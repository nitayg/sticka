
import { useQuery } from "@tanstack/react-query";
import { fetchAllAlbums } from "@/lib/queries";
import { fetchExchangeOffers } from "@/lib/supabase";

/**
 * Custom hook for fetching album and exchange data
 */
export const useAlbumFetch = (refreshKey: number) => {
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
  
  // Fetch exchange offers
  const { data: exchangeOffers = [], isLoading: isExchangesLoading } = useQuery({
    queryKey: ['exchangeOffers', refreshKey],
    queryFn: async () => {
      const offers = await fetchExchangeOffers() || [];
      return offers.filter(offer => !offer.isDeleted);
    },
    retry: 2,
    enabled: albums.length > 0, // Only fetch exchanges if we have albums
    staleTime: 120000, // 2 minutes
    meta: {
      onError: (error: Error) => {
        console.error("[useAlbumFetch] Error fetching exchange offers:", error);
      }
    }
  });

  console.log("[useAlbumFetch] Albums loaded:", albums.length);

  return {
    albums,
    exchangeOffers,
    isAlbumsLoading,
    isExchangesLoading
  };
};
