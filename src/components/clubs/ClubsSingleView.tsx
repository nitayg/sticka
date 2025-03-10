
import { useMemo, useState } from "react";
import { getStickerData, getAllAlbums } from "@/lib/data";
import StickerCard from "../StickerCard";
import { Album } from "@/lib/types";

interface ClubsSingleViewProps {
  clubName: string;
  onRefresh: () => void;
}

interface StickersPerAlbum {
  albumId: string;
  albumName: string;
  stickers: any[];
}

const ClubsSingleView = ({ clubName, onRefresh }: ClubsSingleViewProps) => {
  const [selectedSticker, setSelectedSticker] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Group stickers by album
  const stickersPerAlbum = useMemo(() => {
    const allStickers = getStickerData().filter(
      sticker => sticker.team === clubName && !sticker.isDeleted
    );
    
    const albums = getAllAlbums();
    const albumMap = new Map<string, Album>();
    albums.forEach(album => albumMap.set(album.id, album));
    
    // Group stickers by album
    const groupedStickers: StickersPerAlbum[] = [];
    const stickersByAlbum = new Map<string, any[]>();
    
    allStickers.forEach(sticker => {
      if (!stickersByAlbum.has(sticker.albumId)) {
        stickersByAlbum.set(sticker.albumId, []);
      }
      stickersByAlbum.get(sticker.albumId)?.push(sticker);
    });
    
    // Sort the groups by album name
    stickersByAlbum.forEach((stickers, albumId) => {
      const album = albumMap.get(albumId);
      if (album) {
        groupedStickers.push({
          albumId,
          albumName: album.name,
          // Sort stickers by number within each album
          stickers: stickers.sort((a, b) => a.number - b.number)
        });
      }
    });
    
    return groupedStickers.sort((a, b) => a.albumName.localeCompare(b.albumName));
  }, [clubName]);
  
  if (stickersPerAlbum.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">אין מדבקות עבור מועדון זה.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {stickersPerAlbum.map(group => (
        <div key={group.albumId} className="space-y-3">
          <h2 className="text-lg font-semibold">{group.albumName}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {group.stickers.map(sticker => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                compact={true}
                showImages={true}
                showAlbumInfo={false}
                onClick={() => {
                  setSelectedSticker(sticker);
                  setIsDialogOpen(true);
                }}
                isRecentlyAdded={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClubsSingleView;
