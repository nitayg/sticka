
import { supabase } from './client';

export async function saveBatch<T extends { id: string }>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`Received ${items.length} items for ${tableName}`);
  
  // Don't log the full JSON to avoid console overload
  console.log(`First item sample:`, JSON.stringify(items[0], null, 2));

  try {
    // Further reduced chunk size to avoid request size limits
    const chunkSize = 20; // Reduced from 25 to 20 for smaller batch size
    let allSuccess = true;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      console.log(`Processing chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}, size: ${chunk.length}`);

      try {
        // Add more delay between requests to avoid rate limiting
        if (i > 0) {
          const delayMs = 800; // Increased from 500ms to 800ms
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
          console.error('Error details:', JSON.stringify(error, null, 2));
          
          // If we hit an egress limit or rate limit error, add a longer delay
          if (error.message?.includes('exceeded') || error.code === '429') {
            console.log('Detected rate limit or egress limit error, adding longer delay');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased from 2000ms to 3000ms
          }
          
          allSuccess = false;
        } else {
          console.log(`Successfully saved chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)} to ${tableName}`);
        }
      } catch (chunkError) {
        console.error(`Exception in chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}:`, chunkError);
        allSuccess = false;
      }

      // Add a delay between chunks based on the current chunk index
      // The deeper we go, the longer we wait to avoid overloading the service
      const progressiveDelay = Math.min(500 + (i / items.length) * 1000, 1500); // Increased max delay
      if (i + chunkSize < items.length) {
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
