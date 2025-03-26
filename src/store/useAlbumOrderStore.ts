
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
        const newOrder = [...state.orderedAlbumIds];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);
        
        return { orderedAlbumIds: newOrder };
      }),
      
      toggleEditMode: () => set((state) => ({ 
        isEditModeActive: !state.isEditModeActive 
      })),
      
      setEditMode: (active) => set({ isEditModeActive: active }),
      
      initializeOrder: () => {
        const { orderedAlbumIds } = get();
        const allAlbums = getAllAlbums();
        
        // If we already have ordered IDs, make sure they include all current albums
        if (orderedAlbumIds.length > 0) {
          const currentAlbumIds = allAlbums.map(album => album.id);
          
          // Find new albums that aren't in our ordered list
          const newAlbumIds = currentAlbumIds.filter(
            id => !orderedAlbumIds.includes(id)
          );
          
          // Filter out deleted albums that are still in our order
          const validOrderedIds = orderedAlbumIds.filter(
            id => currentAlbumIds.includes(id)
          );
          
          // If we have any changes, update the order
          if (newAlbumIds.length > 0 || validOrderedIds.length !== orderedAlbumIds.length) {
            set({ orderedAlbumIds: [...validOrderedIds, ...newAlbumIds] });
          }
        } else {
          // Initialize with current album order
          set({ orderedAlbumIds: allAlbums.map(album => album.id) });
        }
      }
    }),
    {
      name: 'album-order-storage',
    }
  )
);
