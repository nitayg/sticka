
import { useState } from "react";
import { ArrowRight, Search, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Input } from "../ui/input";

interface ClubsHeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  onBack?: () => void;
  onRefresh: () => void;
}

const ClubsHeader = ({ title, onSearch, onBack, onRefresh }: ClubsHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh();
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-gray-800 mr-1"
            onClick={onBack}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      <div className="flex gap-2">
        {onSearch && (
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="end">
              <Input
                placeholder="חפש מועדון..."
                className="w-full text-right"
                onChange={(e) => onSearch(e.target.value)}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-800"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default ClubsHeader;
