
export interface Sticker {
  id: string;
  name: string;
  team: string;
  category: string;
  imageUrl?: string;
  number: number;
  isOwned: boolean;
  isDuplicate: boolean;
  albumId: string;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: string;
  totalStickers: number;
  coverImage?: string;
}

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
