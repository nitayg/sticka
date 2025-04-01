
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
  
  // Get existing stickers for this album
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  
  // Create sets for both numeric and alphanumeric sticker numbers
  const existingNumbers = new Set();
  existingStickers.forEach(s => {
    if (typeof s.number === 'number' || typeof s.number === 'string') {
      existingNumbers.add(s.number);
    }
  });
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  console.log(`Existing numbers sample:`, Array.from(existingNumbers).slice(0, 10));
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set(); // Keep track of processed numbers to avoid duplicates
  
  data.forEach(([stickerNumber, name, team], index) => {
    // Skip if already processed (avoid duplicates in input data)
    if (processedNumbers.has(stickerNumber)) {
      console.log(`Skipping duplicate sticker #${stickerNumber} at line ${index + 1}`);
      return;
    }
    
    // Skip if the sticker already exists with this number in this album
    if (existingNumbers.has(stickerNumber)) {
      console.log(`Skipping sticker #${stickerNumber} - already exists in album`);
      return;
    }
    
    // Mark as processed
    processedNumbers.add(stickerNumber);
    
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
  
  if (newStickers.length === 0) {
    console.warn('No new stickers to import');
    return [];
  }
  
  try {
    console.log(`Adding ${newStickers.length} new stickers to server for album ${albumId}`);
    console.log(`New stickers sample:`, newStickers.slice(0, 5).map(s => ({ number: s.number, name: s.name })));
    
    // To fix the "Failed to save stickers to Supabase" error, let's:
    // 1. Process in smaller batches to avoid timeouts/limits
    // 2. Add error handling and retries
    const BATCH_SIZE = 100;
    let saveSuccess = true;
    
    for (let i = 0; i < newStickers.length; i += BATCH_SIZE) {
      const batch = newStickers.slice(i, i + BATCH_SIZE);
      console.log(`Saving batch ${i/BATCH_SIZE + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}, size: ${batch.length}`);
      
      // Try to save with retries
      const MAX_RETRIES = 3;
      let retries = 0;
      let batchSaved = false;
      
      while (retries < MAX_RETRIES && !batchSaved) {
        try {
          const result = await saveStickerBatch(batch);
          if (!result) {
            console.error(`Failed to save batch ${i/BATCH_SIZE + 1}, retry ${retries + 1}/${MAX_RETRIES}`);
            retries++;
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
            }
          } else {
            batchSaved = true;
            console.log(`Successfully saved batch ${i/BATCH_SIZE + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}`);
          }
        } catch (error) {
          console.error(`Error saving batch ${i/BATCH_SIZE + 1}, retry ${retries + 1}/${MAX_RETRIES}:`, error);
          retries++;
          if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          }
        }
      }
      
      if (!batchSaved) {
        saveSuccess = false;
        console.error(`Failed to save batch ${i/BATCH_SIZE + 1} after ${MAX_RETRIES} retries`);
      }
      
      // Add a small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < newStickers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (!saveSuccess) {
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
    console.error(`Error importing stickers:`, error);
    throw error;
  }
};
