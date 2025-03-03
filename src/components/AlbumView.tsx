
import { useState, useEffect } from "react";
import { getAllAlbums, getStickersByAlbumId } from "@/lib/data";
import Header from "./Header";
import AddStickerForm from "./AddStickerForm";
import AddAlbumForm from "./AddAlbumForm";
import ViewModeToggle from "./ViewModeToggle";
import CategoryFilter from "./CategoryFilter";
import StickerCollection from "./StickerCollection";
import ImportExcelDialog from "./ImportExcelDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
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

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="אלבום דיגיטלי" 
        subtitle="צפייה וארגון אוסף המדבקות שלך"
        action={
          <div className="flex gap-2 flex-wrap justify-end">
            <ImportExcelDialog 
              albums={albums}
              selectedAlbum={selectedAlbum}
              setSelectedAlbum={setSelectedAlbum}
            />
            
            <AddAlbumForm onAlbumAdded={handleRefresh} />
            
            <ViewModeToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
            />
            
            <AddStickerForm 
              onStickerAdded={handleRefresh} 
              defaultAlbumId={selectedAlbum}
            />
          </div>
        }
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        
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
      
      <StickerCollection 
        stickers={filteredStickers}
        viewMode={viewMode}
        selectedAlbum={selectedAlbum}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default AlbumView;
