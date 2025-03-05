import { Sticker } from './types';
import { stickers as initialStickers } from './initial-data';
import { saveToStorage } from './sync-manager';

// Maintain data state
export let stickerData = [...initialStickers];

export const setStickerData = (data: Sticker[]) => {
  stickerData = data;
  // Save to localStorage whenever data changes
  saveToStorage('stickers', stickerData);
};

export const getStickersByAlbumId = (albumId: string) => {
  return stickerData.filter(sticker => sticker.albumId === albumId);
};

export const addSticker = (sticker: Omit<Sticker, "id">) => {
  const newSticker = {
    ...sticker,
    id: `sticker${stickerData.length + 1}`
  };
  setStickerData([...stickerData, newSticker]);
  return newSticker;
};

export const updateSticker = (id: string, data: Partial<Sticker>) => {
  // Check if team name is being updated
  const originalSticker = stickerData.find(sticker => sticker.id === id);
  const isTeamNameChanging = originalSticker && data.team && originalSticker.team !== data.team;
  
  // If team name is changing, update all stickers from the same team
  if (isTeamNameChanging && originalSticker) {
    const oldTeamName = originalSticker.team;
    const newTeamName = data.team as string;
    const newTeamLogo = data.teamLogo;
    
    // Update all stickers from this team
    updateTeamNameAcrossStickers(oldTeamName, newTeamName, newTeamLogo);
  }
  
  // Regular update for the current sticker
  setStickerData(stickerData.map(sticker => 
    sticker.id === id ? { ...sticker, ...data } : sticker
  ));
  
  return stickerData.find(sticker => sticker.id === id);
};

export const deleteSticker = (id: string) => {
  setStickerData(stickerData.filter(sticker => sticker.id !== id));
};

export const toggleStickerOwned = (id: string) => {
  return updateSticker(id, { 
    isOwned: !stickerData.find(s => s.id === id)?.isOwned 
  });
};

export const toggleStickerDuplicate = (id: string) => {
  return updateSticker(id, { 
    isDuplicate: !stickerData.find(s => s.id === id)?.isDuplicate 
  });
};

export const updateTeamNameAcrossStickers = (oldTeamName: string, newTeamName: string, newLogo?: string) => {
  const stickersToUpdate = stickerData.filter(s => s.team === oldTeamName);
  
  setStickerData(stickerData.map(sticker => {
    if (sticker.team === oldTeamName) {
      return {
        ...sticker,
        team: newTeamName,
        teamLogo: newLogo || sticker.teamLogo
      };
    }
    return sticker;
  }));
  
  return stickersToUpdate.length;
};

export const importStickersFromCSV = (albumId: string, csvData: Array<[number, string, string]>) => {
  const newStickers = csvData.map(([number, name, team], index) => ({
    id: `sticker${stickerData.length + index + 1}`,
    number,
    name,
    team,
    category: "שחקנים", // ברירת מחדל
    isOwned: false,
    isDuplicate: false,
    duplicateCount: 0,
    albumId
  }));
  
  setStickerData([...stickerData, ...newStickers]);
  return newStickers;
};

// New function to handle adding stickers to inventory
export const addStickersToInventory = (albumId: string, stickerNumbers: number[]) => {
  const results = {
    newlyOwned: 0,
    alreadyOwned: 0,
    notFound: 0,
    duplicatesUpdated: 0
  };
  
  stickerNumbers.forEach(number => {
    // Find sticker in the selected album
    const sticker = stickerData.find(s => s.albumId === albumId && s.number === number);
    
    if (!sticker) {
      results.notFound++;
      return;
    }
    
    if (sticker.isOwned) {
      // Sticker already owned - increment duplicate count
      updateSticker(sticker.id, { 
        isDuplicate: true, 
        duplicateCount: (sticker.duplicateCount || 0) + 1 
      });
      results.duplicatesUpdated++;
      results.alreadyOwned++;
    } else {
      // New sticker - mark as owned
      updateSticker(sticker.id, { isOwned: true });
      results.newlyOwned++;
    }
  });
  
  return results;
};

export const getStats = (albumId?: string) => {
  const filteredStickers = albumId 
    ? stickerData.filter(s => s.albumId === albumId)
    : stickerData;
    
  return {
    total: filteredStickers.length,
    owned: filteredStickers.filter(s => s.isOwned).length,
    needed: filteredStickers.filter(s => !s.isOwned).length,
    duplicates: filteredStickers.filter(s => s.isDuplicate).length
  };
};

// Get stickers that are in a transaction (Mock implementation)
// This would be replaced with actual transaction data in a real app
export const getStickerTransactions = () => {
  // This is just a mock - in a real app, this would fetch from your transaction store
  return {
    "sticker3": { person: "דני", color: "bg-purple-100 border-purple-300" },
    "sticker7": { person: "יוסי", color: "bg-blue-100 border-blue-300" },
    "sticker15": { person: "רותי", color: "bg-pink-100 border-pink-300" },
  };
};

// New function to get duplicate count for a sticker
export const getStickerDuplicateCount = (stickerId: string) => {
  const sticker = stickerData.find(s => s.id === stickerId);
  return sticker?.duplicateCount || 0;
};
