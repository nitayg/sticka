
import { getStickerData, setStickerData } from './basic-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Update team name across all stickers (needed by team management components)
export const updateTeamNameAcrossStickers = (oldTeamName: string, newTeamName: string, newTeamLogo: string): number => {
  const allStickers = getStickerData();
  let updatedCount = 0;
  let updatedStickers = allStickers;
  
  try {
    // Find stickers to update
    const stickersToUpdate = [];
    
    updatedStickers = allStickers.map(sticker => {
      if (sticker.team === oldTeamName) {
        updatedCount++;
        const updatedSticker = {
          ...sticker,
          team: newTeamName,
          teamLogo: newTeamLogo || sticker.teamLogo,
          lastModified: new Date().getTime()
        };
        stickersToUpdate.push(updatedSticker);
        return updatedSticker;
      }
      return sticker;
    });
    
    if (updatedCount === 0) {
      return 0; // No stickers to update
    }
    
    // עדכון בשרת תחילה (באופן אסינכרוני)
    console.log(`Updating team name for ${updatedCount} stickers on server`);
    saveStickerBatch(stickersToUpdate).catch(error => {
      console.error(`Error updating team name across stickers on server: ${error}`);
    });
    
    // עדכון מקומי מיידי
    setStickerData(updatedStickers);
    
    // Trigger events
    window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
      detail: { action: 'updateTeam', count: updatedCount } 
    }));
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    return updatedCount;
  } catch (error) {
    console.error(`Error updating team name across stickers: ${error}`);
    return 0;
  }
};
