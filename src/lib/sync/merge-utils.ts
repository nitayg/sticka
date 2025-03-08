// Merge data from remote and local sources
export const mergeData = <T extends { id: string; lastModified?: number; isDeleted?: boolean }>(
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
    if (!localItem || remoteLastModified > localLastModified) {
      mergedMap.set(remoteItem.id, { ...remoteItem });
    } else if (remoteItem.isDeleted && !localItem.isDeleted && remoteLastModified >= localLastModified) {
      // If remote is deleted and local is not, and remote is at least as recent, use remote (keep it deleted)
      mergedMap.set(remoteItem.id, { ...remoteItem });
    } else if (localItem.isDeleted && !remoteItem.isDeleted && localLastModified > remoteLastModified) {
      // If local is deleted and remote is not, and local is more recent, keep it deleted
      mergedMap.set(remoteItem.id, { ...localItem });
    }
  });
  
  return Array.from(mergedMap.values());
};
