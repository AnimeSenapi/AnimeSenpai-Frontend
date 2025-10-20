/**
 * Client Cache Tests
 * Tests for the client-side caching system
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { clientCache, CacheTTL } from '../client-cache'

describe('ClientCache', () => {
  beforeEach(() => {
    clientCache.clear()
  })

  describe('Basic Operations', () => {
    it('should set and get a value', () => {
      clientCache.set('test-key', 'test-value', CacheTTL.short)
      const result = clientCache.get('test-key')
      expect(result).toBe('test-value')
    })

    it('should return null for non-existent key', () => {
      const result = clientCache.get('non-existent')
      expect(result).toBeNull()
    })

    it('should delete a value', () => {
      clientCache.set('delete-test', 'value', CacheTTL.short)
      clientCache.delete('delete-test')
      const result = clientCache.get('delete-test')
      expect(result).toBeNull()
    })

    it('should clear all values', () => {
      clientCache.set('key1', 'value1', CacheTTL.short)
      clientCache.set('key2', 'value2', CacheTTL.short)
      clientCache.clear()
      expect(clientCache.get('key1')).toBeNull()
      expect(clientCache.get('key2')).toBeNull()
    })
  })

  describe('Expiration', () => {
    it('should expire values after TTL', async () => {
      clientCache.set('expire-test', 'value', 100) // 100ms TTL
      expect(clientCache.get('expire-test')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(clientCache.get('expire-test')).toBeNull()
    })

    it('should not expire values before TTL', async () => {
      clientCache.set('no-expire-test', 'value', 1000) // 1 second TTL
      expect(clientCache.get('no-expire-test')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(clientCache.get('no-expire-test')).toBe('value')
    })
  })

  describe('Statistics', () => {
    it('should track cache statistics', () => {
      clientCache.set('stats-test', 'value', CacheTTL.short)
      clientCache.get('stats-test')
      clientCache.get('stats-test')
      clientCache.get('non-existent')
      
      const stats = clientCache.stats()
      expect(stats.size).toBe(1)
      expect(stats.totalHits).toBeGreaterThan(0)
      expect(stats.totalMisses).toBeGreaterThan(0)
      expect(stats.hitRate).toBeDefined()
    })

    it('should track top keys', () => {
      clientCache.set('key1', 'value1', CacheTTL.short)
      clientCache.set('key2', 'value2', CacheTTL.short)
      
      clientCache.get('key1')
      clientCache.get('key1')
      clientCache.get('key2')
      
      const stats = clientCache.stats()
      expect(stats.topKeys).toBeDefined()
      expect(stats.topKeys.length).toBeGreaterThan(0)
    })
  })

  describe('Type Safety', () => {
    it('should preserve types', () => {
      const testObject = { name: 'test', count: 42 }
      clientCache.set('object-test', testObject, CacheTTL.short)
      const result = clientCache.get<typeof testObject>('object-test')
      expect(result).toEqual(testObject)
      expect(result?.name).toBe('test')
      expect(result?.count).toBe(42)
    })

    it('should handle arrays', () => {
      const testArray = [1, 2, 3, 4, 5]
      clientCache.set('array-test', testArray, CacheTTL.short)
      const result = clientCache.get<number[]>('array-test')
      expect(result).toEqual(testArray)
      expect(result?.length).toBe(5)
    })
  })

  describe('Cache TTL Constants', () => {
    it('should have correct TTL values', () => {
      expect(CacheTTL.short).toBe(1 * 60 * 1000) // 1 minute
      expect(CacheTTL.medium).toBe(5 * 60 * 1000) // 5 minutes
      expect(CacheTTL.long).toBe(15 * 60 * 1000) // 15 minutes
      expect(CacheTTL.veryLong).toBe(60 * 60 * 1000) // 1 hour
      expect(CacheTTL.day).toBe(24 * 60 * 60 * 1000) // 24 hours
      expect(CacheTTL.week).toBe(7 * 24 * 60 * 60 * 1000) // 1 week
    })
  })
})

