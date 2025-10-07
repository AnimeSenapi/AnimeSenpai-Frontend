export interface Tag {
  id: string
  name: string
  color: string
  category: 'genre' | 'theme' | 'demographic' | 'status' | 'rating'
}

export const ANIME_TAGS: Tag[] = [
  // Genres
  { id: 'action', name: 'Action', color: 'bg-error-500/20 text-red-300 border-error-500/30', category: 'genre' },
  { id: 'adventure', name: 'Adventure', color: 'bg-warning-500/20 text-orange-300 border-warning-500/30', category: 'genre' },
  { id: 'comedy', name: 'Comedy', color: 'bg-warning-500/20 text-yellow-300 border-warning-500/30', category: 'genre' },
  { id: 'drama', name: 'Drama', color: 'bg-planning-500/20 text-purple-300 border-planning-500/30', category: 'genre' },
  { id: 'fantasy', name: 'Fantasy', color: 'bg-brand-secondary-500/20 text-brand-secondary-400 border-brand-secondary-500/30', category: 'genre' },
  { id: 'horror', name: 'Horror', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', category: 'genre' },
  { id: 'romance', name: 'Romance', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', category: 'genre' },
  { id: 'sci-fi', name: 'Sci-Fi', color: 'bg-brand-primary-500/20 text-brand-primary-400 border-brand-primary-500/30', category: 'genre' },
  { id: 'slice-of-life', name: 'Slice of Life', color: 'bg-success-500/20 text-green-300 border-success-500/30', category: 'genre' },
  { id: 'supernatural', name: 'Supernatural', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', category: 'genre' },
  { id: 'thriller', name: 'Thriller', color: 'bg-error-600/20 text-error-400 border-error-600/30', category: 'genre' },
  { id: 'sports', name: 'Sports', color: 'bg-info-500/20 text-blue-300 border-info-500/30', category: 'genre' },
  
  // Themes
  { id: 'school', name: 'School', color: 'bg-info-400/20 text-blue-300 border-info-400/30', category: 'theme' },
  { id: 'military', name: 'Military', color: 'bg-gray-600/20 text-gray-400 border-gray-600/30', category: 'theme' },
  { id: 'magic', name: 'Magic', color: 'bg-planning-400/20 text-purple-300 border-planning-400/30', category: 'theme' },
  { id: 'mecha', name: 'Mecha', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', category: 'theme' },
  { id: 'music', name: 'Music', color: 'bg-brand-secondary-400/20 text-brand-secondary-400 border-brand-secondary-400/30', category: 'theme' },
  { id: 'cooking', name: 'Cooking', color: 'bg-warning-400/20 text-orange-300 border-warning-400/30', category: 'theme' },
  { id: 'gaming', name: 'Gaming', color: 'bg-success-400/20 text-green-300 border-success-400/30', category: 'theme' },
  { id: 'isekai', name: 'Isekai', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', category: 'theme' },
  
  // Demographics
  { id: 'shounen', name: 'Shounen', color: 'bg-brand-primary-400/20 text-brand-primary-400 border-brand-primary-400/30', category: 'demographic' },
  { id: 'shoujo', name: 'Shoujo', color: 'bg-brand-secondary-400/20 text-brand-secondary-400 border-brand-secondary-400/30', category: 'demographic' },
  { id: 'seinen', name: 'Seinen', color: 'bg-info-600/20 text-info-400 border-info-600/30', category: 'demographic' },
  { id: 'josei', name: 'Josei', color: 'bg-purple-300/20 text-purple-200 border-purple-300/30', category: 'demographic' },
  
  // Status
  { id: 'ongoing', name: 'Ongoing', color: 'bg-success-500/20 text-green-300 border-success-500/30', category: 'status' },
  { id: 'completed', name: 'Completed', color: 'bg-info-500/20 text-blue-300 border-info-500/30', category: 'status' },
  { id: 'upcoming', name: 'Upcoming', color: 'bg-warning-500/20 text-yellow-300 border-warning-500/30', category: 'status' },
  { id: 'on-hold', name: 'On Hold', color: 'bg-warning-500/20 text-orange-300 border-warning-500/30', category: 'status' },
  
  // Ratings
  { id: 'g', name: 'G', color: 'bg-success-400/20 text-green-300 border-success-400/30', category: 'rating' },
  { id: 'pg', name: 'PG', color: 'bg-warning-400/20 text-yellow-300 border-warning-400/30', category: 'rating' },
  { id: 'pg-13', name: 'PG-13', color: 'bg-warning-400/20 text-orange-300 border-warning-400/30', category: 'rating' },
  { id: 'r', name: 'R', color: 'bg-error-400/20 text-red-300 border-error-400/30', category: 'rating' },
  { id: 'r+', name: 'R+', color: 'bg-error-500/20 text-error-400 border-error-500/30', category: 'rating' },
]

export const getTagById = (id: string): Tag | undefined => {
  return ANIME_TAGS.find(tag => tag.id === id)
}

export const getTagsByCategory = (category: Tag['category']): Tag[] => {
  return ANIME_TAGS.filter(tag => tag.category === category)
}
