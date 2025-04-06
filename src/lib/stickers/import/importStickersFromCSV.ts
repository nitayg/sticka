
import { Sticker } from '../../types';
import { generateId } from '../../utils';
import { getStickerData, setStickerData } from '../basic-operations';
import { processStickerBatches } from './batch-processing';
import { validateStickersForImport, logSpecialStickers } from './sticker-validator';

// Import stickers from CSV
export const importStickersFromCSV = async (albumId: string, data: [number | string, string, string][]): Promise<Sticker[]> => {
  if (!albumId || !data || !data.length) {
    console.error(`Cannot import stickers. Missing albumId or data`, { albumId, dataLength: data?.length });
    return [];
  }

  console.log(`Importing ${data.length} stickers from CSV for album ${albumId}`);
  console.log(`First few entries:`, data.slice(0, 3));
  console.log(`Sample entries in range 425-445:`, data.filter(([num]) => {
    if (typeof num === 'number') {
      return num >= 425 && num <= 445;
    }
    return false;
  }));
  
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
  console.log(`Existing numbers sample:`, Array.from(existingNumbers).slice(0, 10));
  
  // Debug special ranges
  if (existingNumbers.size > 0) {
    console.log(`Existing numbers contains 'L1': ${existingNumbers.has('L1')}`);
    console.log(`Existing numbers contains '426': ${existingNumbers.has(426)}`);
    console.log(`Existing numbers contains '440': ${existingNumbers.has(440)}`);
  }
  
  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set(); // Keep track of processed numbers to avoid duplicates
  
  data.forEach(([stickerNumber, name, team], index) => {
    // Debug the incoming sticker number
    console.log(`Processing sticker #${stickerNumber} (${typeof stickerNumber}) at line ${index + 1}`);
    
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
    
    // Log confirmation for special ranges
    if (typeof stickerNumber === 'number' && stickerNumber >= 426 && stickerNumber <= 440) {
      console.log(`Added critical range sticker to newStickers: #${stickerNumber} - ${name}`);
    } else if (typeof stickerNumber === 'string' && stickerNumber.startsWith('L')) {
      console.log(`Added alphanumeric sticker to newStickers: #${stickerNumber} - ${name}`);
    }
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
      
      // Trigger events with a slight delay to ensure data is saved
      setTimeout(() => {
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
      }, 100);
      
      return savedStickers;
    }
    
    // If we didn't save any stickers, throw an error
    throw new Error("Failed to save stickers to Supabase. This might be due to exceeding egress limits.");
  } catch (error) {
    console.error(`Error importing stickers:`, error);
    throw error; 
  }
};
