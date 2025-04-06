
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
  
  // Log special stickers
  const alphanumericStickers = newStickers.filter(s => 
    typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
  );
  
  if (alphanumericStickers.length > 0) {
    console.log(`About to import ${alphanumericStickers.length} alphanumeric stickers:`);
    console.log(alphanumericStickers.map(s => ({ number: s.number, name: s.name })));
  }
  
  console.log(`New stickers sample:`, newStickers.slice(0, 3).map(s => ({ number: s.number, name: s.name })));
  
  // Process in smaller batches to avoid egress limits
  const BATCH_SIZE = 5; // Reduced batch size for more reliable importing
  const savedStickers: Sticker[] = [];
  
  for (let i = 0; i < newStickers.length; i += BATCH_SIZE) {
    const batch = newStickers.slice(i, i + BATCH_SIZE);
    console.log(`Saving batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(newStickers.length/BATCH_SIZE)}, size: ${batch.length}`);
    
    // Check for alphanumeric stickers in this batch
    const batchAlphanumeric = batch.filter(s => 
      typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
    );
    
    if (batchAlphanumeric.length > 0) {
      console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} contains ${batchAlphanumeric.length} alphanumeric stickers:`, 
        batchAlphanumeric.map(s => ({ number: s.number, name: s.name })));
    }
    
    // Try to save with retries
    const MAX_RETRIES = 3;
    let retries = 0;
    let batchSaved = false;
    
    while (retries < MAX_RETRIES && !batchSaved) {
      try {
        // If this is a retry, add progressively longer delay
        if (retries > 0) {
          const backoffDelay = Math.min(1000 * Math.pow(2, retries - 1), 5000); // Exponential backoff up to 5s
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
          
          // Log successful alphanumeric saves
          if (batchAlphanumeric.length > 0) {
            console.log(`Successfully saved ${batchAlphanumeric.length} alphanumeric stickers in batch ${Math.floor(i/BATCH_SIZE) + 1}`);
          }
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
      const betweenBatchDelay = 2500; // Increased from 2000ms to 2500ms
      console.log(`Waiting ${betweenBatchDelay}ms between batches to avoid rate limits`);
      await new Promise(resolve => setTimeout(resolve, betweenBatchDelay));
    }
  }
  
  // Log about alphanumeric stickers in final result
  const savedAlphanumeric = savedStickers.filter(s => 
    typeof s.number === 'string' && /^[A-Za-z]/.test(s.number.toString())
  );
  
  if (alphanumericStickers.length > 0 && savedAlphanumeric.length > 0) {
    console.log(`Successfully saved ${savedAlphanumeric.length}/${alphanumericStickers.length} alphanumeric stickers`);
  } else if (alphanumericStickers.length > 0) {
    console.error(`Failed to save any of the ${alphanumericStickers.length} alphanumeric stickers!`);
  }
  
  console.log(`Successfully saved ${savedStickers.length}/${newStickers.length} stickers to Supabase`);
  
  // Even if we didn't save all stickers, return what we did save
  return savedStickers;
}
