
import { Album } from "lucide-react";
import Header from "../../Header";
import EmptyState from "../../EmptyState";
import AddAlbumForm from "../../add-album-form";

interface InventoryEmptyProps {
  onAlbumAdded: () => void;
}

/**
 * Empty state component for when no albums exist
 */
const InventoryEmpty = ({ onAlbumAdded }: InventoryEmptyProps) => {
  return (
    <div className="space-y-3 animate-fade-in">
      <Header 
        title="מלאי" 
        subtitle="ניהול אוסף המדבקות שלך"
      />
      <EmptyState
        icon={<Album className="h-12 w-12" />}
        title="אין אלבומים פעילים"
        description="הוסף אלבום חדש כדי להתחיל"
        action={
          <AddAlbumForm onAlbumAdded={onAlbumAdded} />
        }
      />
    </div>
  );
};

export default InventoryEmpty;
