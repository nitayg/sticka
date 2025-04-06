
import { Sticker } from '../../types';
import { saveStickerBatch } from '../../supabase/stickers';

/**
 * Processes sticker batches for import with retry logic and delays to avoid rate limiting
 */
export async function processStickerBatches(
  newStickers: Sticker[], 
  tableName: string = 'stickers'
): Promise<Sticker[]> {
  if (newStickers.length === 0) {
    console.warn('No new stickers to import');
    return [];
  }

  console.log(`Adding ${newStickers.length} new stickers to server`);
  console.log(`New stickers sample:`, newStickers.slice(0, 3).map(s => ({ number: s.number, name: s.name })));
  
  // Check if we have any stickers in the 426-440 range
  const criticalRangeStickers = newStickers.filter(s => {
    if (typeof s.number === 'number') {
      return s.number >= 426 && s.number <= 440;
    }
    return false;
  });
  
  const alphanumericStickers = newStickers.filter(s => typeof s.number === 'string');
  
  console.log(`Found ${criticalRangeStickers.length} stickers in range 426-440 to be imported`, 
    criticalRangeStickers.map(s => ({ number: s.number, name: s.name })));
  
  console.log(`Found ${alphanumericStickers.length} alphanumeric stickers to be imported`, 
    alphanumericStickers.map(s => ({ number: s.number, name: s.name })));
  
  // Process in smaller batches to avoid egress limits
  const BATCH_SIZE = 10; // Small batch size for more reliable importing
  let saveSuccess = true;
  const savedStickers: Sticker[] = [];
  
  for (let i = 0; i < newStickers.length; i += BATCH_SIZE) {
    const batch = newStickers.slice(i, i + BATCH_SIZE);
    console.log(`Saving batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}, size: ${batch.length}`);
    
    // Check if this batch contains any of our target range
    const hasCriticalRange = batch.some(s => {
      if (typeof s.number === 'number') {
        return s.number >= 426 && s.number <= 440;
      }
      return false;
    });
    
    const hasAlphanumeric = batch.some(s => typeof s.number === 'string');
    
    if (hasCriticalRange) {
      console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} contains critical range stickers:`, 
        batch.filter(s => {
          if (typeof s.number === 'number') {
            return s.number >= 426 && s.number <= 440;
          }
          return false;
        }).map(s => ({ number: s.number, name: s.name })));
    }
    
    if (hasAlphanumeric) {
      console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} contains alphanumeric stickers:`, 
        batch.filter(s => typeof s.number === 'string')
          .map(s => ({ number: s.number, name: s.name })));
    }
    
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
          
          if (hasCriticalRange) {
            console.log(`Successfully saved critical range stickers in batch ${Math.floor(i/BATCH_SIZE) + 1}`);
          }
          
          if (hasAlphanumeric) {
            console.log(`Successfully saved alphanumeric stickers in batch ${Math.floor(i/BATCH_SIZE) + 1}`);
          }
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
    
    // Add a longer delay between batches - CRITICAL for Supabase throttling
    if (i + BATCH_SIZE < newStickers.length) {
      const betweenBatchDelay = 2000; // Increased from 1200ms to 2000ms
      console.log(`Waiting ${betweenBatchDelay}ms between batches to avoid rate limits`);
      await new Promise(resolve => setTimeout(resolve, betweenBatchDelay));
    }
  }
  
  // Check critical ranges after save
  const savedCriticalRange = savedStickers.filter(s => {
    if (typeof s.number === 'number') {
      return s.number >= 426 && s.number <= 440;
    }
    return false;
  });
  
  const savedAlphanumeric = savedStickers.filter(s => typeof s.number === 'string');
  
  console.log(`Saved ${savedCriticalRange.length} stickers in range 426-440`);
  console.log(`Saved ${savedAlphanumeric.length} alphanumeric stickers`);
  
  if (saveSuccess === false || savedStickers.length === 0) {
    throw new Error("Failed to save stickers to Supabase. This might be due to exceeding egress limits.");
  }
  
  return savedStickers;
}
