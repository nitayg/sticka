
import { useQuery } from "@tanstack/react-query";
import { fetchAllAlbums } from "@/lib/queries";
import { fetchExchangeOffers } from "@/lib/supabase";

/**
 * Custom hook for fetching album and exchange data
 */
export const useAlbumFetch = (refreshKey: number) => {
  // Fetch albums
  const { data: albums = [], isLoading: isAlbumsLoading } = useQuery({
    queryKey: ['albums', refreshKey],
    queryFn: fetchAllAlbums,
    // Add retry options to improve reliability
    retry: 3,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch exchange offers
  const { data: exchangeOffers = [], isLoading: isExchangesLoading } = useQuery({
    queryKey: ['exchangeOffers', refreshKey],
    queryFn: async () => {
      const offers = await fetchExchangeOffers() || [];
      return offers.filter(offer => !offer.isDeleted);
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
