/**
 * Memory optimization utilities
 * Disables console logging in production to reduce memory usage
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
  };

  // Override console methods in production (keep error for critical issues)
  const noop = () => {};
  
  // Only disable non-critical logging methods
  // Keep console.error for actual error reporting
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  
  // Keep console.warn and console.error for production debugging if needed
  // But reduce their verbosity
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    // Only log warnings in production if they're critical
    // Most warnings can be suppressed
    if (args[0]?.toString().includes('CRITICAL') || args[0]?.toString().includes('ERROR')) {
      originalWarn(...args);
    }
  };
}

/**
 * Clean up large objects from memory
 */
export function cleanupLargeObject<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // If it's an array, limit its size
  if (Array.isArray(obj)) {
    const maxSize = 1000; // Limit arrays to 1000 items
    if (obj.length > maxSize) {
      return obj.slice(0, maxSize) as T;
    }
  }

  return obj;
}

/**
 * Clear old cache entries
 */
export function clearOldCacheEntries(cache: Map<string, any>, maxAge: number = 3600000): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (value.timestamp && now - value.timestamp > maxAge) {
      cache.delete(key);
    }
  }
}

/**
 * Limit cache size
 */
export function limitCacheSize(cache: Map<string, any>, maxSize: number = 100): void {
  if (cache.size > maxSize) {
    const entries = Array.from(cache.entries());
    // Remove oldest entries
    entries.sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
    const toRemove = entries.slice(0, cache.size - maxSize);
    toRemove.forEach(([key]) => cache.delete(key));
  }
}
