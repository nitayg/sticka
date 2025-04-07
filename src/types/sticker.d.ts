
import { Sticker as BaseSticker } from "@/lib/types";

declare global {
  interface StickerWithAlbumName extends BaseSticker {
    albumName?: string;
  }
}

export {};
