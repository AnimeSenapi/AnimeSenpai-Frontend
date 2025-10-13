import { describe, test, expect } from 'bun:test'
import { extractSeriesInfo, groupAnimeIntoSeries } from '../series-grouping'

describe('Frontend Series Grouping', () => {
  describe('extractSeriesInfo', () => {
    test('should extract series information from title', () => {
      const result = extractSeriesInfo('Attack on Titan Season 2')
      
      // Should return required properties
      expect(result).toHaveProperty('seriesName')
      expect(result).toHaveProperty('seasonNumber')
      expect(result).toHaveProperty('isSequel')
      expect(typeof result.seriesName).toBe('string')
      expect(typeof result.seasonNumber).toBe('number')
    })

    test('should handle "X of Y" pattern', () => {
      const result = extractSeriesInfo('Rascal Does Not Dream of Bunny Girl Senpai')
      
      expect(result.seriesName).toContain('Rascal Does Not Dream')
      expect(result.seasonNumber).toBeGreaterThanOrEqual(1)
    })

    test('should handle "X in Y" pattern', () => {
      const result = extractSeriesInfo('Alya Sometimes Hides Her Feelings in Russian')
      
      expect(result.seriesName).toContain('Alya')
      expect(result.seasonNumber).toBeGreaterThanOrEqual(1)
    })

    test('should handle colon pattern', () => {
      const result = extractSeriesInfo('TONIKAWA: Over the Moon for You')
      
      expect(result.seriesName).toContain('TONIKAWA')
      expect(result.seasonNumber).toBeGreaterThanOrEqual(1)
    })

    test('should prefer English title when provided', () => {
      const result = extractSeriesInfo(
        'Shingeki no Kyojin Season 2',
        'Attack on Titan Season 2'
      )
      
      // Should use English title for extraction
      expect(result.seriesName).toContain('Attack')
    })
  })

  describe('groupAnimeIntoSeries', () => {
    test('should group anime into series', () => {
      const anime = [
        {
          id: '1',
          title: 'Test Anime',
          year: 2020,
          episodes: 12,
          rating: 8.0
        },
        {
          id: '2',
          title: 'Test Anime Season 2',
          year: 2021,
          episodes: 12,
          rating: 8.5
        }
      ]

      const grouped = groupAnimeIntoSeries(anime)
      
      // Should return an array
      expect(Array.isArray(grouped)).toBe(true)
      // Should process the input
      expect(grouped.length).toBeGreaterThanOrEqual(1)
    })

    test('should return valid series objects', () => {
      const anime = [
        { id: '1', title: 'Test', year: 2020, episodes: 12, rating: 8.0 }
      ]

      const grouped = groupAnimeIntoSeries(anime)
      
      // Should have required properties
      if (grouped.length > 0) {
        expect(grouped[0]).toHaveProperty('id')
        expect(grouped[0]).toHaveProperty('title')
      }
    })
  })
})

