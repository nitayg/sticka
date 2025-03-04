import { useEffect, useState } from "react";
import { Plus, List, History, ArrowLeftRight, FileMinus, FileCopy, ClipboardCopy, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "./Header";
import EmptyState from "./EmptyState";
import StickerCollection from "./StickerCollection";
import StickerIntakeForm from "./StickerIntakeForm";
import { Button } from "./ui/button";
import InventoryFilters from "./inventory/InventoryFilters";
import InventoryStats from "./inventory/InventoryStats";
import InventoryTitle from "./inventory/InventoryTitle";
import { useInventoryStore } from "@/store/useInventoryStore";
import { getAllAlbums } from "@/lib/data";
import { fetchStickersByAlbumId } from "@/lib/queries";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const InventoryView = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    showImages,
    setShowImages,
    isIntakeFormOpen,
    setIsIntakeFormOpen,
    selectedAlbumId,
    transactionMap,
    handleRefresh,
    handleAlbumChange,
    handleStickerIntake
  } = useInventoryStore();
  
  const { toast } = useToast();
  const [reportFormat, setReportFormat] = useState<'numbers' | 'names'>('numbers');
  
  const { data: albums = [] } = useQuery({
    queryKey: ['albums'],
    queryFn: getAllAlbums
  });
  
  const { data: albumStickers = [] } = useQuery({
    queryKey: ['stickers', selectedAlbumId],
    queryFn: () => fetchStickersByAlbumId(selectedAlbumId),
    enabled: !!selectedAlbumId,
  });
  
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      handleAlbumChange(albums[0].id);
    }
  }, [albums, selectedAlbumId, handleAlbumChange]);
  
  const filteredStickers = albumStickers.filter(sticker => {
    if (activeTab === "all") return true;
    if (activeTab === "owned") return sticker.isOwned;
    if (activeTab === "needed") return !sticker.isOwned;
    if (activeTab === "duplicates") return sticker.isDuplicate && sticker.isOwned;
    return true;
  });
  
  const tabStats = {
    all: albumStickers.length,
    owned: albumStickers.filter(s => s.isOwned).length,
    needed: albumStickers.filter(s => !s.isOwned).length,
    duplicates: albumStickers.filter(s => s.isDuplicate && s.isOwned).length
  };
  
  const handleStickerIntakeSubmit = async (albumId: string, stickerNumbers: number[]) => {
    try {
      const results = await handleStickerIntake(albumId, stickerNumbers);
      
      const totalUpdated = results.newlyOwned.length + results.duplicatesUpdated.length;
      
      let message = `נוספו ${totalUpdated} מדבקות למלאי.`;
      if (results.newlyOwned.length > 0) {
        message += ` ${results.newlyOwned.length} מדבקות חדשות.`;
      }
      if (results.duplicatesUpdated.length > 0) {
        message += ` ${results.duplicatesUpdated.length} מדבקות כפולות עודכנו.`;
      }
      if (results.notFound.length > 0) {
        message += ` ${results.notFound.length} מדבקות לא נמצאו.`;
      }
      
      toast({
        title: "מדבקות נוספו למלאי",
        description: message,
      });
      
      handleRefresh();
    } catch (error) {
      console.error("Error adding stickers to inventory:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המדבקות למלאי",
        variant: "destructive"
      });
    }
  };

  const copyMissingStickers = () => {
    const missingStickers = albumStickers.filter(s => !s.isOwned);
    
    let clipboardText = '';
    if (reportFormat === 'numbers') {
      clipboardText = missingStickers.map(s => s.number).join(', ');
    } else {
      clipboardText = missingStickers.map(s => `${s.number} - ${s.name || 'ללא שם'}`).join('\n');
    }
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText);
      toast({
        title: "דו״ח חוסרים הועתק",
        description: `${missingStickers.length} מדבקות חסרות הועתקו ללוח`,
      });
    } else {
      toast({
        title: "אין מדבקות חסרות",
        description: "לא נמצאו מדבקות חסרות להעתקה",
      });
    }
  };
  
  const copyDuplicateStickers = () => {
    const duplicateStickers = albumStickers.filter(s => s.isDuplicate && s.isOwned);
    
    let clipboardText = '';
    if (reportFormat === 'numbers') {
      clipboardText = duplicateStickers.map(s => s.number).join(', ');
    } else {
      clipboardText = duplicateStickers.map(s => {
        const count = s.duplicateCount || 1;
        return `${s.number} - ${s.name || 'ללא שם'} (${count} כפולים)`;
      }).join('\n');
    }
    
    if (clipboardText) {
      navigator.clipboard.writeText(clipboardText);
      toast({
        title: "דו״ח כפולים הועתק",
        description: `${duplicateStickers.length} מדבקות כפולות הועתקו ללוח`,
      });
    } else {
      toast({
        title: "אין מדבקות כפולות",
        description: "לא נמצאו מדבקות כפולות להעתקה",
      });
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
        action={
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to="/inventory/history" className="flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5" />
                      היסטוריה
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>היסטוריית קליטת מדבקות</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex gap-1.5"
                      >
                        <FileMinus className="h-3.5 w-3.5" />
                        <span className="sr-only md:not-sr-only md:inline-block">דו״ח חוסרים</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setReportFormat('numbers'); copyMissingStickers(); }}>
                        <ClipboardCopy className="h-4 w-4 ml-2" />
                        העתק מספרים (1, 2, 3)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setReportFormat('names'); copyMissingStickers(); }}>
                        <Copy className="h-4 w-4 ml-2" />
                        העתק מספרים ושמות
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>הפקת דו״ח חוסרים</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex gap-1.5"
                      >
                        <FileCopy className="h-3.5 w-3.5" />
                        <span className="sr-only md:not-sr-only md:inline-block">דו״ח כפולים</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setReportFormat('numbers'); copyDuplicateStickers(); }}>
                        <ClipboardCopy className="h-4 w-4 ml-2" />
                        העתק מספרים (1, 2, 3)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setReportFormat('names'); copyDuplicateStickers(); }}>
                        <Copy className="h-4 w-4 ml-2" />
                        העתק מספרים ושמות
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>הפקת דו״ח כפולים</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              onClick={() => setIsIntakeFormOpen(true)}
              className="px-2 py-1.5 h-8 text-xs rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              הוספה
            </Button>
          </div>
        }
      />
      
      <InventoryFilters
        selectedAlbumId={selectedAlbumId}
        onAlbumChange={handleAlbumChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showImages={showImages}
        setShowImages={setShowImages}
      />
      
      <InventoryStats 
        stats={tabStats} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <InventoryTitle activeTab={activeTab} />
      
      {filteredStickers.length > 0 ? (
        <StickerCollection 
          stickers={filteredStickers}
          viewMode={viewMode}
          showImages={showImages}
          selectedAlbum={selectedAlbumId}
          onRefresh={handleRefresh}
          activeFilter={activeTab === "all" ? null : activeTab}
          showMultipleAlbums={false}
          transactionMap={transactionMap}
        />
      ) : (
        <EmptyState
          icon={<List className="h-10 w-10" />}
          title="לא נמצאו מדבקות"
          description={`אין מדבקות בקטגוריה "${activeTab}".`}
          action={
            <Button 
              onClick={() => setIsIntakeFormOpen(true)}
              className="px-3 py-1.5 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              הוספת מדבקה
            </Button>
          }
        />
      )}

      <StickerIntakeForm 
        isOpen={isIntakeFormOpen}
        onClose={() => setIsIntakeFormOpen(false)}
        onIntake={handleStickerIntakeSubmit}
      />
    </div>
  );
};

export default InventoryView;
