
import React, { useState, useEffect, useCallback } from "react";
import { useAlbumStore } from "@/store/useAlbumStore";
import { getAllAlbums } from "@/lib/data";
import { Album, ExchangeOffer } from "@/lib/types";
import AlbumCarousel from "./inventory/AlbumCarousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeftRight, Search } from "lucide-react";
import AddExchangeDialog from "./exchange/AddExchangeDialog";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import ExchangeCard from "./exchange/card";
import EmptyState from "./EmptyState";
import { LoadingSpinner } from "./ui/loading";
import UpdateExchangeDialog from "./exchange/UpdateExchangeDialog";
import {
  fetchExchangeOffers,
  saveExchangeOffer,
  deleteExchangeOfferFromSupabase,
} from "@/lib/supabase";

const ExchangeView = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const { selectedAlbumId, setSelectedAlbumId } = useAlbumStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeOffer | null>(null);
  const [myExchanges, setMyExchanges] = useState<ExchangeOffer[]>([]);
  const [availableExchanges, setAvailableExchanges] = useState<ExchangeOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"active" | "completed">("active");
  const { toast } = useToast();
  const [refreshData, setRefreshData] = useState(false);
  
  // Use useCallback to prevent infinite rendering
  const handleRefreshData = useCallback(() => {
    setRefreshData(prev => !prev);
  }, []);

  useEffect(() => {
    const allAlbums = getAllAlbums();
    setAlbums(allAlbums);
    if (allAlbums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(allAlbums[0].id);
    }
  }, [setSelectedAlbumId, selectedAlbumId]);
  
  // Use useCallback for fetching data to prevent infinite loops
  const fetchData = useCallback(async () => {
    if (!selectedAlbumId) return;
    
    setLoading(true);
    try {
      const allExchanges = await fetchExchangeOffers() || [];
      
      // Filter exchanges based on the selected album
      const albumExchanges = allExchanges.filter(exchange => exchange.albumId === selectedAlbumId);
      
      // Filter exchanges based on the current user (assuming you have a way to identify the current user)
      const currentUserId = "user-001"; // Replace with the actual user ID
      const myExchanges = albumExchanges.filter(exchange => exchange.userId === currentUserId);
      const availableExchanges = albumExchanges.filter(exchange => exchange.userId !== currentUserId);
      
      // Further filter based on status
      const filterByStatus = (exchanges: ExchangeOffer[]) => {
        if (filterStatus === "active") {
          return exchanges.filter(exchange => exchange.status === "active");
        } else if (filterStatus === "completed") {
          return exchanges.filter(exchange => exchange.status === "completed");
        }
        return exchanges;
      };
      
      setMyExchanges(filterByStatus(myExchanges));
      setAvailableExchanges(filterByStatus(availableExchanges));
    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
      toast({
        title: "Failed to fetch exchanges",
        description: "There was an error fetching the exchange offers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAlbumId, filterStatus, toast]);
  
  // Separate effect for fetching data to avoid infinite loops
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshData]);
  
  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbumId(albumId);
  };
  
  const handleDeleteExchange = async (exchangeId: string) => {
    try {
      const success = await deleteExchangeOfferFromSupabase(exchangeId);
      if (success) {
        toast({
          title: "Exchange offer deleted",
          description: "The exchange offer has been successfully deleted.",
        });
        handleRefreshData();
      } else {
        toast({
          title: "Failed to delete exchange offer",
          description: "There was an error deleting the exchange offer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete exchange:", error);
      toast({
        title: "Failed to delete exchange",
        description: "There was an error deleting the exchange offer.",
        variant: "destructive",
      });
    }
  };
  
  const handleCompleteExchange = async (exchangeId: string) => {
    try {
      // Find the exchange to get all its properties
      const exchange = myExchanges.find(ex => ex.id === exchangeId);
      if (!exchange) {
        throw new Error("Exchange not found");
      }

      // Optimistically update the UI
      setMyExchanges(prevExchanges =>
        prevExchanges.map(ex =>
          ex.id === exchangeId ? { ...ex, status: "completed" } : ex
        )
      );
      
      // Update the exchange offer in Supabase with all required fields
      const updatedExchange: ExchangeOffer = {
        ...exchange,
        status: "completed",
      };
      
      const success = await saveExchangeOffer(updatedExchange);
      
      if (success) {
        toast({
          title: "Exchange offer completed",
          description: "The exchange offer has been marked as completed.",
        });
        handleRefreshData();
      } else {
        toast({
          title: "Failed to complete exchange offer",
          description: "There was an error completing the exchange offer.",
          variant: "destructive",
        });
        // Revert the UI update if the Supabase update fails
        setMyExchanges(prevExchanges =>
          prevExchanges.map(ex =>
            ex.id === exchangeId ? { ...ex, status: "active" } : ex
          )
        );
      }
    } catch (error) {
      console.error("Failed to complete exchange:", error);
      toast({
        title: "Failed to complete exchange",
        description: "There was an error completing the exchange offer.",
        variant: "destructive",
      });
      // Revert the UI update if an error occurs
      setMyExchanges(prevExchanges =>
        prevExchanges.map(ex =>
          ex.id === exchangeId ? { ...ex, status: "active" } : ex
        )
      );
    }
  };
  
  return (
    <div className="relative">
      <div className="px-4 py-2 h-full">
        <h1 className="text-2xl font-bold mb-4 text-center">החלפות</h1>
        
        <Tabs defaultValue="my-exchanges">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-exchanges">
                החלפות שלי
              </TabsTrigger>
              <TabsTrigger value="available-exchanges">
                החלפות זמינות
              </TabsTrigger>
            </TabsList>
            
            {/* Add Exchange Button */}
            {!isDialogOpen && (
              <Button
                variant="default"
                size="sm"
                className="ml-2"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                הוסף החלפה
              </Button>
            )}
          </div>
          
          <TabsContent value="my-exchanges" className="space-y-4">
            {/* Album Selection */}
            <AlbumCarousel
              albums={albums}
              selectedAlbumId={selectedAlbumId}
              onAlbumChange={handleAlbumChange}
              onAlbumEdit={handleRefreshData}
            />
            
            {/* Filter Controls */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                onClick={() => setFilterStatus("active")}
                variant={filterStatus === "active" ? "default" : "outline"}
                className="text-xs"
                size="sm"
              >
                הצעות פעילות
              </Button>
              <Button
                onClick={() => setFilterStatus("completed")}
                variant={filterStatus === "completed" ? "default" : "outline"}
                className="text-xs" 
                size="sm"
              >
                הצעות שהושלמו
              </Button>
            </div>
            
            {/* Exchange Cards for User's Exchanges */}
            {loading ? (
              <div className="flex justify-center my-8">
                <LoadingSpinner />
              </div>
            ) : myExchanges.length > 0 ? (
              <div className="space-y-4">
                {myExchanges.map(exchange => (
                  <Card key={exchange.id} className="transition-all hover:shadow-md">
                    <ExchangeCard
                      exchange={exchange}
                      onUpdate={() => {
                        setSelectedExchange(exchange);
                        setIsUpdateDialogOpen(true);
                      }}
                      onDelete={() => handleDeleteExchange(exchange.id)}
                      onComplete={() => handleCompleteExchange(exchange.id)}
                      isOwner={true}
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="אין לך הצעות החלפה"
                description="הוסף הצעת החלפה חדשה כדי להתחיל"
                icon={<ArrowLeftRight className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
          
          <TabsContent value="available-exchanges" className="space-y-4">
            {/* Album Selection */}
            <AlbumCarousel
              albums={albums}
              selectedAlbumId={selectedAlbumId}
              onAlbumChange={handleAlbumChange}
              onAlbumEdit={handleRefreshData}
            />
            
            {/* Exchange Cards for Available Exchanges */}
            {loading ? (
              <div className="flex justify-center my-8">
                <LoadingSpinner />
              </div>
            ) : availableExchanges.length > 0 ? (
              <div className="space-y-4">
                {availableExchanges.map(exchange => (
                  <Card key={exchange.id} className="transition-all hover:shadow-md">
                    <ExchangeCard
                      exchange={exchange}
                      onUpdate={undefined}
                      onDelete={undefined}
                      onComplete={undefined}
                      isOwner={false}
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="אין הצעות החלפה זמינות"
                description="נסה לבחור אלבום אחר או הוסף הצעת החלפה חדשה"
                icon={<Search className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Exchange Dialog */}
      {isDialogOpen && (
        <AddExchangeDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onExchangeAdded={() => {
            setIsDialogOpen(false);
            handleRefreshData();
          }}
          selectedAlbumId={selectedAlbumId}
        />
      )}
      
      {/* Update Exchange Dialog */}
      {isUpdateDialogOpen && selectedExchange && (
        <UpdateExchangeDialog
          isOpen={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          onExchangeUpdated={() => {
            setIsUpdateDialogOpen(false);
            handleRefreshData();
          }}
          exchange={selectedExchange}
        />
      )}
    </div>
  );
};

export default ExchangeView;
