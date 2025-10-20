/**
 * Utility Functions Tests
 * Tests for utility functions
 */

import { describe, it, expect } from 'bun:test'
import { cn } from '../../app/lib/utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
    })

    it('should skip false conditionals', () => {
      const result = cn('base', false && 'conditional')
      expect(result).toContain('base')
      expect(result).not.toContain('conditional')
    })

    it('should handle undefined values', () => {
      const result = cn('base', undefined)
      expect(result).toContain('base')
    })

    it('should handle null values', () => {
      const result = cn('base', null)
      expect(result).toContain('base')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle objects', () => {
      const result = cn({ 'class1': true, 'class2': false })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
    })
  })
})

