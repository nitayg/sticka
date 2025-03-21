
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import AlbumCarousel from "./inventory/AlbumCarousel";
import { getAllAlbums } from "@/lib/data";
import { 
  Plus, 
  ArrowLeftRight
} from "lucide-react";
import { Button } from "./ui/button";
import EmptyState from "./EmptyState";
import { Dialog, DialogTrigger } from "./ui/dialog";
import AddExchangeDialog from "./exchange/AddExchangeDialog";
import ExchangeCard from "./exchange/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useInventoryStore } from "@/store/useInventoryStore";
import { fetchExchangeOffers } from "@/lib/supabase";
import { ExchangeOffer } from "@/lib/types";
import SyncIndicator from "./SyncIndicator";

const ExchangeView = () => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exchanges, setExchanges] = useState<ExchangeOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const albums = getAllAlbums();
  
  // Set initial album
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(albums[0].id);
    }
  }, [albums]);
  
  // Fetch exchanges from Supabase
  useEffect(() => {
    const loadExchanges = async () => {
      setIsLoading(true);
      try {
        const data = await fetchExchangeOffers();
        if (data) {
          console.log('Fetched exchange offers:', data);
          setExchanges(data.filter(exchange => !exchange.isDeleted));
        }
      } catch (error) {
        console.error('Error fetching exchanges:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExchanges();
    
    // Set up listener for exchange data changes
    const handleDataChanged = () => {
      console.log('Exchange data changed, refreshing...');
      loadExchanges();
    };
    
    window.addEventListener('exchangeOffersDataChanged', handleDataChanged);
    return () => window.removeEventListener('exchangeOffersDataChanged', handleDataChanged);
  }, [refreshKey]);
  
  // Filter exchanges by selected album
  const filteredExchanges = selectedAlbumId 
    ? exchanges.filter(exchange => exchange.albumId === selectedAlbumId)
    : [];
  
  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbumId(albumId);
  };
  
  const handleExchangeAdded = () => {
    // Refresh the view when a new exchange is added
    setRefreshKey(prev => prev + 1);
    
    // Force update album view and inventory view by dispatching custom events
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Header 
        title="מערכת החלפות" 
        subtitle="החלף מדבקות עם אספנים אחרים"
        action={
          <div className="flex items-center gap-2">
            <SyncIndicator headerPosition />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        עסקת החלפה חדשה
                      </Button>
                    </DialogTrigger>
                    <AddExchangeDialog 
                      onClose={() => setIsDialogOpen(false)}
                      selectedAlbumId={selectedAlbumId}
                      onExchangeAdded={handleExchangeAdded}
                    />
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>צור עסקת החלפה חדשה</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
      />
      
      <AlbumCarousel 
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={handleAlbumChange}
      />
      
      <div className="space-y-4">
        {/* Active Exchanges */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">עסקאות החלפה פעילות</h2>
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredExchanges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
              {filteredExchanges.map(exchange => (
                <ExchangeCard 
                  key={exchange.id}
                  exchange={exchange}
                  onRefresh={() => setRefreshKey(prev => prev + 1)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ArrowLeftRight className="h-12 w-12" />}
              title="אין עסקאות פעילות"
              description={`אין לך עסקאות החלפה פעילות לאלבום זה כרגע.`}
              action={
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  צור עסקת החלפה חדשה
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeView;
