
import React from "react";
import { Album } from "lucide-react";
import EmptyState from "../../EmptyState";
import AddAlbumForm from "../../add-album-form";

interface AlbumErrorStateProps {
  resetRefresh: () => void;
  throttledRefresh: () => void;
}

const AlbumErrorState = ({ resetRefresh, throttledRefresh }: AlbumErrorStateProps) => {
  return (
    <div className="space-y-4 animate-fade-in p-4">
      <EmptyState
        icon={<Album className="h-12 w-12" />}
        title="לא ניתן לטעון אלבומים"
        description="לא הצלחנו לטעון את האלבומים שלך. אנא נסה לרענן את הדף או להוסיף אלבום חדש."
        action={
          <div className="space-y-4">
            <button 
              onClick={() => {
                resetRefresh();
                throttledRefresh();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              נסה שוב
            </button>
            <div className="pt-2">
              <AddAlbumForm onAlbumAdded={throttledRefresh} />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default AlbumErrorState;
