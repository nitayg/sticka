
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
    // Reduced chunk size to avoid request size limits
    const chunkSize = 50; 
    let allSuccess = true;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      console.log(`Processing chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}, size: ${chunk.length}`);

      try {
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
          allSuccess = false;
        } else {
          console.log(`Successfully saved chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)} to ${tableName}`);
        }
      } catch (chunkError) {
        console.error(`Exception in chunk ${i/chunkSize + 1}/${Math.ceil(items.length/chunkSize)}:`, chunkError);
        allSuccess = false;
      }

      // Add a delay between chunks to avoid rate limiting
      if (i + chunkSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
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
