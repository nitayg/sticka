
import { useAlbumFetch } from "./album/useAlbumFetch";
import { useStickerFetch } from "./album/useStickerFetch";
import { useTransactionMap } from "./album/useTransactionMap";
import { useAlbumMetadata } from "./album/useAlbumMetadata";
import { Album, Sticker } from "@/lib/types";

interface UseAlbumDataProps {
  selectedAlbumId: string;
  refreshKey: number;
  activeTab: "number" | "team" | "manage";
  showAllAlbumStickers: boolean;
}

interface UseAlbumDataResult {
  albums: Album[];
  stickers: Sticker[];
  transactionMap: Record<string, { person: string, color: string }>;
  teams: string[];
  numberRanges: string[];
  teamLogos: Record<string, string>;
  isLoading: boolean;
}

export const useAlbumData = ({ 
  selectedAlbumId, 
  refreshKey, 
  activeTab,
  showAllAlbumStickers
}: UseAlbumDataProps): UseAlbumDataResult => {
  // Use specialized hooks for data fetching
  const { albums = [], exchangeOffers = [], isAlbumsLoading, isExchangesLoading } = useAlbumFetch(refreshKey);
  const { stickers = [], isStickersLoading } = useStickerFetch(selectedAlbumId, refreshKey);
  
  // Generate transaction map
  const transactionMap = useTransactionMap(selectedAlbumId, stickers, exchangeOffers, refreshKey);
  
  // Get album metadata (teams, number ranges, logos)
  const { teams = [], numberRanges = [], teamLogos = {} } = useAlbumMetadata({
    stickers,
    activeTab,
    showAllAlbumStickers
  });

  // Is loading any data
  const isLoading = isAlbumsLoading || (selectedAlbumId && isStickersLoading) || isExchangesLoading;

  return {
    albums,
    stickers,
    transactionMap,
    teams,
    numberRanges,
    teamLogos,
    isLoading
  };
};
