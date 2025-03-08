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
    
    // If remote item is marked as deleted and is newer than local, use remote
    if (remoteItem.isDeleted && (!localItem?.isDeleted || remoteLastModified >= localLastModified)) {
      mergedMap.set(remoteItem.id, { ...remoteItem });
      return;
    }
    
    // If local item is marked as deleted and is newer than remote, keep local
    if (localItem?.isDeleted && localLastModified > remoteLastModified) {
      return; // Keep the local deleted state
    }
    
    // For non-deleted items, use the newer version
    if (!localItem || remoteLastModified > localLastModified) {
      mergedMap.set(remoteItem.id, { ...remoteItem });
    }
  });
  
  return Array.from(mergedMap.values());
};

// Helper function to mark related items as deleted
export const markRelatedItemsAsDeleted = <T extends { id: string; albumId?: string; lastModified?: number; isDeleted?: boolean }>(
  items: T[],
  albumId: string,
  timestamp: number
): T[] => {
  return items.map(item => 
    item.albumId === albumId 
      ? { ...item, isDeleted: true, lastModified: timestamp }
      : item
  );
};
