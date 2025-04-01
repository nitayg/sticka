export interface ParsedCsvRow {
  number: number | string;
  name: string;
  team: string;
}

export const parseCSV = (csvContent: string): ParsedCsvRow[] => {
  if (!csvContent) return [];
  
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
  
  // Detect delimiter - try tabs, commas, and semicolons
  let delimiter = detectDelimiter(lines[0]);
  console.log(`Detected delimiter: "${delimiter}"`);
  
  // Check if first line is a header
  const isFirstLineHeader = isHeaderLine(lines[0]);
  console.log(`First line appears to be a header: ${isFirstLineHeader}`);
  
  // Skip header line if detected
  const dataLines = isFirstLineHeader ? lines.slice(1) : lines;
  
  // Parse each data line
  return dataLines.map((line, index) => {
    // Split the line by the delimiter
    const fields = line.split(delimiter).map(field => field.trim());
    
    if (fields.length < 1) {
      console.log(`Skipping line ${index + 1} - not enough fields`);
      return null;
    }
    
    // Extract fields - allow flexible field order
    const [numberStr, name, team] = fields;
    
    // Check if the number contains any non-numeric characters
    const isAlphanumeric = numberStr ? /[^0-9]/.test(numberStr) : false;
    
    // If the number contains letters, keep it as a string, otherwise parse as number
    const parsedNumber = isAlphanumeric 
      ? numberStr // Keep alphanumeric as string
      : parseNumberField(numberStr);
    
    // If we're returning an object format
    const result: ParsedCsvRow = {
      number: parsedNumber,
      name: name || `Sticker ${numberStr}`,
      team: team || 'Unknown',
    };
    
    console.log(`Parsed line ${index + 1}:`, result);
    
    return result;
  }).filter(Boolean) as ParsedCsvRow[]; // Filter out null entries
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
  
  // Don't strip letters - this was causing the issue
  // Clean the string value first - keep it as-is if it contains letters
  if (/[a-zA-Z]/.test(value)) {
    return value;
  }
  
  // Otherwise, parse as number
  const cleanValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseInt(cleanValue, 10);
  
  return isNaN(parsed) ? value : parsed;
}
