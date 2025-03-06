
-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coverImage TEXT,
    totalStickers INTEGER,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT,
    year TEXT,
    publisher TEXT,
    isInRecycleBin BOOLEAN DEFAULT FALSE,
    deletedAt TIMESTAMP WITH TIME ZONE
);

-- Create stickers table
CREATE TABLE IF NOT EXISTS public.stickers (
    id TEXT PRIMARY KEY,
    albumId TEXT NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    team TEXT,
    teamLogo TEXT,
    category TEXT,
    imageUrl TEXT,
    isOwned BOOLEAN DEFAULT FALSE,
    isDuplicate BOOLEAN DEFAULT FALSE,
    duplicateCount INTEGER DEFAULT 0,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phoneNumber TEXT,
    avatar TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exchange_offers table
CREATE TABLE IF NOT EXISTS public.exchange_offers (
    id TEXT PRIMARY KEY,
    albumId TEXT NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    userId TEXT,
    userName TEXT NOT NULL,
    userPhone TEXT,
    userEmail TEXT,
    wantedStickerId TEXT[] NOT NULL,
    offeredStickerId TEXT[] NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    color TEXT
);

-- Create RLS policies
-- Enable RLS on all tables
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_offers ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (you can restrict these later)
CREATE POLICY "Allow all for albums" ON public.albums FOR ALL USING (true);
CREATE POLICY "Allow all for stickers" ON public.stickers FOR ALL USING (true);
CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all for exchange_offers" ON public.exchange_offers FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_stickers_albumid ON public.stickers(albumId);
CREATE INDEX idx_exchange_offers_albumid ON public.exchange_offers(albumId);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.albums;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stickers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_offers;
