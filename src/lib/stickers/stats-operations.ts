
import { Sticker } from '../types';
import { getStickersByAlbumId } from './basic-operations';

// Calculate stats for an album's stickers
export const getStats = (albumId: string) => {
  try {
    const stickers = getStickersByAlbumId(albumId);
    
    const total = stickers.length;
    const owned = stickers.filter(s => s.isOwned).length;
    const needed = total - owned;
    const duplicates = stickers.filter(s => s.isDuplicate).length;
    
    let teams: string[] = [];
    
    // Extract unique teams
    stickers.forEach(sticker => {
      if (sticker.team && !teams.includes(sticker.team)) {
        teams.push(sticker.team);
      }
    });
    
    const teamStats = teams.map(team => {
      const teamStickers = stickers.filter(s => s.team === team);
      const teamTotal = teamStickers.length;
      const teamOwned = teamStickers.filter(s => s.isOwned).length;
      const teamNeeded = teamTotal - teamOwned;
      const teamPercentage = teamTotal > 0 ? Math.round((teamOwned / teamTotal) * 100) : 0;
      
      return {
        team,
        total: teamTotal,
        owned: teamOwned,
        needed: teamNeeded,
        percentage: teamPercentage
      };
    });
    
    // Calculate overall percentage
    const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
    
    return {
      total,
      owned,
      needed,
      duplicates,
      percentage,
      teams: teamStats
    };
  } catch (error) {
    console.error(`Error calculating stats for album ${albumId}:`, error);
    return {
      total: 0,
      owned: 0,
      needed: 0,
      duplicates: 0,
      percentage: 0,
      teams: []
    };
  }
};

// Calculate stats for all albums
export const getAllAlbumStats = async (albums: any[]) => {
  try {
    const stats = await Promise.all(
      albums.map(async (album) => {
        const albumStats = getStats(album.id);
        return {
          albumId: album.id,
          albumName: album.name,
          ...albumStats
        };
      })
    );
    
    return stats;
  } catch (error) {
    console.error('Error calculating stats for all albums:', error);
    return [];
  }
};
