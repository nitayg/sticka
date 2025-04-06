
import { Sticker } from '../../types';

/**
 * Utilities for validating stickers before import
 */
export function validateStickersForImport(
  existingStickers: Sticker[],
  data: [number | string, string, string][]
): { newStickers: Sticker[], processedNumbers: Set<number | string> } {
  // Create sets for both numeric and alphanumeric sticker numbers
  const existingNumbers = new Set();
  existingStickers.forEach(s => {
    if (s.number !== undefined) {
      existingNumbers.add(s.number);
    }
  });
  
  console.log(`Found ${existingStickers.length} existing stickers`);
  console.log(`Existing numbers sample:`, Array.from(existingNumbers).slice(0, 10));
  
  // Debug special ranges
  if (existingNumbers.size > 0) {
    console.log(`Existing numbers contains 'L1': ${existingNumbers.has('L1')}`);
    console.log(`Existing numbers contains '426': ${existingNumbers.has(426)}`);
    console.log(`Existing numbers contains '440': ${existingNumbers.has(440)}`);
  }

  // Create new stickers
  const newStickers: Sticker[] = [];
  const processedNumbers = new Set<number | string>(); // Keep track to avoid duplicates
  
  return { newStickers, processedNumbers };
}

/**
 * Logs special stickers information after processing
 */
export function logSpecialStickers(stickers: Sticker[]) {
  // Check if we have any stickers in the 426-440 range
  const criticalRangeStickers = stickers.filter(s => {
    if (typeof s.number === 'number') {
      return s.number >= 426 && s.number <= 440;
    }
    return false;
  });
  
  const alphanumericStickers = stickers.filter(s => typeof s.number === 'string');
  
  if (criticalRangeStickers.length > 0) {
    console.log(`Found ${criticalRangeStickers.length} stickers in range 426-440:`, 
      criticalRangeStickers.map(s => ({ number: s.number, name: s.name })));
  } else {
    console.log(`No stickers in range 426-440 found`);
  }
  
  if (alphanumericStickers.length > 0) {
    console.log(`Found ${alphanumericStickers.length} alphanumeric stickers:`, 
      alphanumericStickers.map(s => ({ number: s.number, name: s.name })));
  }
}
