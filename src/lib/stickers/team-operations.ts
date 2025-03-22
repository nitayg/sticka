
import { getStickerData, setStickerData } from './basic-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Update team name across all stickers
export const updateTeamNameAcrossStickers = async (
  oldTeamName: string, 
  newTeamName: string, 
  teamLogo?: string
): Promise<boolean> => {
  try {
    const stickers = getStickerData();
    const stickersToUpdate = stickers.filter(sticker => sticker.team === oldTeamName);
    
    if (stickersToUpdate.length === 0) {
      console.log(`No stickers found with team name: ${oldTeamName}`);
      return false;
    }
    
    console.log(`Updating team name from ${oldTeamName} to ${newTeamName} for ${stickersToUpdate.length} stickers`);
    
    // Update team name and logo (if provided)
    const updatedStickers = stickersToUpdate.map(sticker => ({
      ...sticker,
      team: newTeamName,
      teamLogo: teamLogo || sticker.teamLogo,
      lastModified: new Date().getTime()
    }));
    
    // Save to server first
    console.log(`Saving ${updatedStickers.length} stickers with updated team name to server`);
    const saveResult = await saveStickerBatch(updatedStickers);
    
    if (!saveResult) {
      console.error(`Failed to update team name on server`);
      return false;
    }
    
    // Update local state after server update
    const allUpdatedStickers = stickers.map(sticker => 
      sticker.team === oldTeamName ? 
        {
          ...sticker, 
          team: newTeamName, 
          teamLogo: teamLogo || sticker.teamLogo,
          lastModified: new Date().getTime()
        } : 
        sticker
    );
    
    setStickerData(allUpdatedStickers);
    
    // Trigger sticker data changed event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
        detail: { action: 'updateTeamName' } 
      }));
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating team name: ${error}`);
    return false;
  }
};
