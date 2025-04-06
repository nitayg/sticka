
import { supabase } from './client';

export async function saveBatch<T extends { id: string }>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`Received ${items.length} items for ${tableName}`);
  
  // Don't log the full JSON to avoid console overload but log the structure
  const firstItem = items[0];
  console.log(`First item sample:`, firstItem);

  // Check for important sticker numbers if batch contains stickers
  if (tableName === 'stickers' && 'number' in firstItem) {
    const specialItems = items.filter((item: any) => {
      if (typeof item.number === 'number') {
        return item.number >= 426 && item.number <= 440;
      }
      if (typeof item.number === 'string') {
        return /^[A-Za-z]/.test(item.number);
      }
      return false;
    });
    
    if (specialItems.length > 0) {
      console.log(`Found ${specialItems.length} special stickers in this batch:`, 
        specialItems.map((item: any) => ({ number: item.number, name: item.name })));
    }
  }

  try {
    // Use even smaller chunk size to avoid request size limits
    const chunkSize = 5; // Reduced from 20 to 5 for smallest possible batch size
    let allSuccess = true;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      console.log(`Processing chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}, size: ${chunk.length}`);

      // Check for special stickers in this chunk
      if (tableName === 'stickers') {
        const specialInChunk = chunk.filter((item: any) => {
          if (typeof item.number === 'number') {
            return item.number >= 426 && item.number <= 440;
          }
          if (typeof item.number === 'string') {
            return /^[A-Za-z]/.test(item.number);
          }
          return false;
        });
        
        if (specialInChunk.length > 0) {
          console.log(`Chunk ${i/chunkSize + 1} contains ${specialInChunk.length} special stickers:`, 
            specialInChunk.map((item: any) => ({ number: item.number })));
        }
      }

      try {
        // Add more delay between requests to avoid rate limiting
        if (i > 0) {
          const delayMs = 1500; // Increased from 800ms to 1500ms
          console.log(`Adding delay of ${delayMs}ms before processing next chunk`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        const { error, data } = await supabase
          .from(tableName)
          .upsert(chunk, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error(
            `Error saving batch to ${tableName} (chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}):`,
            error
          );
          
          // If we hit an egress limit or rate limit error, add a longer delay
          if (error.message?.includes('exceeded') || error.code === '429') {
            console.log('Detected rate limit or egress limit error, adding longer delay');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Increased from 3000ms to 5000ms
          }
          
          allSuccess = false;
        } else {
          console.log(`Successfully saved chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)} to ${tableName}`);
          
          // Check for special stickers that were saved successfully
          if (tableName === 'stickers') {
            const specialSaved = chunk.filter((item: any) => {
              if (typeof item.number === 'number') {
                return item.number >= 426 && item.number <= 440;
              }
              if (typeof item.number === 'string') {
                return /^[A-Za-z]/.test(item.number);
              }
              return false;
            });
            
            if (specialSaved.length > 0) {
              console.log(`Successfully saved ${specialSaved.length} special stickers in chunk ${i/chunkSize + 1}`);
            }
          }
        }
      } catch (chunkError) {
        console.error(`Exception in chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}:`, chunkError);
        allSuccess = false;
      }

      // Add a delay between chunks based on the current chunk index
      // The deeper we go, the longer we wait to avoid overloading the service
      const progressiveDelay = Math.min(1000 + (i / items.length) * 2000, 3000); // Increased max delay to 3000ms
      if (i + chunkSize < items.length) {
        console.log(`Adding progressive delay of ${progressiveDelay}ms before next chunk`);
        await new Promise((resolve) => setTimeout(resolve, progressiveDelay));
      }
    }

    if (allSuccess) {
      console.log(`Successfully saved all ${items.length} items to ${tableName}`);
      return true;
    } else {
      console.error(`Failed to save some chunks to ${tableName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error in saveBatch for ${tableName}:`, error);
    return false;
  }
}
