
export type CSVData = Array<[number, string, string]>;

/**
 * Parse CSV content into structured data
 */
export const parseCSVContent = (fileContent: string): {
  parsedData: CSVData,
  newTeams: string[],
  existingTeams: Set<string>
} => {
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  // Check if the first line looks like a header
  const firstLine = lines[0];
  const isHeader = firstLine && 
    (firstLine.toLowerCase().includes('מספר') || 
      firstLine.toLowerCase().includes('number') ||
      firstLine.toLowerCase().includes('שם') ||
      firstLine.toLowerCase().includes('name') ||
      firstLine.toLowerCase().includes('קבוצה') ||
      firstLine.toLowerCase().includes('team'));
  
  // Skip the header line if detected
  const dataLines = isHeader ? lines.slice(1) : lines;
  
  if (dataLines.length === 0) {
    throw new Error("הקובץ ריק או מכיל רק כותרות");
  }
  
  const parsedCsvData = dataLines.map(line => {
    const [numberStr, name, team] = line.split(',').map(item => item.trim());
    const number = parseInt(numberStr);
    
    if (isNaN(number) || !name || !team) {
      throw new Error(`שורה לא תקינה: ${line}`);
    }
    
    return [number, name, team] as [number, string, string];
  });

  return {
    parsedData: parsedCsvData,
    newTeams: [],
    existingTeams: new Set()
  };
};

/**
 * Reads a file and returns its content as a string Promise
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("קריאת הקובץ נכשלה"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("לא ניתן לקרוא את הקובץ, אנא ודא שהקובץ תקין ויש לך הרשאות לקרוא אותו"));
    };
    
    reader.readAsText(file);
  });
};
