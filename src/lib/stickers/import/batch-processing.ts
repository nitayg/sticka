
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
  
  // Log only a summary, not all special stickers
  const alphanumericCount = newStickers.filter(s => 
    typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
  ).length;
  
  if (alphanumericCount > 0) {
    console.log(`About to import ${alphanumericCount} alphanumeric stickers`);
  }
  
  console.log(`New stickers sample count: ${newStickers.length}`);
  
  // Process in smaller batches to avoid egress limits
  const BATCH_SIZE = 3; // Reduced batch size for more reliable importing
  const savedStickers: Sticker[] = [];
  
  // Use adaptive delays based on batch size
  const MIN_DELAY = 3000; // Minimum delay of 3 seconds
  const BASE_DELAY_PER_STICKER = 500; // Base delay per sticker in milliseconds
  
  for (let i = 0; i < newStickers.length; i += BATCH_SIZE) {
    const batch = newStickers.slice(i, i + BATCH_SIZE);
    console.log(`Saving batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}, size: ${batch.length}`);
    
    // Calculate specific delay for this batch based on size
    const batchDelay = Math.max(MIN_DELAY, batch.length * BASE_DELAY_PER_STICKER);
    
    // Try to save with retries
    const MAX_RETRIES = 3;
    let retries = 0;
    let batchSaved = false;
    
    while (retries < MAX_RETRIES && !batchSaved) {
      try {
        // If this is a retry, add progressively longer delay
        if (retries > 0) {
          const backoffDelay = Math.min(2000 * Math.pow(2, retries - 1), 10000); // Exponential backoff up to 10s
          console.log(`Retry ${retries}/${MAX_RETRIES}: Waiting ${backoffDelay}ms before retrying batch ${Math.floor(i/BATCH_SIZE) + 1}`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
        
        // Attempt to save the batch and capture detailed response
        const result = await saveStickerBatch(batch);
        
        // Improved error reporting
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
    
    // If batch failed, just continue with the next batch
    if (!batchSaved) {
      console.error(`Failed to save batch ${Math.floor(i/BATCH_SIZE) + 1} after ${MAX_RETRIES} retries`);
    }
    
    // Add a delay between batches - CRITICAL for Supabase throttling
    if (i + BATCH_SIZE < newStickers.length) {
      console.log(`Waiting ${batchDelay}ms between batches to avoid rate limits`);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }
  
  console.log(`Successfully saved ${savedStickers.length}/${newStickers.length} stickers to Supabase`);
  
  // Even if we didn't save all stickers, return what we did save
  return savedStickers;
}
