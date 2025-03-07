
import { LucideIcon } from "lucide-react";

export interface Sticker {
  id: string;
  name: string;
  team: string;
  teamLogo?: string; // Add team logo URL field
  category: string;
  imageUrl?: string;
  number: number;
  isOwned: boolean;
  isDuplicate: boolean;
  duplicateCount?: number; // Add duplicate count field
  albumId: string;
  createdAt?: string; // Add createdAt field
  updatedAt?: string; // Add updatedAt field
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: string;
  totalStickers: number;
  coverImage?: string;
  createdAt?: string; // Add createdAt field
  updatedAt?: string; // Add updatedAt field
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
  totalStickers?: number; // Add totalStickers field
  duplicateStickers?: number; // Add duplicateStickers field
  completionPercentage?: number; // Add completionPercentage field
  location?: string;
  phone?: string;
  createdAt?: string; // Add createdAt field
  updatedAt?: string; // Add updatedAt field
}

export interface ExchangeOffer {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  offeredStickerId: string[];
  offeredStickerName: string;
  wantedStickerId: string[];
  wantedStickerName: string;
  status: "pending" | "accepted" | "declined";
  exchangeMethod?: "pickup" | "mail" | "other";
  location?: string;
  phone?: string;
  color?: string;
  albumId: string;
  createdAt?: string; // Add createdAt field
  updatedAt?: string; // Add updatedAt field
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}
