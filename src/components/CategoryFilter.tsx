
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onTeamsManage?: () => void; // Prop for handling teams management
}

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, onTeamsManage }: CategoryFilterProps) => {
  const handleCategoryClick = (category: string) => {
    // If it's the "קבוצות" category and we have a teams management handler, call it
    if (category === "קבוצות" && onTeamsManage) {
      onTeamsManage();
    } else {
      setSelectedCategory(category);
    }
  };
  
  return (
    <div className="overflow-x-auto w-full sm:w-auto pb-2 -mx-1 px-1">
      <div className="flex gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
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
  );
};

export default CategoryFilter;
