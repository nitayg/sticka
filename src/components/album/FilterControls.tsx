
import CategoryFilter from "../CategoryFilter";
import { Album } from "@/lib/types";
import AlbumCarousel from "../inventory/AlbumCarousel";

interface FilterControlsProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  albums: Album[];
  selectedAlbum: string;
  handleAlbumChange: (albumId: string) => void;
  onTeamsManage?: () => void;
}

const FilterControls = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  albums,
  selectedAlbum,
  handleAlbumChange,
  onTeamsManage,
}: FilterControlsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <AlbumCarousel 
        albums={albums}
        selectedAlbumId={selectedAlbum}
        onAlbumChange={handleAlbumChange}
      />
      
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onTeamsManage={onTeamsManage}
      />
    </div>
  );
};

export default FilterControls;
