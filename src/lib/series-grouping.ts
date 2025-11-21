/**
 * Client-side series grouping utility
 * Groups anime seasons into series like Crunchyroll
 */

/**
 * Normalize title for better matching
 */
function normalizeTitle(title: string): string {
  return title
    .trim()
    // Remove common punctuation variations
    .replace(/[–—]/g, '-')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove trailing punctuation
    .replace(/[:\-–—,;]\s*$/, '')
    .trim()
}

export function extractSeriesInfo(
  title: string,
  titleEnglish?: string | null
): {
  seriesName: string
  seasonNumber: number
  isSequel: boolean
} {
  const workingTitle = normalizeTitle(titleEnglish || title)

  // Special handling for common patterns before season detection

  // Pattern 1: "X of Y" (e.g., "Rascal Does Not Dream of...")
  // But exclude if it's part of a season indicator
  const ofPattern = /^(.+\s+of)\s+(.+)$/i
  const ofMatch = workingTitle.match(ofPattern)
  if (ofMatch && ofMatch[1] && !ofMatch[2].match(/Season|Part|Final|Arc|\d/i)) {
    const baseSeriesName = ofMatch[1].trim()
    return {
      seriesName: baseSeriesName,
      seasonNumber: 1, // Will be sorted by year
      isSequel: false,
    }
  }

  // Pattern 2: "X in Y" (e.g., "Alya Sometimes Hides Her Feelings in Russian")
  // But exclude if it's part of a season indicator
  const inPattern = /^(.+\s+in)\s+(.+)$/i
  const inMatch = workingTitle.match(inPattern)
  if (inMatch && inMatch[1] && !inMatch[2].match(/Season|Part|Final|Arc|\d/i)) {
    const baseSeriesName = inMatch[1].trim()
    return {
      seriesName: baseSeriesName,
      seasonNumber: 1,
      isSequel: false,
    }
  }

  // Pattern 3: Very long titles with subtitles (likely different entries in same franchise)
  // E.g., "TONIKAWA: Over the Moon for You" vs "TONIKAWA: Fly Me to the Moon"
  const colonPattern = /^([^:]+):\s*(.+)$/
  const colonMatch = workingTitle.match(colonPattern)
  if (colonMatch && colonMatch[1]) {
    const baseTitle = colonMatch[1].trim()
    // Only use this if the base title is short enough (likely a series name)
    // and doesn't contain season indicators
    if (baseTitle.length <= 40 && !baseTitle.match(/Season|Part|Final|Arc|\d/i)) {
      return {
        seriesName: baseTitle,
        seasonNumber: 1,
        isSequel: false,
      }
    }
  }

  // Comprehensive patterns to detect seasons - order matters!
  // More specific patterns first, then general ones
  const patterns = [
    // Final/Last seasons (highest priority)
    {
      regex: /:\s*Final\s+Season\s*(?:Part\s*(\d+))?/i,
      number: (m: RegExpMatchArray) => (m[1] ? parseInt(m[1]) + 3 : 4),
    },
    { regex: /:\s*Last\s+Season/i, number: 5 },
    { regex: /:\s*The\s+Final/i, number: 5 },
    { regex: /\s+Final\s+Season/i, number: 4 },

    // Season patterns (explicit)
    { regex: /:\s*Season\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },
    { regex: /\s+Season\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },
    {
      regex: /:\s*(\d+)(?:st|nd|rd|th)\s+Season/i,
      number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1'),
    },
    { regex: /\sS(\d+)(?:\s|$|:)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },

    // Part patterns
    { regex: /:\s*Part\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },
    { regex: /\s+Part\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },
    { regex: /:\s*(\d+)(?:st|nd|rd|th)\s+Part/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },

    // Cour patterns
    { regex: /:\s*Cour\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1] ?? '1') },
    { regex: /:\s*2nd\s+Cour/i, number: 2 },
    { regex: /\s+2nd\s+Cour/i, number: 2 },

    // Arc patterns
    { regex: /:\s*([\w\s]+)\s+Arc$/i, number: 2 },

    // Roman numerals (must be at the end or before subtitle)
    { regex: /\s+II(?:\s|:|$)/i, number: 2 },
    { regex: /\s+III(?:\s|:|$)/i, number: 3 },
    { regex: /\s+IV(?:\s|:|$)/i, number: 4 },
    { regex: /\s+V(?:\s|:|$)/i, number: 5 },
    { regex: /:\s*II$/i, number: 2 },
    { regex: /:\s*III$/i, number: 3 },
    { regex: /:\s*IV$/i, number: 4 },
    { regex: /:\s*V$/i, number: 5 },

    // Numbers at the end (with caution - must have separator)
    // Only match if it's a reasonable season number (1-20)
    {
      regex: /:\s*(\d{1,2})$/i,
      number: (m: RegExpMatchArray) => {
        const num = parseInt(m[1] ?? '1')
        return num >= 1 && num <= 20 ? num : 1
      },
    },
    {
      regex: /\s+(\d{1,2})$/i,
      number: (m: RegExpMatchArray) => {
        const num = parseInt(m[1] ?? '1')
        return num >= 1 && num <= 20 ? num : 1
      },
    },

    // Sequel indicators
    { regex: /:\s*2nd\s+/i, number: 2 },
    { regex: /:\s*3rd\s+/i, number: 3 },
    { regex: /:\s*4th\s+/i, number: 4 },
    { regex: /\s+2nd\s+/i, number: 2 },
    { regex: /\s+3rd\s+/i, number: 3 },
    { regex: /\s+4th\s+/i, number: 4 },
  ]

  for (const pattern of patterns) {
    const match = workingTitle.match(pattern.regex)
    if (match) {
      const seasonNumber =
        typeof pattern.number === 'function' ? pattern.number(match) : pattern.number
      let seriesName = workingTitle.replace(pattern.regex, '').trim()
      seriesName = normalizeTitle(seriesName)

      return {
        seriesName,
        seasonNumber,
        isSequel: true,
      }
    }
  }

  return {
    seriesName: workingTitle,
    seasonNumber: 1,
    isSequel: false,
  }
}

