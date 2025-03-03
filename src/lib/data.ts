
export interface Sticker {
  id: string;
  name: string;
  team: string;
  category: string;
  imageUrl?: string;
  number: number;
  isOwned: boolean;
  isDuplicate: boolean;
}

export const stickers: Sticker[] = [
  {
    id: "1",
    name: "Lionel Messi",
    team: "Inter Miami",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 10,
    isOwned: true,
    isDuplicate: true
  },
  {
    id: "2",
    name: "Cristiano Ronaldo",
    team: "Al Nassr",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 7,
    isOwned: true,
    isDuplicate: false
  },
  {
    id: "3",
    name: "Kylian Mbappé",
    team: "Real Madrid",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 9,
    isOwned: false,
    isDuplicate: false
  },
  {
    id: "4",
    name: "Erling Haaland",
    team: "Manchester City",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 9,
    isOwned: true,
    isDuplicate: true
  },
  {
    id: "5",
    name: "Robert Lewandowski",
    team: "Barcelona",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 9,
    isOwned: true,
    isDuplicate: false
  },
  {
    id: "6",
    name: "Kevin De Bruyne",
    team: "Manchester City",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 17,
    isOwned: false,
    isDuplicate: false
  },
  {
    id: "7",
    name: "Virgil van Dijk",
    team: "Liverpool",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 4,
    isOwned: true,
    isDuplicate: false
  },
  {
    id: "8",
    name: "Neymar Jr",
    team: "Al Hilal",
    category: "Players",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop",
    number: 10,
    isOwned: false,
    isDuplicate: false
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
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    stickerCount: {
      total: 250,
      owned: 180,
      needed: 70,
      duplicates: 45
    }
  },
  {
    id: "u2",
    name: "Sarah Parker",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
    stickerCount: {
      total: 250,
      owned: 200,
      needed: 50,
      duplicates: 60
    }
  },
  {
    id: "u3",
    name: "Mike Thompson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    stickerCount: {
      total: 250,
      owned: 150,
      needed: 100,
      duplicates: 30
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
    userName: "Alex Johnson",
    userAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    offeredStickerId: "1",
    offeredStickerName: "Lionel Messi",
    wantedStickerId: "3",
    wantedStickerName: "Kylian Mbappé",
    status: "pending"
  },
  {
    id: "e2",
    userId: "u2",
    userName: "Sarah Parker",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
    offeredStickerId: "8",
    offeredStickerName: "Neymar Jr",
    wantedStickerId: "4",
    wantedStickerName: "Erling Haaland",
    status: "pending"
  }
];
