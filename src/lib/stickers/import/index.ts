
// Export CSV import functions
export const importStickersFromCSV = async (
  albumId: string, 
  data: [number | string, string, string][]
): Promise<any[]> => {
  // Import dynamically to reduce initial bundle size
  const { importStickersFromCSV: importFunc } = await import('../../data');
  return importFunc(albumId, data);
};

