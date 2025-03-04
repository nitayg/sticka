
import { Album, Sticker, User, ExchangeOffer } from './types';

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
    teamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/Argentina_national_football_team_logo.svg/800px-Argentina_national_football_team_logo.svg.png",
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
    teamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Portuguese_Football_Federation.svg/1200px-Portuguese_Football_Federation.svg.png",
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
    teamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/France_national_football_team_seal.svg/1200px-France_national_football_team_seal.svg.png",
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
    teamLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/England_national_football_team_crest.svg/800px-England_national_football_team_crest.svg.png",
    category: "שחקנים",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 10,
    isOwned: true,
    isDuplicate: true,
    albumId: "album2"
  }
];

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

export const exchangeOffers: ExchangeOffer[] = [
  {
    id: "e1",
    userId: "u1",
    userName: "אלכס כהן",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    offeredStickerId: ["1"],  // Changed from string to string array
    offeredStickerName: "ליונל מסי",
    wantedStickerId: ["3"],   // Changed from string to string array
    wantedStickerName: "קיליאן אמבפה",
    status: "pending",
    albumId: "album1"
  }
];
