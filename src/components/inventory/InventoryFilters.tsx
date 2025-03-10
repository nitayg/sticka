1| import { getAllAlbums } from "@/lib/data";
2| import ViewModeToggle from "../ViewModeToggle";
3| import AlbumCarousel from "./AlbumCarousel";
4| 
5| interface InventoryFiltersProps {
6|   selectedAlbumId: string;
7|   onAlbumChange: (albumId: string) => void;
8|   viewMode: "grid" | "list" | "compact";
9|   setViewMode: (mode: "grid" | "list" | "compact") => void;
10|   showImages: boolean;
11|   setShowImages: (show: boolean) => void;
12| }
13| 
14| const InventoryFilters = ({
15|   selectedAlbumId,
16|   onAlbumChange,
17|   viewMode,
18|   setViewMode,
19|   showImages,
20|   setShowImages
21| }: InventoryFiltersProps) => {
22|   const albums = getAllAlbums().sort((a, b) => a.serialNumber - b.serialNumber); // שורה 22: סידור לפי מספר סידורי
23| 
24|   return (
25|     <div className="flex flex-col gap-2 py-1">
26|       <AlbumCarousel 
27|         albums={albums}
28|         selectedAlbumId={selectedAlbumId}
29|         onAlbumChange={onAlbumChange}
30|       />
31|       <div className="flex justify-start">
32|         <ViewModeToggle 
33|           viewMode={viewMode} 
34|           setViewMode={setViewMode}
35|           showImages={showImages}
36|           setShowImages={setShowImages}
37|         />
38|       </div>
39|     </div>
40|   );
41| };
42| 
43| export default InventoryFilters;
44| 
