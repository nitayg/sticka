// Merge data from remote and local sources
export const mergeData = <T extends { id: string; lastModified?: number }>(
  localData: T[], 
  remoteData: T[]
): T[] => {
  const mergedMap = new Map<string, T>();
  
  // First add all local items to the map
  localData.forEach(item => {
    mergedMap.set(item.id, { ...item });
  });
  
  // Then process remote items - keep the newer version based on lastModified
  remoteData.forEach(remoteItem => {
    const localItem = mergedMap.get(remoteItem.id);
    const remoteLastModified = remoteItem.lastModified || 0;
    const localLastModified = localItem?.lastModified || 0;
    
    // If the remote item is newer, or if it's marked as deleted and local isn't, use remote
    if (!localItem || remoteLastModified > localLastModified || 
        ((remoteItem as any).isDeleted && !(localItem as any).isDeleted)) {
      mergedMap.set(remoteItem.id, { ...remoteItem });
    }
  });
  
  return Array.from(mergedMap.values());
};
