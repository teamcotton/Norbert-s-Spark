import { Redis } from '@upstash/redis'
import type { UIMessage } from 'ai'
import { createHash } from 'crypto'
import { EnvConfig } from '../../config/env.config.js'
import type { LoggerPort } from '../../../application/ports/logger.port.js'
import { obscured } from 'obscured'

/**
 * AI response cache service using Upstash Redis
 *
 * Provides caching functionality for AI provider responses to reduce costs and improve response times.
 * Uses Redis for distributed caching across instances.
 *
 * Features:
 * - Caches AI text responses with configurable expiration
 * - Uses message history as cache key for accurate cache hits
 * - Automatically handles Redis connection errors gracefully
 *
 * @example
 * ```typescript
 * const cacheService = createCacheService(logger)
 * const cached = await cacheService.get(messages)
 * if (cached) {
 *   return cached // Return cached response
 * }
 * // ... call AI model ...
 * await cacheService.set(messages, responseText)
 * ```
 */

export interface CacheService {
  get(messages: UIMessage[]): Promise<string | null>
  set(messages: UIMessage[], text: string): Promise<void>
}

/**
 * Normalize a message by extracting only essential fields for cache key generation
 * This ensures semantically equivalent messages produce the same cache key
 *
 * @param message - The UI message to normalize
 * @returns A normalized object with only role and text content
 */
function normalizeMessage(message: UIMessage): { role: string; content: string } {
  const role = message.role

  // Extract text content from parts array
  let content = ''
  if (message.parts && Array.isArray(message.parts)) {
    content = message.parts
      .filter((part) => part.type === 'text' && 'text' in part)
      .map((part) => part.text)
      .join('')
  }

  return { role, content }
}

/**
 * Generate a deterministic cache key from messages
 * Uses normalization and hashing to ensure semantically identical messages
 * produce the same cache key regardless of property order or minor structural differences
 *
 * @param messages - Array of UI messages to generate cache key from
 * @returns A deterministic cache key string
 */
function generateCacheKey(messages: UIMessage[]): string {
  // Normalize messages to extract only essential fields
  const normalized = messages.map(normalizeMessage)

  // Create JSON with sorted keys for consistency
  // Use a replacer function to sort object keys during stringification
  const jsonStr = JSON.stringify(normalized, (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Sort object keys alphabetically for consistency
      return Object.keys(value)
        .sort()
        .reduce((sorted, k) => {
          sorted[k] = value[k]
          return sorted
        }, {} as any)
    }
    return value
  })

  // Create a SHA-256 hash for a deterministic, fixed-length key
  const hash = createHash('sha256').update(jsonStr).digest('hex')

  return `ai:chat:${hash}`
}

/**
 * Create a cache service instance with Redis configuration
 *
 * @param logger - Logger instance for debugging cache hits/misses
 * @param cacheExpirationSeconds - How long to cache responses (default: 3600 = 1 hour)
 * @returns CacheService instance or null if Redis is not configured
 */
export function createCacheService(
  logger: LoggerPort,
  cacheExpirationSeconds: number = 3600
): CacheService | null {
  const redisUrl = EnvConfig.UPSTASH_REDIS_REST_URL?.toString()
  const redisToken = EnvConfig.UPSTASH_REDIS_REST_TOKEN?.toString()

  // If Redis credentials are not configured, return null
  if (!redisUrl || !redisToken || redisUrl === '[OBSCURED]' || redisToken === '[OBSCURED]') {
    logger.warn(
      'Redis cache disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured'
    )
    return null
  }

  const redis = new Redis({
    url: obscured.value(EnvConfig.UPSTASH_REDIS_REST_URL),
    token: obscured.value(EnvConfig.UPSTASH_REDIS_REST_TOKEN),
  })

  logger.info('Redis cache service enabled', {
    expirationSeconds: cacheExpirationSeconds,
  })

  return {
    /**
     * Get cached response for given message history
     */
    async get(messages: UIMessage[]): Promise<string | null> {
      try {
        const cacheKey = generateCacheKey(messages)
        const cached = await redis.get<string>(cacheKey)

        if (cached !== null) {
          logger.debug('Cache HIT', {
            cacheKey,
          })
          return cached
        }

        logger.debug('Cache MISS', {
          cacheKey,
        })
        return null
      } catch (error) {
        logger.error('Redis cache error in get, returning null', error as Error)
        return null
      }
    },

    /**
     * Store AI response in cache
     */
    async set(messages: UIMessage[], text: string): Promise<void> {
      try {
        const cacheKey = generateCacheKey(messages)
        await redis.set(cacheKey, text, { ex: cacheExpirationSeconds })
        logger.debug('Cached response', {
          cacheKey,
          textLength: text.length,
        })
      } catch (error) {
        logger.error('Redis cache error in set', error as Error)
        // Don't throw - caching is not critical
      }
    },
  }
}
