import { useState, useEffect } from "react";
import { getAllAlbums, getStickersByAlbumId } from "@/lib/data";
import { cn } from "@/lib/utils";
import Header from "./Header";
import StickerCard from "./StickerCard";
import { FileInput, Image } from "lucide-react";
import EmptyState from "./EmptyState";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import AddStickerForm from "./AddStickerForm";
import AddAlbumForm from "./AddAlbumForm";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const albums = getAllAlbums();
  const categories = ["הכל", "שחקנים", "קבוצות", "אצטדיונים", "סמלים"];
  
  // Set default album if none selected
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbum) {
      setSelectedAlbum(albums[0].id);
    }
  }, [albums]);
  
  // Load stickers when album changes or refresh is triggered
  useEffect(() => {
    if (selectedAlbum) {
      const albumStickers = getStickersByAlbumId(selectedAlbum);
      setStickers(albumStickers);
    }
  }, [selectedAlbum, refreshKey]);
  
  const filteredStickers = stickers.filter(sticker => 
    selectedCategory === "הכל" || sticker.category === selectedCategory
  );
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // בשלב זה רק נציג הודעה שהקובץ נקלט
      toast({
        title: "הקובץ נקלט בהצלחה",
        description: `${file.name} יעובד בהמשך.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="אלבום דיגיטלי" 
        subtitle="צפייה וארגון אוסף המדבקות שלך"
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileInput className="h-4 w-4 mr-2" />
                  ייבוא אקסל
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ייבוא מדבקות מקובץ אקסל</DialogTitle>
                  <DialogDescription>
                    העלה קובץ אקסל עם המדבקות. וודא כי העמודה הראשונה היא מספר הקלף, השנייה שם השחקן, והשלישית שם הקבוצה/הסדרה.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="album" className="text-right">בחר אלבום</Label>
                    <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="בחר אלבום" />
                      </SelectTrigger>
                      <SelectContent>
                        {albums.map(album => (
                          <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">בחר קובץ</Label>
                    <div className="col-span-3">
                      <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">ייבא מדבקות</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AddAlbumForm onAlbumAdded={handleRefresh} />
            
            <div className="flex">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </button>
            </div>
            <AddStickerForm 
              onStickerAdded={handleRefresh} 
              defaultAlbumId={selectedAlbum}
            />
          </div>
        }
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="overflow-x-auto w-full sm:w-auto pb-2 -mx-1 px-1">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "py-1.5 px-3 rounded-full text-sm whitespace-nowrap transition-colors",
                  category === selectedCategory
                    ? "bg-interactive text-interactive-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="בחר אלבום" />
          </SelectTrigger>
          <SelectContent>
            {albums.map(album => (
              <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredStickers.length > 0 ? (
        <div className={cn(
          "w-full animate-scale-in",
          viewMode === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-0.5" 
            : "grid grid-cols-1 gap-3"
        )}>
          {filteredStickers.map(sticker => 
            viewMode === "grid" ? (
              <StickerCard 
                key={sticker.id} 
                sticker={sticker} 
                compact
                onClick={() => console.log(`Selected ${sticker.name}`)}
              />
            ) : (
              <ListItem key={sticker.id} sticker={sticker} />
            )
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Image className="h-12 w-12" />}
          title="לא נמצאו מדבקות"
          description="הוסף מדבקות לאוסף שלך או שנה את קריטריוני הסינון."
          action={
            <AddStickerForm 
              onStickerAdded={handleRefresh} 
              defaultAlbumId={selectedAlbum}
            />
          }
        />
      )}
    </div>
  );
};

const ListItem = ({ sticker }: { sticker: any }) => {
  return (
    <div className={cn(
      "flex items-center space-x-4 p-3 rounded-xl bg-white border border-border",
      "transition-all duration-300 ease-out hover:shadow-md",
      "cursor-pointer"
    )}>
      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
        <img 
          src={sticker.imageUrl} 
          alt={sticker.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">#{sticker.number} • {sticker.team}</p>
        <h3 className="text-base font-semibold text-foreground truncate">{sticker.name}</h3>
        <p className="text-sm text-muted-foreground">{sticker.category}</p>
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {sticker.isDuplicate && sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            כפול
          </div>
        )}
        {!sticker.isOwned && (
          <div className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            חסר
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumView;
