
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
  isDeleted?: boolean; // Add soft delete field
  lastModified?: number; // Add modification timestamp
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: string;
  totalStickers: number;
  coverImage?: string;
  isDeleted?: boolean; // Add soft delete field
  lastModified?: number; // Add modification timestamp
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
  location?: string;
  phone?: string;
  isDeleted?: boolean; // Add soft delete field
  lastModified?: number; // Add modification timestamp
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
  isDeleted?: boolean; // Add soft delete field
  lastModified?: number; // Add modification timestamp
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// Add these type definitions to help with TypeScript type checking
export type AlbumTableItem = Album;
export type StickerTableItem = Sticker;
export type ExchangeOfferTableItem = ExchangeOffer;
export type UserTableItem = User;

export type TableName = 'albums' | 'stickers' | 'exchange_offers' | 'users';

export type TableItems = {
  'albums': AlbumTableItem;
  'stickers': StickerTableItem;
  'exchange_offers': ExchangeOfferTableItem;
  'users': UserTableItem;
};

// Type guards for type checking in the saveBatch function
export function isAlbum(item: any): item is Album {
  return 'totalStickers' in item && 'name' in item;
}

export function isSticker(item: any): item is Sticker {
  return 'albumId' in item && 'team' in item && 'number' in item;
}

export function isExchangeOffer(item: any): item is ExchangeOffer {
  return 'offeredStickerId' in item && 'wantedStickerId' in item;
}

export function isUser(item: any): item is User {
  return 'stickerCount' in item;
}
