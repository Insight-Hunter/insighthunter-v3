// workers/analytics/cache.js
// KV caching utilities for performance optimization

/**

- Get data from cache or compute it if not cached
- @param {KVNamespace} cache - The KV namespace binding
- @param {string} key - Cache key
- @param {Function} computeFn - Async function to compute the value if not cached
- @param {number} ttl - Time to live in seconds (default 1 hour)
- @returns {Promise<Object>} The cached or computed result
  */
  export async function getCachedOrCompute(cache, key, computeFn, ttl = 3600) {
  try {
  // Try to get from cache first
  const cached = await cache.get(key, "json");
  
  if (cached) {
  return { ...cached, fromCache: true };
  }
  } catch (error) {
  console.error("Cache read error:", error);
  // Continue to compute if cache read fails
  }

// Not in cache or cache error, compute it
const result = await computeFn();

try {
// Store in cache with TTL (time to live in seconds)
await cache.put(key, JSON.stringify(result), {
expirationTtl: ttl
});
} catch (error) {
console.error("Cache write error:", error);
// Continue even if cache write fails
}

return { ...result, fromCache: false };
}

/**

- Invalidate cache entries matching a pattern
- Note: KV doesn"t support pattern-based deletion natively,
- so you"d need to track keys separately for bulk invalidation
- @param {KVNamespace} cache - The KV namespace binding
- @param {string} key - Exact key to delete
  */
  export async function invalidateCache(cache, key) {
  try {
  await cache.delete(key);
  } catch (error) {
  console.error("Cache invalidation error:", error);
  }
  }

/**

- Generate a cache key for dashboard data
- @param {number} userId - User ID
- @param {number|null} clientId - Optional client ID
- @returns {string} Cache key
  */
  export function getDashboardCacheKey(userId, clientId) {
  return `dashboard:${userId}:${clientId || 'none'}`;
  }

/**

- Generate a cache key for forecast data
- @param {number} userId - User ID
- @param {number|null} clientId - Optional client ID
- @param {string} timeRange - Time range parameter
- @returns {string} Cache key
  */
  export function getForecastCacheKey(userId, clientId, timeRange) {
  return `forecast:${userId}:${clientId || 'none'}:${timeRange}`;
  }

/**

- Generate a cache key for insights
- @param {number} userId - User ID
- @param {number|null} clientId - Optional client ID
- @returns {string} Cache key
  */
  export function getInsightsCacheKey(userId, clientId) {
  return `insights:${userId}:${clientId || 'none'}`;
  }

/**

- Invalidate all cache entries for a user after data changes
- @param {KVNamespace} cache - KV namespace
- @param {number} userId - User ID
- @param {number|null} clientId - Optional client ID
  */
  export async function invalidateUserCache(cache, userId, clientId) {
  // When a user uploads new data, invalidate their cached analytics
  const keysToInvalidate = [
  getDashboardCacheKey(userId, clientId),
  getInsightsCacheKey(userId, clientId),
  getForecastCacheKey(userId, clientId, "30days"),
  getForecastCacheKey(userId, clientId, "90days"),
  getForecastCacheKey(userId, clientId, "180days"),
  getForecastCacheKey(userId, clientId, "1year")
  ];

await Promise.all(
keysToInvalidate.map(key => invalidateCache(cache, key))
);
}
