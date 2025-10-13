/**
 * Client-side series grouping utility
 * Groups anime seasons into series like Crunchyroll
 */

export function extractSeriesInfo(title: string, titleEnglish?: string | null): {
  seriesName: string
  seasonNumber: number
  isSequel: boolean
} {
  const workingTitle = titleEnglish || title
  
  // Special handling for common patterns before season detection
  
  // Pattern 1: "X of Y" (e.g., "Rascal Does Not Dream of...")
  const ofPattern = /^(.+\s+of)\s+.+$/i
  const ofMatch = workingTitle.match(ofPattern)
  if (ofMatch) {
    const baseSeriesName = ofMatch[1].trim()
    return {
      seriesName: baseSeriesName,
      seasonNumber: 1, // Will be sorted by year
      isSequel: false
    }
  }
  
  // Pattern 2: "X in Y" (e.g., "Alya Sometimes Hides Her Feelings in Russian")
  const inPattern = /^(.+\s+in)\s+.+$/i
  const inMatch = workingTitle.match(inPattern)
  if (inMatch) {
    const baseSeriesName = inMatch[1].trim()
    return {
      seriesName: baseSeriesName,
      seasonNumber: 1,
      isSequel: false
    }
  }
  
  // Pattern 3: Very long titles with subtitles (likely different entries in same franchise)
  // E.g., "TONIKAWA: Over the Moon for You" vs "TONIKAWA: Fly Me to the Moon"
  const colonPattern = /^([^:]+):\s*.+$/
  const colonMatch = workingTitle.match(colonPattern)
  if (colonMatch) {
    const baseTitle = colonMatch[1].trim()
    // Only use this if the base title is short enough (likely a series name)
    if (baseTitle.length <= 40 && !baseTitle.match(/Season|Part|Final|Arc/i)) {
      return {
        seriesName: baseTitle,
        seasonNumber: 1,
        isSequel: false
      }
    }
  }
  
  // Comprehensive patterns to detect seasons - order matters!
  const patterns = [
    // Final/Last seasons
    { regex: /:\s*Final Season\s*(?:Part\s*(\d+))?/i, number: (m: RegExpMatchArray) => m[1] ? parseInt(m[1]) + 3 : 4 },
    { regex: /:\s*Last Season/i, number: 5 },
    { regex: /:\s*The Final/i, number: 5 },
    
    // Season patterns
    { regex: /:\s*Season\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /:\s*(\d+)(?:st|nd|rd|th)\s*Season/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /\sS(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    
    // Part patterns
    { regex: /:\s*Part\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /:\s*(\d+)(?:st|nd|rd|th)\s*Part/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    
    // Cour patterns
    { regex: /:\s*Cour\s*(\d+)/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /:\s*2nd\s*Cour/i, number: 2 },
    
    // Arc patterns
    { regex: /:\s*([\w\s]+)\s*Arc$/i, number: 2 },
    
    // Roman numerals
    { regex: /\s+II(?:\s|:|$)/i, number: 2 },
    { regex: /\s+III(?:\s|:|$)/i, number: 3 },
    { regex: /\s+IV(?:\s|:|$)/i, number: 4 },
    { regex: /\s+V(?:\s|:|$)/i, number: 5 },
    { regex: /:\s*II$/i, number: 2 },
    { regex: /:\s*III$/i, number: 3 },
    { regex: /:\s*IV$/i, number: 4 },
    { regex: /:\s*V$/i, number: 5 },
    
    // Numbers at the end
    { regex: /:\s*(\d+)$/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    { regex: /\s+(\d+)$/i, number: (m: RegExpMatchArray) => parseInt(m[1]) },
    
    // Sequel indicators
    { regex: /:\s*2nd\s*/i, number: 2 },
    { regex: /:\s*3rd\s*/i, number: 3 },
    { regex: /:\s*4th\s*/i, number: 4 },
  ]
  
  for (const pattern of patterns) {
    const match = workingTitle.match(pattern.regex)
    if (match) {
      const seasonNumber = typeof pattern.number === 'function' ? pattern.number(match) : pattern.number
      let seriesName = workingTitle.replace(pattern.regex, '').trim()
      seriesName = seriesName.replace(/[:\-–—,;]\s*$/, '').trim()
      
      return {
        seriesName,
        seasonNumber,
        isSequel: true
      }
    }
  }
  
  return {
    seriesName: workingTitle,
    seasonNumber: 1,
    isSequel: false
  }
}

export function groupAnimeIntoSeries(animeList: any[]): any[] {
  const seriesMap = new Map<string, any[]>()
  
  // Group by series name (normalized for better matching)
  for (const anime of animeList) {
    const { seriesName } = extractSeriesInfo(anime.title, anime.titleEnglish)
    // Normalize by removing articles and converting to lowercase
    const normalizedName = seriesName.replace(/\b(The|A|An)\b/gi, '').trim().toLowerCase()
    
    if (!seriesMap.has(normalizedName)) {
      seriesMap.set(normalizedName, [])
    }
    seriesMap.get(normalizedName)!.push({ ...anime, originalSeriesName: seriesName })
  }
  
  // Convert to series entries
  const series: any[] = []
  
  for (const [normalizedName, seasons] of seriesMap.entries()) {
    // Sort by year and season number
    const sortedSeasons = seasons.sort((a, b) => {
      const aInfo = extractSeriesInfo(a.title, a.titleEnglish)
      const bInfo = extractSeriesInfo(b.title, b.titleEnglish)
      
      // First by year
      if (a.year && b.year && a.year !== b.year) {
        return a.year - b.year
      }
      
      // Then by season number
      return aInfo.seasonNumber - bInfo.seasonNumber
    })
    
    const mainSeason = sortedSeasons[0]
    const seriesName = mainSeason.originalSeriesName || mainSeason.titleEnglish || mainSeason.title
    
    series.push({
      ...mainSeason,
      displayTitle: seriesName,
      titleEnglish: seriesName,
      seasonCount: sortedSeasons.length,
      totalEpisodes: sortedSeasons.reduce((sum, s) => sum + (s.episodes || 0), 0),
      rating: Math.max(...sortedSeasons.map(s => s.rating || s.averageRating || 0)),
      seasons: sortedSeasons.map(s => ({
        ...s,
        seasonInfo: extractSeriesInfo(s.title, s.titleEnglish)
      }))
    })
  }
  
  return series
}

