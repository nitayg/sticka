
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllAlbums } from '@/lib/data';

interface AlbumOrderState {
  // The ordered list of album IDs
  orderedAlbumIds: string[];
  
  // UI state
  isEditModeActive: boolean;
  
  // Actions
  setOrderedAlbumIds: (albumIds: string[]) => void;
  reorderAlbum: (fromIndex: number, toIndex: number) => void;
  toggleEditMode: () => void;
  setEditMode: (active: boolean) => void;
  
  // Initialization
  initializeOrder: () => void;
}

export const useAlbumOrderStore = create<AlbumOrderState>()(
  persist(
    (set, get) => ({
      orderedAlbumIds: [],
      isEditModeActive: false,
      
      setOrderedAlbumIds: (albumIds) => set({ orderedAlbumIds: albumIds }),
      
      reorderAlbum: (fromIndex, toIndex) => set((state) => {
        // Get a copy of the current ordered album IDs
        const newOrder = [...state.orderedAlbumIds];
        
        // Perform the reordering using array splice
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        
        console.log(`Reordering album from index ${fromIndex} to ${toIndex}`, {
          movedItem,
          oldOrder: state.orderedAlbumIds,
          newOrder
        });
        
        // Update the state with the new order
        return { orderedAlbumIds: newOrder };
      }),
      
      toggleEditMode: () => set((state) => ({ 
        isEditModeActive: !state.isEditModeActive 
      })),
      
      setEditMode: (active) => set({ isEditModeActive: active }),
      
      initializeOrder: () => {
        const { orderedAlbumIds } = get();
        const allAlbums = getAllAlbums();
        const allAlbumIds = allAlbums.map(album => album.id);
        
        console.log("Initializing album order", {
          currentOrderedIds: orderedAlbumIds,
          allAlbumIds
        });
        
        // If we already have ordered IDs, make sure they include all current albums
        if (orderedAlbumIds.length > 0) {
          // Find new albums that aren't in our ordered list
          const newAlbumIds = allAlbumIds.filter(
            id => !orderedAlbumIds.includes(id)
          );
          
          // Filter out deleted albums that are still in our order
          const validOrderedIds = orderedAlbumIds.filter(
            id => allAlbumIds.includes(id)
          );
          
          // If we have any changes, update the order
          if (newAlbumIds.length > 0 || validOrderedIds.length !== orderedAlbumIds.length) {
            const newOrderedIds = [...validOrderedIds, ...newAlbumIds];
            console.log("Updating album order", {
              validOrderedIds,
              newAlbumIds,
              newOrderedIds
            });
            set({ orderedAlbumIds: newOrderedIds });
          }
        } else {
          // Initialize with current album order
          console.log("Setting initial album order", allAlbumIds);
          set({ orderedAlbumIds: allAlbumIds });
        }
      }
    }),
    {
      name: 'album-order-storage',
    }
  )
);
