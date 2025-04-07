import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
interface AlbumGridItemProps {
  id: string;
  name: string;
  coverImage?: string;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
const AlbumGridItem = ({
  id,
  name,
  coverImage,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}: AlbumGridItemProps) => {
  return <Card className={cn("relative w-full h-full overflow-hidden cursor-pointer transition-all duration-300 group", isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md")} onClick={onSelect}>
      {/* Cover Image */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/70 to-black/20 z-10" />
      {coverImage ? <img src={coverImage} alt={name} className="w-full h-full object-cover absolute inset-0" /> : <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />}
      
      {/* Album Name */}
      <CardContent className="absolute bottom-0 left-0 right-0 p-3 z-20 text-white">
        
      </CardContent>
      
      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} // Prevent triggering card click
    >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>ערוך אלבום</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>מחק אלבום</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Selected Indicator */}
      {isSelected && <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none z-20" />}
    </Card>;
};
export default AlbumGridItem;