
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
  console.log(`Existing numbers contains 'L1': ${existingNumbers.has('L1')}`);
  console.log(`Existing numbers contains 'L20': ${existingNumbers.has('L20')}`);
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set(); // Keep track of processed numbers to avoid duplicates
  
  data.forEach(([stickerNumber, name, team], index) => {
    // Debug the incoming sticker number
    console.log(`Processing sticker #${stickerNumber} (${typeof stickerNumber}) at line ${index + 1}`);
    
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
    console.log(`New stickers sample:`, newStickers.slice(0, 3).map(s => ({ number: s.number, name: s.name })));
    
    // Process in even smaller batches to avoid egress limits
    const BATCH_SIZE = 25; // Reduced from 50 to 25 to help with egress limits
    let saveSuccess = true;
    const savedStickers: Sticker[] = [];
    
    for (let i = 0; i < newStickers.length; i += BATCH_SIZE) {
      const batch = newStickers.slice(i, i + BATCH_SIZE);
      console.log(`Saving batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}, size: ${batch.length}`);
      
      // Try to save with retries
      const MAX_RETRIES = 5;
      let retries = 0;
      let batchSaved = false;
      
      while (retries < MAX_RETRIES && !batchSaved) {
        try {
          // If this is a retry, add progressively longer delay
          if (retries > 0) {
            const backoffDelay = Math.min(1000 * Math.pow(2, retries - 1), 10000); // Exponential backoff up to 10s
            console.log(`Retry ${retries}/${MAX_RETRIES}: Waiting ${backoffDelay}ms before retrying batch ${Math.floor(i/BATCH_SIZE) + 1}`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
          
          const result = await saveStickerBatch(batch);
          if (!result) {
            console.error(`Failed to save batch ${Math.floor(i/BATCH_SIZE) + 1}, retry ${retries + 1}/${MAX_RETRIES}`);
            retries++;
          } else {
            batchSaved = true;
            savedStickers.push(...batch);
            console.log(`Successfully saved batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}`);
          }
        } catch (error) {
          console.error(`Error saving batch ${Math.floor(i/BATCH_SIZE) + 1}, retry ${retries + 1}/${MAX_RETRIES}:`, error);
          retries++;
        }
      }
      
      if (!batchSaved) {
        saveSuccess = false;
        console.error(`Failed to save batch ${Math.floor(i/BATCH_SIZE) + 1} after ${MAX_RETRIES} retries`);
      }
      
      // Add a longer delay between batches
      if (i + BATCH_SIZE < newStickers.length) {
        const betweenBatchDelay = 1200; // Increased from 800ms to 1200ms
        console.log(`Waiting ${betweenBatchDelay}ms between batches to avoid rate limits`);
        await new Promise(resolve => setTimeout(resolve, betweenBatchDelay));
      }
    }
    
    // If we saved at least some stickers, update the local state with what was saved
    if (savedStickers.length > 0) {
      console.log(`Saved ${savedStickers.length}/${newStickers.length} stickers to Supabase`);
      
      // Update local state with successfully saved stickers
      const allStickers = getStickerData();
      const updatedStickers = [...allStickers, ...savedStickers];
      setStickerData(updatedStickers);
      
      // Trigger events with a slight delay to ensure data is saved
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log(`Dispatching sticker data changed events for ${savedStickers.length} new stickers`);
          
          // Dispatch the specific event
          window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
            detail: { 
              albumId, 
              action: 'import',
              count: savedStickers.length 
            } 
          }));
          
          // Dispatch a general refresh event
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }
      }, 100);
      
      return savedStickers;
    }
    
    // If we didn't save any stickers, throw an error
    if (saveSuccess === false || savedStickers.length === 0) {
      throw new Error("Failed to save stickers to Supabase. This might be due to exceeding egress limits.");
    }
    
    return savedStickers;
  } catch (error) {
    console.error(`Error importing stickers:`, error);
    throw error; 
  }
};
