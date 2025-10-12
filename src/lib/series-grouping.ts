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
  
  // Patterns to detect seasons
  const patterns = [
    { regex: /Season (\d+)/i, type: 'season' },
    { regex: /(\d+)(?:st|nd|rd|th) Season/i, type: 'season' },
    { regex: /Part (\d+)/i, type: 'part' },
    { regex: /: II$/i, number: 2 },
    { regex: /: III$/i, number: 3 },
    { regex: /: IV$/i, number: 4 },
  ]
  
  for (const pattern of patterns) {
    const match = workingTitle.match(pattern.regex)
    if (match) {
      const seasonNumber = pattern.number || parseInt(match[1])
      let seriesName = workingTitle.replace(pattern.regex, '').trim()
      seriesName = seriesName.replace(/[:\-–—]\s*$/, '').trim()
      
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
  
  // Group by series name
  for (const anime of animeList) {
    const { seriesName } = extractSeriesInfo(anime.title, anime.titleEnglish)
    
    if (!seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, [])
    }
    seriesMap.get(seriesName)!.push(anime)
  }
  
  // Convert to series entries
  const series: any[] = []
  
  for (const [seriesName, seasons] of seriesMap.entries()) {
    // Sort by year
    const sortedSeasons = seasons.sort((a, b) => (a.year || 0) - (b.year || 0))
    const mainSeason = sortedSeasons[0]
    
    series.push({
      ...mainSeason,
      displayTitle: seriesName,
      titleEnglish: seriesName,
      seasonCount: sortedSeasons.length,
      totalEpisodes: sortedSeasons.reduce((sum, s) => sum + (s.episodes || 0), 0),
      rating: Math.max(...sortedSeasons.map(s => s.rating || s.averageRating || 0)),
      seasons: sortedSeasons
    })
  }
  
  return series
}

