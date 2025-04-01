
import { Sticker } from '../types';
import { generateId } from '../utils';
import { getStickerData, setStickerData } from './basic-operations';
import { saveStickerBatch } from '../supabase/stickers';

// Import stickers from CSV
export const importStickersFromCSV = async (albumId: string, data: [number | string, string, string][]): Promise<Sticker[]> => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  console.log(`First few entries:`, data.slice(0, 3));
  
  // Get existing stickers for this album
  const existingStickers = getStickerData().filter(sticker => sticker.albumId === albumId);
  
  // Create sets for both numeric and alphanumeric sticker numbers
  const existingNumbers = new Set();
  existingStickers.forEach(s => {
    if (typeof s.number === 'number' || typeof s.number === 'string') {
      existingNumbers.add(s.number);
    }
  });
  
  console.log(`Found ${existingStickers.length} existing stickers for album ${albumId}`);
  console.log(`Existing numbers sample:`, Array.from(existingNumbers).slice(0, 10));
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set(); // Keep track of processed numbers to avoid duplicates
  
  data.forEach(([stickerNumber, name, team], index) => {
    // Skip if already processed (avoid duplicates in input data)
    if (processedNumbers.has(stickerNumber)) {
      console.log(`Skipping duplicate sticker #${stickerNumber} at line ${index + 1}`);
      return;
    }
    
    // Skip if the sticker already exists with this number in this album
    if (existingNumbers.has(stickerNumber)) {
      console.log(`Skipping sticker #${stickerNumber} - already exists in album`);
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
    console.log(`Adding ${newStickers.length} new stickers to server for album ${albumId}`);
    console.log(`New stickers sample:`, newStickers.slice(0, 5).map(s => ({ number: s.number, name: s.name })));
    
    // Save to server first - this is important to ensure data is persisted to Supabase
    const saveResult = await saveStickerBatch(newStickers);
    
    if (!saveResult) {
      console.error("Failed to save stickers to Supabase");
      throw new Error("Failed to save stickers to Supabase");
    }
    
    // Update local state after successful server save
    const allStickers = getStickerData();
    const updatedStickers = [...allStickers, ...newStickers];
    setStickerData(updatedStickers);
    
    // Trigger events with a slight delay to ensure data is saved
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log(`Dispatching sticker data changed events for ${newStickers.length} new stickers`);
        
        // Dispatch the specific event
        window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
          detail: { 
            albumId, 
            action: 'import',
            count: newStickers.length 
          } 
        }));
        
        // Dispatch a general refresh event
        window.dispatchEvent(new CustomEvent('forceRefresh'));
        
        // Additional event at a longer delay to catch components that might initialize later
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('stickerDataChanged', { 
            detail: { albumId, count: newStickers.length } 
          }));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, 500);
      }
    }, 100);
    
    return newStickers;
  } catch (error) {
    console.error(`Error importing stickers:`, error);
    throw error;
  }
};
