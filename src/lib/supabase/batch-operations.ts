import { supabase } from './client';

export async function saveBatch<T extends { id: string }>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`Received ${items.length} items for ${tableName}`);
  
  // Don't log the full JSON to avoid console overload
  console.log(`First item type structure:`, Object.keys(items[0]));

  try {
    // Use even smaller chunk size to avoid request size limits
    const chunkSize = 3; // Reduced from 5 to 3 for smallest possible batch size
    let allSuccess = true;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      console.log(`Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(items.length/chunkSize)}, size: ${chunk.length}`);

      try {
        // Add more delay between requests to avoid rate limiting
        if (i > 0) {
          const delayMs = 2500; // Increased from 1500ms to 2500ms
          console.log(`Adding delay of ${delayMs}ms before processing next chunk`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        // Detailed error catching for Supabase operation
        const { data, error } = await supabase
          .from(tableName)
          .upsert(chunk, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        // Improved error logging with detailed information
        if (error) {
          console.error(
            `Error saving batch to ${tableName} (chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(items.length/chunkSize)}):`,
            error.message,
            error.details,
            error.hint,
            error.code
          );
          
          // If we hit an egress limit or rate limit error, add a longer delay
          if (error.message?.includes('exceeded') || error.code === '429') {
            console.log('Detected rate limit or egress limit error, adding longer delay');
            await new Promise(resolve => setTimeout(resolve, 10000)); // Increased from 5000ms to 10000ms
          }
          
          allSuccess = false;
        } else {
          // Fix: Handle null data case properly with optional chaining and nullish coalescing
          const rowCount = processBatchResponse(error, data);
          console.log(`Successfully saved chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(items.length/chunkSize)} to ${tableName}, received: ${rowCount} rows`);
        }
      } catch (chunkError) {
        console.error(`Exception in chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(items.length/chunkSize)}:`, chunkError);
        allSuccess = false;
      }

      // Add a delay between chunks based on the current chunk index
      // The deeper we go, the longer we wait to avoid overloading the service
      const progressiveDelay = Math.min(2000 + (i / items.length) * 3000, 5000); // Increased max delay to 5000ms
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

// Fix TypeScript error by handling null data value
const processBatchResponse = (error: any, data: any) => {
  if (error) {
    console.error('Error in batch operation:', error);
    
    // Improved error reporting
    if (error.message && (
        error.message.includes('egress') || 
        error.message.includes('limit') || 
        error.message.includes('quota')
      )) {
      throw new Error(`Service limits exceeded: ${error.message}`);
    }
    
    throw error;
  }
  
  // Use nullish coalescing to safely handle potential null data
  return data?.length ?? 0;
};
