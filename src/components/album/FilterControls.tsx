
import CategoryFilter from "../CategoryFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Album } from "@/lib/types";

interface FilterControlsProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  albums: Album[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
}

const FilterControls = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  albums,
  selectedAlbum,
  handleAlbumChange,
}: FilterControlsProps) => {
  return (
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
  );
};

export default FilterControls;
