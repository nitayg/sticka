
// This is a compatibility file to ease the transition to modular queries
// It re-exports all the query functions from their new locations
// This allows existing code to continue working without immediate updates

export * from './queries/album-queries';
export * from './queries/sticker-queries'; 
export * from './queries/stats-queries';

// Show deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn('[DEPRECATED] Importing from src/lib/queries.ts is deprecated and will be removed in a future version. Import directly from src/lib/queries/* instead.');
}
