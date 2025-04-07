
import { Sticker } from '../types';
import { getStickersByAlbumId } from './basic-operations';
import { updateSticker } from './crud-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Toggle owned status
export const toggleStickerOwned = async (id: string): Promise<Sticker | null> => {
  try {
    // Find the sticker in question first
    let sticker: Sticker | undefined;
    let albumId: string | undefined;
    
    // Loop through albums until we find the sticker (only happens once per toggle)
    const allAlbums = JSON.parse(localStorage.getItem('albums') || '[]');
    for (const album of allAlbums) {
      const stickers = getStickersByAlbumId(album.id);
      sticker = stickers.find(s => s.id === id);
      if (sticker) {
        albumId = album.id;
        break;
      }
    }
    
    if (!sticker || !albumId) {
      console.error(`Sticker with ID ${id} not found in any album`);
      return null;
    }
    
    // Optimistically update local state before waiting for server response
    const updatedSticker = { ...sticker, isOwned: !sticker.isOwned };
    
    // Get stickers from just this album for targeted update
    const albumStickers = getStickersByAlbumId(albumId);
    
    // Update local state first
    const updatedStickers = albumStickers.map(s => 
      s.id === id ? updatedSticker : s
    );
    
    // We'll still need to get all stickers to update the full dataset
    // but we only replace the ones for this particular album
    const allStickers = [];
    for (const alb of allAlbums) {
      if (alb.id === albumId) {
        allStickers.push(...updatedStickers);
      } else {
        allStickers.push(...getStickersByAlbumId(alb.id));
      }
    }
    
    // Use the basic operations to set the sticker data
    const { setStickerData } = await import('./basic-operations');
    setStickerData(allStickers, { albumId, action: 'toggleOwned' });
    
    // Dispatch event for immediate UI update
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Then update the server (without waiting for response)
    updateSticker(id, { isOwned: !sticker.isOwned }).catch(error => {
      console.error(`Server update failed for toggling sticker owned status: ${error}`);
      
      // If server update fails, revert local state
      updateSticker(id, { isOwned: sticker.isOwned }).catch(e => {
        console.error('Failed to revert sticker state:', e);
      });
      
      window.dispatchEvent(new CustomEvent('forceRefresh'));
    });
    
    return updatedSticker;
  } catch (error) {
    console.error(`Error toggling sticker owned status: ${error}`);
    throw error;
  }
};

// Toggle duplicate status
export const toggleStickerDuplicate = async (id: string): Promise<Sticker | null> => {
  try {
    // Find the sticker in question first
    let sticker: Sticker | undefined;
    let albumId: string | undefined;
    
    // Loop through albums until we find the sticker (only happens once per toggle)
    const allAlbums = JSON.parse(localStorage.getItem('albums') || '[]');
    for (const album of allAlbums) {
      const stickers = getStickersByAlbumId(album.id);
      sticker = stickers.find(s => s.id === id);
      if (sticker) {
        albumId = album.id;
        break;
      }
    }
    
    if (!sticker || !albumId) {
      console.error(`Sticker with ID ${id} not found in any album`);
      return null;
    }
    
    if (!sticker.isOwned) {
      console.error(`Cannot set as duplicate - sticker ${id} is not owned`);
      return null;
    }
    
    const duplicateCount = sticker.isDuplicate 
      ? Math.max(0, (sticker.duplicateCount || 1) - 1) 
      : 1;
    
    const isDuplicate = duplicateCount > 0;
    
    // Optimistically update local state
    const updatedSticker = { 
      ...sticker, 
      isDuplicate, 
      duplicateCount: isDuplicate ? duplicateCount : 0
    };
    
    // Get stickers from just this album for targeted update
    const albumStickers = getStickersByAlbumId(albumId);
    
    // Update local state first for immediate visual feedback
    const updatedAlbumStickers = albumStickers.map(s => 
      s.id === id ? updatedSticker : s
    );
    
    // We'll still need to get all stickers to update the full dataset
    // but we only replace the ones for this particular album
    const allStickers = [];
    for (const alb of allAlbums) {
      if (alb.id === albumId) {
        allStickers.push(...updatedAlbumStickers);
      } else {
        allStickers.push(...getStickersByAlbumId(alb.id));
      }
    }
    
    // Use the basic operations to set the sticker data
    const { setStickerData } = await import('./basic-operations');
    setStickerData(allStickers, { albumId, action: 'toggleDuplicate' });
    
    // Dispatch event for immediate UI update
    window.dispatchEvent(new CustomEvent('forceRefresh'));
    
    // Then update the server (without waiting for response)
    updateSticker(id, { 
      isDuplicate, 
      duplicateCount: isDuplicate ? duplicateCount : 0 
    }).catch(error => {
      console.error(`Server update failed for toggling sticker duplicate status: ${error}`);
      
      // If server update fails, revert local state
      updateSticker(id, { 
        isDuplicate: sticker.isDuplicate, 
        duplicateCount: sticker.duplicateCount || 0 
      }).catch(e => {
        console.error('Failed to revert sticker state:', e);
      });
      
      window.dispatchEvent(new CustomEvent('forceRefresh'));
    });
    
    return updatedSticker;
  } catch (error) {
    console.error(`Error toggling sticker duplicate status: ${error}`);
    throw error;
  }
};

// Add stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: (number | string)[]): { 
  newlyOwned: (number | string)[], 
  duplicatesUpdated: (number | string)[], 
  notFound: (number | string)[] 
} => {
  const albumStickers = getStickersByAlbumId(albumId);
  
  const newlyOwned: (number | string)[] = [];
  const duplicatesUpdated: (number | string)[] = [];
  const notFound: (number | string)[] = [];
  const stickersToUpdate: Sticker[] = [];
  
  stickerNumbers.forEach(number => {
    const sticker = albumStickers.find(s => s.number === number);
    
    if (!sticker) {
      notFound.push(number);
      return;
    }
    
    if (!sticker.isOwned) {
      // Mark as owned for the first time
      const updatedSticker = { ...sticker, isOwned: true };
      stickersToUpdate.push(updatedSticker);
      newlyOwned.push(number);
    } else {
      // Already owned, mark as duplicate
      const updatedSticker = {
        ...sticker,
        isDuplicate: true,
        duplicateCount: (sticker.duplicateCount || 0) + 1
      };
      stickersToUpdate.push(updatedSticker);
      duplicatesUpdated.push(number);
    }
  });
  
  if (stickersToUpdate.length === 0) {
    return { newlyOwned, duplicatesUpdated, notFound };
  }
  
  try {
    // Get all album stickers
    const updatedAlbumStickers = albumStickers.map(sticker => {
      const updatedSticker = stickersToUpdate.find(s => s.id === sticker.id);
      return updatedSticker || sticker;
    });
    
    // Use basic operations to set sticker data for this album only
    const { setStickerData } = require('./basic-operations');
    setStickerData(updatedAlbumStickers, { albumId, action: 'bulkUpdate' });
    
    // Trigger immediate UI refresh with multiple events for different components
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRefresh'));
      window.dispatchEvent(new CustomEvent('inventoryDataChanged'));
      window.dispatchEvent(new CustomEvent('albumDataChanged'));
    }, 10);
    
    // Server update in background - non-blocking
    saveStickerBatch(stickersToUpdate).catch(error => {
      console.error(`Error updating stickers inventory on server: ${error}`);
    });
    
    return { newlyOwned, duplicatesUpdated, notFound };
  } catch (error) {
    console.error(`Error updating stickers inventory: ${error}`);
    return { newlyOwned: [], duplicatesUpdated: [], notFound: [] };
  }
};
