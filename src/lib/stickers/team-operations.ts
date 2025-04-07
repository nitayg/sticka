
import { getStickersByAlbumId } from './basic-operations';
import { updateSticker } from './crud-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Update team name for all stickers of a specific team
export const updateTeamNameAcrossStickers = async (
  albumId: string, 
  oldTeamName: string, 
  newTeamName: string
): Promise<boolean> => {
  try {
    // Get all stickers for this album
    const albumStickers = getStickersByAlbumId(albumId);
    
    // Filter stickers by team name
    const teamStickers = albumStickers.filter(sticker => 
      sticker.team === oldTeamName
    );
    
    if (teamStickers.length === 0) {
      console.log(`No stickers found for team "${oldTeamName}" in album ${albumId}`);
      return false;
    }
    
    console.log(`Updating ${teamStickers.length} stickers from team "${oldTeamName}" to "${newTeamName}"`);
    
    // Update team name on all matching stickers
    const updatedStickers = teamStickers.map(sticker => ({
      ...sticker,
      team: newTeamName
    }));
    
    // Update all stickers in the album
    const updatedAlbumStickers = albumStickers.map(sticker => {
      const updated = updatedStickers.find(s => s.id === sticker.id);
      return updated || sticker;
    });
    
    // Update local data
    const { setStickerData } = require('./basic-operations');
    setStickerData(updatedAlbumStickers, { albumId, action: 'updateTeam' });
    
    // Trigger UI refresh
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    window.dispatchEvent(new CustomEvent('albumDataChanged'));
    
    // Update on the server in background
    saveStickerBatch(updatedStickers).catch(error => {
      console.error(`Error updating team name on server: ${error}`);
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating team name from "${oldTeamName}" to "${newTeamName}":`, error);
    return false;
  }
};
