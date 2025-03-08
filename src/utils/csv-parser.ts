
/**
 * Parse CSV content into usable data
 * 
 * @param csvContent The CSV content as a string
 * @returns Array of objects or arrays representing the CSV data
 */
export const parseCSV = (csvContent: string): Array<any> => {
  if (!csvContent || typeof csvContent !== 'string') {
    console.error("Empty or invalid CSV content");
    return [];
  }

  // Split by lines and filter out empty ones
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    console.error("No valid lines in CSV content");
    return [];
  }

  console.log(`Parsing CSV content with ${lines.length} lines`);

  // Detect delimiter - typically comma, semicolon, or tab
  const detectDelimiter = (line: string): string => {
    const delimiters = [',', ';', '\t'];
    let bestDelimiter = ',';
    let maxCount = 0;
    
    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp(delimiter, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }
    
    return bestDelimiter;
  };

  const delimiter = detectDelimiter(lines[0]);
  console.log(`Detected delimiter: "${delimiter}"`);
  
  // Parse line function that handles quotes
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue.trim());
    
    // Ensure at least 3 elements in each row (for number, name, team)
    while (result.length < 3) {
      result.push("");
    }
    
    return result;
  };
  
  // Check if first line is a header
  const firstLine = parseLine(lines[0]);
  const secondLine = lines.length > 1 ? parseLine(lines[1]) : [];
  
  // Try to detect if the first line is a header
  // A header line typically contains text values, while data lines contain at least one number
  const isHeader = firstLine.some(item => isNaN(Number(item))) && 
                   secondLine.length > 0 && 
                   secondLine.some(item => !isNaN(Number(item)));
  
  console.log(`CSV has header: ${isHeader}`);
  
  // Process as object array if has header
  if (isHeader) {
    const headers = firstLine.map(header => 
      header.replace(/['"]/g, '').trim()
    );
    
    return lines.slice(1).map(line => {
      const values = parseLine(line);
      const rowObject: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index].replace(/['"]/g, '').trim();
          rowObject[header] = value;
        }
      });
      
      return rowObject;
    });
  } 
  // Process as array of arrays if no header
  else {
    return lines.map(line => {
      return parseLine(line).map(value => 
        value.replace(/['"]/g, '').trim()
      );
    });
  }
};
