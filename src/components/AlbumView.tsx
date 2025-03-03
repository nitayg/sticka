
import { useState, useEffect, useMemo } from "react";
import { getAllAlbums } from "@/lib/data";
import Header from "./Header";
import AddStickerForm from "./AddStickerForm";
import AddAlbumForm from "./AddAlbumForm";
import ViewModeToggle from "./ViewModeToggle";
import CategoryFilter from "./CategoryFilter";
import StickerCollection from "./StickerCollection";
import ImportExcelDialog from "./ImportExcelDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getStickersByAlbumId } from "@/lib/sticker-operations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import NumberRangeView from "./NumberRangeView";
import TeamView from "./TeamView";

const AlbumView = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("הכל");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [stickers, setStickers] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"number" | "team">("number");
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
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
      
      // Dispatch custom event to notify Layout of album change
      const event = new CustomEvent('albumChanged', { detail: { albumId: selectedAlbum } });
      window.dispatchEvent(event);
    }
  }, [selectedAlbum, refreshKey]);
  
  // Reset filters when album changes
  useEffect(() => {
    setSelectedRange(null);
    setSelectedTeam(null);
  }, [selectedAlbum]);

  // Get all unique teams from stickers
  const teams = useMemo(() => {
    const teamSet = new Set<string>();
    stickers.forEach(sticker => {
      if (sticker.team) {
        teamSet.add(sticker.team);
      }
    });
    return Array.from(teamSet).sort();
  }, [stickers]);

  // Get number ranges (hundreds) from stickers
  const numberRanges = useMemo(() => {
    if (!stickers.length) return [];
    
    const ranges = new Set<string>();
    stickers.forEach(sticker => {
      const hundred = Math.floor(sticker.number / 100) * 100;
      const rangeEnd = hundred + 99;
      ranges.add(`${hundred}-${rangeEnd}`);
    });
    
    return Array.from(ranges).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return aStart - bStart;
    });
  }, [stickers]);
  
  // Apply both category and range/team filters
  const getFilteredStickers = () => {
    // First apply category filter
    let filtered = stickers.filter(sticker => 
      selectedCategory === "הכל" || sticker.category === selectedCategory
    );
    
    // Then apply number range or team filter based on active tab
    if (activeTab === "number" && selectedRange) {
      const [rangeStart, rangeEnd] = selectedRange.split('-').map(Number);
      filtered = filtered.filter(sticker => 
        sticker.number >= rangeStart && sticker.number <= rangeEnd
      );
    } else if (activeTab === "team" && selectedTeam) {
      filtered = filtered.filter(sticker => sticker.team === selectedTeam);
    }
    
    return filtered;
  };
  
  const filteredStickers = getFilteredStickers();
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleAlbumChange = (albumId: string) => {
    setSelectedAlbum(albumId);
  };

  const handleRangeSelect = (range: string | null) => {
    setSelectedRange(range);
  };

  const handleTeamSelect = (team: string | null) => {
    setSelectedTeam(team);
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
        
        <Select value={selectedAlbum} onValueChange={handleAlbumChange}>
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
      
      <Tabs
        defaultValue="number"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "number" | "team")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="number">לפי מספר</TabsTrigger>
          <TabsTrigger value="team">לפי קבוצה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="number" className="mt-0">
          <NumberRangeView 
            ranges={numberRanges} 
            selectedRange={selectedRange}
            onRangeSelect={handleRangeSelect}
          />
        </TabsContent>
        
        <TabsContent value="team" className="mt-0">
          <TeamView 
            teams={teams} 
            selectedTeam={selectedTeam}
            onTeamSelect={handleTeamSelect}
          />
        </TabsContent>
      </Tabs>
      
      <StickerCollection 
        stickers={filteredStickers}
        viewMode={viewMode}
        selectedAlbum={selectedAlbum}
        onRefresh={handleRefresh}
        activeFilter={activeTab === "number" ? selectedRange : selectedTeam}
      />
    </div>
  );
};

export default AlbumView;
