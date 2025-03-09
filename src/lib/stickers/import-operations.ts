
import { Sticker } from '../types';
import { generateId } from '../utils';
import { getStickerData, setStickerData } from './basic-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Import stickers from CSV
export const importStickersFromCSV = (albumId: string, data: [number, string, string][]): Sticker[] => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  console.log(`First few entries:`, data.slice(0, 3));
  
  // Get existing stickers for this album
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  const existingNumbers = new Set(existingStickers.map(s => s.number));
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  
  data.forEach(([number, name, team]) => {
    // Skip if the sticker already exists with this number in this album
    if (existingNumbers.has(number)) {
      console.log(`Skipping sticker #${number} - already exists in album`);
      return;
    }
    
    const newSticker: Sticker = {
      id: generateId(),
      number,
      name: name || `Sticker ${number}`,
      team: team || 'Unknown',
      teamLogo: '',
      category: team || 'Default',
      imageUrl: '',
      isOwned: false,
      isDuplicate: false,
      duplicateCount: 0,
      albumId,
      lastModified: new Date().getTime(),
    };
    
    newStickers.push(newSticker);
  });
  
  if (newStickers.length === 0) {
    console.warn('No new stickers to import');
    return [];
  }
  
  try {
    // שמירה בשרת תחילה - כעת נעשה בצורה סינכרונית במקום אסינכרונית
    console.log(`Adding ${newStickers.length} new stickers to server for album ${albumId}`);
    saveStickerBatch(newStickers).catch(error => {
      console.error(`Error importing stickers to server: ${error}`);
    });
    
    // Update local state without waiting for server response
    const allStickers = getStickerData();
    const updatedStickers = [...allStickers, ...newStickers];
    setStickerData(updatedStickers);
    
    // Trigger events with a slight delay to ensure data is saved
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log(`Dispatching sticker data changed events for ${newStickers.length} new stickers`);
        
        // Dispatch the specific event
        window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
          detail: { 
            albumId, 
            action: 'import',
            count: newStickers.length 
          } 
        }));
        
        // Dispatch a general refresh event
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        
        // Additional event at a longer delay to catch components that might initialize later
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
            detail: { albumId, count: newStickers.length } 
          }));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, 500);
      }
    }, 100);
    
    return newStickers;
  } catch (error) {
    console.error(`Error importing stickers: ${error}`);
    return [];
  }
};
