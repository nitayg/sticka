
import { Sticker } from '../types';
import { generateId } from '../utils';
import { getStickerData, setStickerData } from './basic-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Import stickers from CSV
export const importStickersFromCSV = async (albumId: string, data: [number | string, string, string][]): Promise<Sticker[]> => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  console.log(`First few entries:`, data.slice(0, 3));
  
  // Get existing stickers for this album from local cache
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  
  // Create sets for both numeric and alphanumeric sticker numbers
  const existingNumbers = new Set();
  existingStickers.forEach(s => {
    if (typeof s.number === 'number' || typeof s.number === 'string') {
      existingNumbers.add(s.number);
    }
  });
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  
  // Process in batches of 100 to prevent large array operations
  const BATCH_SIZE = 100;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    batch.forEach(([stickerNumber, name, team]) => {
      // Skip if the sticker already exists with this number in this album
      if (existingNumbers.has(stickerNumber)) {
        console.log(`Skipping sticker #${stickerNumber} - already exists in album`);
        return;
      }
      
      const newSticker: Sticker = {
        id: generateId(),
        number: stickerNumber,
        name: name || `Sticker ${stickerNumber}`,
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
  }
  
  if (newStickers.length === 0) {
    console.warn('No new stickers to import');
    return [];
  }
  
  try {
    // Save to server in batches of 50 to prevent large payloads
    console.log(`Adding ${newStickers.length} new stickers to server for album ${albumId}`);
    
    // Process in smaller batches to reduce payload size
    const SERVER_BATCH_SIZE = 50;
    let allSaved = true;
    
    for (let i = 0; i < newStickers.length; i += SERVER_BATCH_SIZE) {
      const batchToSave = newStickers.slice(i, i + SERVER_BATCH_SIZE);
      const saveResult = await saveStickerBatch(batchToSave);
      
      if (!saveResult) {
        console.error(`Failed to save batch ${i / SERVER_BATCH_SIZE + 1}`);
        allSaved = false;
      }
    }
    
    if (!allSaved) {
      console.error("Failed to save some stickers to Supabase");
      throw new Error("Failed to save some stickers to Supabase");
    }
    
    // Update local state after successful server save
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
      }
    }, 100);
    
    return newStickers;
  } catch (error) {
    console.error(`Error importing stickers:`, error);
    throw error;
  }
};
