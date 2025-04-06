
import { Sticker } from '../../types';
import { generateId } from '../../utils';
import { getStickerData, setStickerData } from '../basic-operations';
import { processStickerBatches } from './batch-processing';

// Import stickers from CSV
export const importStickersFromCSV = async (albumId: string, data: [number | string, string, string][]): Promise<Sticker[]> => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  
  // Get existing stickers for this album
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  
  // Create sets for both numeric and alphanumeric sticker numbers
  const existingNumbers = new Set();
  existingStickers.forEach(s => {
    if (s.number !== undefined) {
      existingNumbers.add(s.number);
    }
  });
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set(); // Keep track of processed numbers to avoid duplicates
  
  data.forEach(([stickerNumber, name, team], index) => {
    // Skip if already processed (avoid duplicates in input data)
    if (processedNumbers.has(stickerNumber)) {
      return;
    }
    
    // Skip if the sticker already exists with this number in this album
    if (existingNumbers.has(stickerNumber)) {
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
    // Process stickers in batches
    const savedStickers = await processStickerBatches(newStickers);
    
    // If we saved at least some stickers, update the local state with what was saved
    if (savedStickers.length > 0) {
      console.log(`Saved ${savedStickers.length}/${newStickers.length} stickers to Supabase`);
      
      // Update local state with successfully saved stickers
      const allStickers = getStickerData();
      const updatedStickers = [...allStickers, ...savedStickers];
      setStickerData(updatedStickers);
      
      // Trigger events
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
      
      return savedStickers;
    }
    
    return [];
  } catch (error) {
    console.error(`Error importing stickers:`, error);
    throw error; 
  }
};
