
import { Album } from './types';
import { v4 as uuidv4 } from 'uuid';
import { saveToStorage, getFromStorage, StorageEvents } from './sync';
import { toast } from '@/components/ui/use-toast';
import { supabase } from './supabase';
import { saveAlbum, deleteAlbumFromSupabase } from './supabase/albums';
import { deleteStickersByAlbumId } from './sticker-operations';

// Storage for albums data
let albumsData: Album[] = [];

// Function to set album data (used when data is updated from another tab)
export const setAlbumData = (albums: Album[]) => {
  albumsData = albums;
  saveToStorage('albums', albums);
  
  // Dispatch the storage event for other tabs to pick up
  const event = new CustomEvent(StorageEvents.ALBUMS, { detail: albums });
  window.dispatchEvent(event);
};

// Function to get album data
export const getAlbumData = () => {
  if (albumsData.length === 0) {
    albumsData = getFromStorage<Album[]>('albums', []);
  }
  return albumsData;
};

// Function to add a new album
export const addAlbum = async (albumData: Omit<Album, 'lastModified'>): Promise<Album> => {
  const album: Album = {
    ...albumData,
    lastModified: Date.now(),
    isDeleted: false
  };

  const albums = getAlbumData();
  const updatedAlbums = [...albums, album];
  setAlbumData(updatedAlbums);
  
  try {
    await saveAlbum(album);
  } catch (error) {
    console.error('Error saving album to Supabase:', error);
  }
  
  return album;
};

// Function to update an existing album
export const updateAlbum = (albumId: string, updates: Partial<Album>): Album | undefined => {
  const albums = getAlbumData();
  let updatedAlbum: Album | undefined;
  
  const updatedAlbums = albums.map(album => {
    if (album.id === albumId) {
      updatedAlbum = { ...album, ...updates, lastModified: Date.now() };
      return updatedAlbum;
    }
    return album;
  });
  
  setAlbumData(updatedAlbums);
  
  // Save the updated album to Supabase
  if (updatedAlbum) {
    saveAlbum(updatedAlbum).catch(error => {
      console.error('Error updating album in Supabase:', error);
    });
  }
  
  return updatedAlbum;
};

// Function to delete an album - completely rewritten to fix Supabase deletion issues
export const deleteAlbum = async (albumId: string): Promise<void> => {
  console.log('Deleting album with ID:', albumId);
  
  try {
    // 1. First mark as deleted in local storage
    const albums = getAlbumData();
    const album = albums.find(a => a.id === albumId);
    
    if (!album) {
      console.error('Album not found for deletion:', albumId);
      return;
    }
    
    // 2. Delete stickers associated with this album
    await deleteStickersByAlbumId(albumId);
    
    // 3. Delete from Supabase
    const success = await deleteAlbumFromSupabase(albumId);
    if (!success) {
      console.error('Failed to delete album from Supabase');
      toast({
        title: "שגיאה במחיקת האלבום",
        description: "אירעה שגיאה במחיקת האלבום מהשרת. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      return;
    }
    
    // 4. Remove from local array only after Supabase deletion succeeded
    const updatedAlbums = albums.filter(album => album.id !== albumId);
    setAlbumData(updatedAlbums);
    
    console.log('Album deleted successfully from both local storage and Supabase');
    
    // 5. Dispatch an event to notify components about the deletion
    window.dispatchEvent(new CustomEvent('albumDeleted', { detail: { albumId } }));
    
  } catch (error) {
    console.error('Error deleting album:', error);
    toast({
      title: "שגיאה במחיקת האלבום",
      description: "אירעה שגיאה במחיקת האלבום. נסה שוב מאוחר יותר.",
      variant: "destructive",
    });
  }
};

// Function to get album by ID
export const getAlbumById = (albumId: string): Album | undefined => {
  const albums = getAlbumData();
  return albums.find(album => album.id === albumId);
};

// Function to restore a deleted album
export const restoreAlbum = (albumId: string): Album | undefined => {
  const albums = getAlbumData();
  let restoredAlbum: Album | undefined;
  
  const updatedAlbums = albums.map(album => {
    if (album.id === albumId) {
      restoredAlbum = { ...album, isDeleted: false, lastModified: Date.now() };
      return restoredAlbum;
    }
    return album;
  });
  
  setAlbumData(updatedAlbums);
  
  // Save the restored album to Supabase
  if (restoredAlbum) {
    saveAlbum(restoredAlbum).catch(error => {
      console.error('Error restoring album in Supabase:', error);
    });
  }
  
  return restoredAlbum;
};
