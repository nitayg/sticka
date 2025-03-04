
import { useState, useEffect } from "react";
import { exchangeOffers, users } from "@/lib/data";
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

const ExchangeView = () => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const albums = getAllAlbums();
  
  // Set initial album
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(albums[0].id);
    }
  }, [albums]);
  
  // Filter exchanges by selected album
  const filteredExchanges = selectedAlbumId 
    ? exchangeOffers.filter(exchange => exchange.albumId === selectedAlbumId)
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
          {filteredExchanges.length > 0 ? (
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
