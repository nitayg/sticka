export interface ParsedCsvRow {
  number: number | string;
  name: string;
  team: string;
}

export const parseCSV = (csvContent: string): ParsedCsvRow[] => {
  if (!csvContent) return [];
  
  console.log("Starting CSV parsing...");
  console.time("CSV parsing time");
  
  // Clean up the input - handle different line breaks
  const cleanContent = csvContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  
  // Split by lines and filter out empty ones
  const lines = cleanContent.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  
  console.log(`Parsing CSV with ${lines.length} lines`);
  console.log(`First few lines:`, lines.slice(0, 3));
  
  // Check for any lines with numbers in the range 426-440
  const criticalRangeLines = lines.filter(line => {
    const firstField = line.split(/[,;\t]/)[0].trim();
    const num = parseInt(firstField, 10);
    return !isNaN(num) && num >= 426 && num <= 440;
  });
  
  // Check for alphanumeric sticker numbers (like L1-L20)
  const alphanumericLines = lines.filter(line => {
    const firstField = line.split(/[,;\t]/)[0].trim();
    return /^[A-Za-z]/.test(firstField);
  });
  
  if (criticalRangeLines.length > 0) {
    console.log(`Found ${criticalRangeLines.length} lines with numbers in range 426-440:`, criticalRangeLines);
  }
  
  if (alphanumericLines.length > 0) {
    console.log(`Found ${alphanumericLines.length} lines with alphanumeric numbers:`, alphanumericLines);
  }
  
  // Detect delimiter - try tabs, commas, and semicolons
  const delimiter = detectDelimiter(lines[0]);
  console.log(`Detected delimiter: "${delimiter}"`);
  
  // Check if first line is a header
  const isFirstLineHeader = isHeaderLine(lines[0]);
  console.log(`First line appears to be a header: ${isFirstLineHeader}`);
  
  // Skip header line if detected
  const dataLines = isFirstLineHeader ? lines.slice(1) : lines;
  console.log(`Processing ${dataLines.length} data lines`);
  
  // Parse each data line (with progress logging for large files)
  const result: ParsedCsvRow[] = [];
  const totalLines = dataLines.length;
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    
    // Log progress for large files
    if (totalLines > 200 && i % 100 === 0) {
      console.log(`Parsing progress: ${i}/${totalLines} lines (${Math.round(i/totalLines*100)}%)`);
    }
    
    // Split the line by the delimiter
    const fields = line.split(delimiter).map(field => field.trim());
    
    if (fields.length < 1) {
      console.log(`Skipping line ${i + 1} - not enough fields`);
      continue;
    }
    
    // Extract fields - allow flexible field order
    const [numberStr, name = "", team = ""] = fields;
    if (!numberStr) {
      console.log(`Skipping line ${i + 1} - missing number`);
      continue;
    }
    
    // Check if the number contains any non-numeric characters
    const isAlphanumeric = /[^0-9]/.test(numberStr);
    
    // If the number contains letters, keep it as a string, otherwise parse as number
    const parsedNumber = isAlphanumeric 
      ? numberStr.trim() // Keep alphanumeric as string and ensure it's trimmed
      : parseNumberField(numberStr);
    
    // Extra logging for critical ranges
    if (typeof parsedNumber === 'number' && parsedNumber >= 426 && parsedNumber <= 440) {
      console.log(`Parsed critical range sticker: #${parsedNumber} - ${name} (${team})`);
    }
    
    if (typeof parsedNumber === 'string' && /^[A-Za-z]/.test(parsedNumber)) {
      console.log(`Parsed alphanumeric sticker: #${parsedNumber} - ${name} (${team})`);
    }
    
    // Create parsed row object
    const parsedRow: ParsedCsvRow = {
      number: parsedNumber,
      name: name || `Sticker ${numberStr}`,
      team: team || 'Unknown',
    };
    
    result.push(parsedRow);
  }
  
  // Additional check for critical range stickers in the final result
  const criticalRangeStickers = result.filter(row => {
    if (typeof row.number === 'number') {
      return row.number >= 426 && row.number <= 440;
    }
    return false;
  });
  
  const alphanumericStickers = result.filter(row => 
    typeof row.number === 'string' && /^[A-Za-z]/.test(row.number.toString())
  );
  
  if (criticalRangeStickers.length > 0) {
    console.log(`Final result contains ${criticalRangeStickers.length} stickers in range 426-440:`, criticalRangeStickers);
  }
  
  if (alphanumericStickers.length > 0) {
    console.log(`Final result contains ${alphanumericStickers.length} alphanumeric stickers:`, alphanumericStickers);
  }
  
  console.log(`Successfully parsed ${result.length} rows`);
  console.log(`Sample of parsed data:`, result.slice(0, 5));
  console.timeEnd("CSV parsing time");
  
  return result;
};

// Helper to detect the most likely delimiter in a CSV line
function detectDelimiter(line: string): string {
  if (!line) return ',';
  
  const delimiters = ['\t', ',', ';'];
  let maxCount = 0;
  let bestDelimiter = ','; // Default
  
  for (const delimiter of delimiters) {
    const count = (line.match(new RegExp(delimiter, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }
  
  return bestDelimiter;
}

// Check if a line appears to be a header by looking for common header words
function isHeaderLine(line: string): boolean {
  const headerKeywords = [
    'מספר', 'number', 'name', 'שם', 'team', 'קבוצה', 'סדרה',
    'category', 'קטגוריה', 'sticker', 'מדבקה', 'id'
  ];
  
  const lowerLine = line.toLowerCase();
  return headerKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()));
}

// Helper to parse number fields safely
function parseNumberField(value: string): number | string {
  if (!value) return 0;
  
  // If it contains any non-numeric characters, return as-is
  if (/[^0-9.-]/.test(value)) {
    return value;
  }
  
  // Otherwise, parse as number
  const cleanValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseInt(cleanValue, 10);
  
  return isNaN(parsed) ? value : parsed;
}
