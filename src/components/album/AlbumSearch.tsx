
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AlbumSearchProps {
  onSearch: (query: string) => void;
  className?: string;
}

const AlbumSearch = ({ onSearch, className }: AlbumSearchProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".search-button")
      ) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Reset search when opening
      setSearchQuery("");
      onSearch("");
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="search-button h-8 w-8 p-0 rounded-full"
        onClick={toggleSearch}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
      
      {isSearchOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex items-center px-2 py-1">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="חיפוש מדבקות..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-8 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              dir="rtl"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumSearch;
