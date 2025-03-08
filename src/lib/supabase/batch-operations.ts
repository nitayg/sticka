
import { supabase } from './client';

export async function saveBatch<T extends { id: string }>(
  tableName: string,
  items: T[]
) {
  if (!items.length) return true;

  console.log(`Received items for ${tableName}:`, JSON.stringify(items, null, 2));
  console.log(`Saving ${items.length} items to ${tableName}`);

  console.log('JSON שנשלח:', JSON.stringify(items, null, 2));

  try {
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      const { error } = await supabase
        .from(tableName)
        .upsert(chunk, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select('*');

      if (error) {
        console.error(
          `Error saving batch to ${tableName} (chunk ${i}-${i + chunk.length}):`,
          error
        );
        console.error('Error details:', JSON.stringify(error));
        return false;
      }

      if (items.length > chunkSize && i + chunkSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    console.log(`Successfully saved ${items.length} items to ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error in saveBatch for ${tableName}:`, error);
    return false;
  }
}
