
// Export CSV import functions
import { importStickersFromCSV as importFunc } from './importStickersFromCSV';

export const importStickersFromCSV = async (
  albumId: string, 
  data: [number | string, string, string][]
): Promise<any[]> => {
  return importFunc(albumId, data);
};
