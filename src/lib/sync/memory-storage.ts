
// In-memory storage implementation to replace localStorage
// This will prevent QuotaExceededError issues when dealing with large datasets

// Main storage object for different entity types
type StorageData = {
  [key: string]: any;
};

// In-memory storage cache
const memoryStore: StorageData = {};

// Event listener registry to simulate localStorage events
const listeners: Map<string, Set<(event: CustomEvent) => void>> = new Map();

/**
 * Save data to memory storage
 */
export const saveToMemory = <T>(key: string, data: T): void => {
  memoryStore[key] = data;
  
  // Dispatch event to notify listeners
  const event = new CustomEvent(`${key}Changed`, { detail: data });
  dispatchMemoryEvent(key, event);
};

/**
 * Get data from memory storage
 */
export const getFromMemory = <T>(key: string, defaultValue: T): T => {
  return memoryStore[key] || defaultValue;
};

/**
 * Clear specific key from memory storage
 */
export const clearMemoryItem = (key: string): void => {
  delete memoryStore[key];
};

/**
 * Clear all memory storage
 */
export const clearAllMemory = (): void => {
  Object.keys(memoryStore).forEach(key => {
    delete memoryStore[key];
  });
};

/**
 * Register a listener for memory storage changes
 */
export const addMemoryEventListener = (key: string, callback: (event: CustomEvent) => void): void => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)?.add(callback);
};

/**
 * Remove a listener for memory storage changes
 */
export const removeMemoryEventListener = (key: string, callback: (event: CustomEvent) => void): void => {
  if (listeners.has(key)) {
    listeners.get(key)?.delete(callback);
  }
};

/**
 * Dispatch memory event to registered listeners
 */
const dispatchMemoryEvent = (key: string, event: CustomEvent): void => {
  if (listeners.has(key)) {
    listeners.get(key)?.forEach(callback => {
      callback(event);
    });
  }
};

/**
 * Get a summary of memory usage
 */
export const getMemoryUsage = (): Record<string, { size: number, count?: number }> => {
  const usage: Record<string, { size: number, count?: number }> = {};

  Object.entries(memoryStore).forEach(([key, value]) => {
    const serialized = JSON.stringify(value);
    usage[key] = {
      size: serialized.length,
      count: Array.isArray(value) ? value.length : undefined
    };
  });

  return usage;
};
