
import { saveBatch } from '../supabase';

// Sync data to Supabase with better error handling and chunking
export const sendToSupabase = async <T>(key: string, data: T): Promise<void> => {
  if (Array.isArray(data)) {
    // Determine the table name based on the key
    let tableName = '';
    switch (key) {
      case 'albums':
        tableName = 'albums';
        break;
      case 'stickers':
        tableName = 'stickers';
        break;
      case 'users':
        tableName = 'users';
        break;
      case 'exchangeOffers':
        tableName = 'exchange_offers';
        break;
      default:
        console.error(`[Sync] Unknown key: ${key}`);
        return;
    }
    
    console.log(`[Sync] Sending ${data.length} items to Supabase table: ${tableName}`);
    
    // Save the data to Supabase with enhanced error handling
    try {
      const result = await saveBatch(tableName, data);
      if (result) {
        console.log(`[Sync] Successfully saved ${data.length} items to ${tableName}`);
      } else {
        console.error(`[Sync] Failed to save items to ${tableName}`);
      }
    } catch (error) {
      console.error(`[Sync] Error sending data to Supabase (${tableName}):`, error);
    }
  }
};
