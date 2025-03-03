
export interface Sticker {
  id: string;
  name: string;
  team: string;
  category: string;
  imageUrl?: string;
  number: number;
  isOwned: boolean;
  isDuplicate: boolean;
  albumId: string; // הוספת שדה שיוך לאלבום
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: string;
  totalStickers: number;
  coverImage?: string;
}

export const albums: Album[] = [
  {
    id: "album1",
    name: "מונדיאל 2022",
    description: "אלבום מדבקות מונדיאל קטאר 2022",
    year: "2022",
    totalStickers: 250,
    coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "album2",
    name: "יורו 2024",
    description: "אלבום מדבקות יורו 2024",
    year: "2024",
    totalStickers: 300,
    coverImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop"
  }
];

export const stickers: Sticker[] = [
  {
    id: "1",
    name: "ליונל מסי",
    team: "ארגנטינה",
    category: "שחקנים",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 10,
    isOwned: true,
    isDuplicate: true,
    albumId: "album1"
  },
  {
    id: "2",
    name: "כריסטיאנו רונאלדו",
    team: "פורטוגל",
    category: "שחקנים",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 7,
    isOwned: true,
    isDuplicate: false,
    albumId: "album1"
  },
  {
    id: "3",
    name: "קיליאן אמבפה",
    team: "צרפת",
    category: "שחקנים",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 9,
    isOwned: false,
    isDuplicate: false,
    albumId: "album1"
  },
  {
    id: "4",
    name: "ג׳וד בלינגהאם",
    team: "אנגליה",
    category: "שחקנים",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 10,
    isOwned: true,
    isDuplicate: true,
    albumId: "album2"
  }
];

export interface User {
  id: string;
  name: string;
  avatar?: string;
  stickerCount: {
    total: number;
    owned: number;
    needed: number;
    duplicates: number;
  };
}

export const users: User[] = [
  {
    id: "u1",
    name: "אלכס כהן",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    stickerCount: {
      total: 250,
      owned: 180,
      needed: 70,
      duplicates: 45
    }
  }
];

export interface ExchangeOffer {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  offeredStickerId: string;
  offeredStickerName: string;
  wantedStickerId: string;
  wantedStickerName: string;
  status: "pending" | "accepted" | "declined";
}

export const exchangeOffers: ExchangeOffer[] = [
  {
    id: "e1",
    userId: "u1",
    userName: "אלכס כהן",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    offeredStickerId: "1",
    offeredStickerName: "ליונל מסי",
    wantedStickerId: "3",
    wantedStickerName: "קיליאן אמבפה",
    status: "pending"
  }
];

// פונקציות ניהול נתונים
let stickerData = [...stickers];
let albumData = [...albums];

export const getAllAlbums = () => {
  return albumData;
};

export const getAlbumById = (id: string) => {
  return albumData.find(album => album.id === id);
};

export const getStickersByAlbumId = (albumId: string) => {
  return stickerData.filter(sticker => sticker.albumId === albumId);
};

export const addAlbum = (album: Omit<Album, "id">) => {
  const newAlbum = {
    ...album,
    id: `album${albumData.length + 1}`
  };
  albumData = [...albumData, newAlbum];
  return newAlbum;
};

export const updateAlbum = (id: string, data: Partial<Album>) => {
  albumData = albumData.map(album => 
    album.id === id ? { ...album, ...data } : album
  );
  return albumData.find(album => album.id === id);
};

export const deleteAlbum = (id: string) => {
  albumData = albumData.filter(album => album.id !== id);
  // מחיקת כל המדבקות השייכות לאלבום זה
  stickerData = stickerData.filter(sticker => sticker.albumId !== id);
};

export const addSticker = (sticker: Omit<Sticker, "id">) => {
  const newSticker = {
    ...sticker,
    id: `sticker${stickerData.length + 1}`
  };
  stickerData = [...stickerData, newSticker];
  return newSticker;
};

export const updateSticker = (id: string, data: Partial<Sticker>) => {
  stickerData = stickerData.map(sticker => 
    sticker.id === id ? { ...sticker, ...data } : sticker
  );
  return stickerData.find(sticker => sticker.id === id);
};

export const deleteSticker = (id: string) => {
  stickerData = stickerData.filter(sticker => sticker.id !== id);
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

export const importStickersFromCSV = (albumId: string, csvData: Array<[number, string, string]>) => {
  const newStickers = csvData.map(([number, name, team], index) => ({
    id: `sticker${stickerData.length + index + 1}`,
    number,
    name,
    team,
    category: "שחקנים", // ברירת מחדל
    isOwned: false,
    isDuplicate: false,
    albumId
  }));
  
  stickerData = [...stickerData, ...newStickers];
  return newStickers;
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