/**
 * Calculate similarity score between two series names
 * Returns a score between 0 and 1, where 1 is exact match
 */
function calculateSeriesSimilarity(name1: string, name2: string): number {
  const normalize = (s: string) =>
    s
      .replace(/\b(The|A|An)\b/gi, '')
      .trim()
      .toLowerCase()
      .replace(/[:\-–—,;]/g, '')
      .replace(/\s+/g, ' ')

  const n1 = normalize(name1)
  const n2 = normalize(name2)

  if (n1 === n2) return 1.0

  // Check if one contains the other (partial match)
  if (n1.includes(n2) || n2.includes(n1)) {
    const shorter = Math.min(n1.length, n2.length)
    const longer = Math.max(n1.length, n2.length)
    return shorter / longer
  }

  // Simple word overlap
  const words1 = new Set(n1.split(/\s+/))
  const words2 = new Set(n2.split(/\s+/))
  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

/**
 * Validate and ensure correct chronological ordering of seasons
 */
function validateSeasonOrder(seasons: any[]): any[] {
  if (seasons.length <= 1) return seasons

  // Sort by multiple criteria (most reliable first)
  const sorted = [...seasons].sort((a, b) => {
    // 1. Start date (most reliable)
    if (a.startDate && b.startDate) {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      const dateDiff = dateA - dateB
      if (dateDiff !== 0) return dateDiff
    }

    // 2. Year + season
    if (a.year && b.year) {
      const yearDiff = a.year - b.year
      if (yearDiff !== 0) return yearDiff
    }

    // 3. Season number from title parsing
    const aInfo = extractSeriesInfo(a.title, a.titleEnglish)
    const bInfo = extractSeriesInfo(b.title, b.titleEnglish)
    const seasonDiff = aInfo.seasonNumber - bInfo.seasonNumber
    if (seasonDiff !== 0) return seasonDiff

    // 4. Episodes (later seasons often have more episodes if it's a long-running series)
    if (a.episodes && b.episodes) {
      return a.episodes - b.episodes
    }

    return 0
  })

  return sorted
}

export function groupAnimeIntoSeries(animeList: any[]): any[] {
  const seriesMap = new Map<string, any[]>()
  const normalizedMap = new Map<string, string>() // normalized -> original

  // Group by series name (normalized for better matching)
  for (const anime of animeList) {
    const { seriesName } = extractSeriesInfo(anime.title, anime.titleEnglish)
    // Normalize by removing articles and converting to lowercase
    const normalized = seriesName
      .replace(/\b(The|A|An)\b/gi, '')
      .trim()
      .toLowerCase()
      .replace(/[:\-–—,;]/g, '')
      .replace(/\s+/g, ' ')

    // Check for similar existing series names (fuzzy matching)
    let matchedKey: string | null = null
    let bestSimilarity = 0.8 // Minimum similarity threshold

    for (const [existingNormalized, originalName] of normalizedMap.entries()) {
      const similarity = calculateSeriesSimilarity(normalized, existingNormalized)
      if (similarity >= bestSimilarity && similarity > 0.8) {
        bestSimilarity = similarity
        matchedKey = originalName
      }
    }

    // Use matched key or create new entry
    const key = matchedKey || seriesName

    if (!seriesMap.has(key)) {
      seriesMap.set(key, [])
      normalizedMap.set(normalized, key)
    }

    seriesMap.get(key)!.push({ ...anime, originalSeriesName: seriesName })
  }

  // Convert to series entries
  const series: any[] = []

  for (const [_normalizedName, seasons] of seriesMap.entries()) {
    // Validate and sort seasons
    const sortedSeasons = validateSeasonOrder(seasons)

    const mainSeason = sortedSeasons[0]
    const seriesName = mainSeason.originalSeriesName || mainSeason.titleEnglish || mainSeason.title

    series.push({
      ...mainSeason,
      displayTitle: seriesName,
      titleEnglish: seriesName,
      seasonCount: sortedSeasons.length,
      totalEpisodes: sortedSeasons.reduce((sum, s) => sum + (s.episodes || 0), 0),
      rating: Math.max(...sortedSeasons.map((s) => s.rating || s.averageRating || 0)),
      seasons: sortedSeasons.map((s) => ({
        ...s,
        seasonInfo: extractSeriesInfo(s.title, s.titleEnglish),
      })),
    })
  }

  return series
}
