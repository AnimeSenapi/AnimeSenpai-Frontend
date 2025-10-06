export interface Tag {
  id: string
  name: string
  color: string
  category: 'genre' | 'theme' | 'demographic' | 'status' | 'rating'
}

export const ANIME_TAGS: Tag[] = [
  // Genres
  { id: 'action', name: 'Action', color: 'bg-red-500/20 text-red-300 border-red-500/30', category: 'genre' },
  { id: 'adventure', name: 'Adventure', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', category: 'genre' },
  { id: 'comedy', name: 'Comedy', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', category: 'genre' },
  { id: 'drama', name: 'Drama', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', category: 'genre' },
  { id: 'fantasy', name: 'Fantasy', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30', category: 'genre' },
  { id: 'horror', name: 'Horror', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', category: 'genre' },
  { id: 'romance', name: 'Romance', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', category: 'genre' },
  { id: 'sci-fi', name: 'Sci-Fi', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', category: 'genre' },
  { id: 'slice-of-life', name: 'Slice of Life', color: 'bg-green-500/20 text-green-300 border-green-500/30', category: 'genre' },
  { id: 'supernatural', name: 'Supernatural', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', category: 'genre' },
  { id: 'thriller', name: 'Thriller', color: 'bg-red-600/20 text-red-400 border-red-600/30', category: 'genre' },
  { id: 'sports', name: 'Sports', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', category: 'genre' },
  
  // Themes
  { id: 'school', name: 'School', color: 'bg-blue-400/20 text-blue-300 border-blue-400/30', category: 'theme' },
  { id: 'military', name: 'Military', color: 'bg-gray-600/20 text-gray-400 border-gray-600/30', category: 'theme' },
  { id: 'magic', name: 'Magic', color: 'bg-purple-400/20 text-purple-300 border-purple-400/30', category: 'theme' },
  { id: 'mecha', name: 'Mecha', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', category: 'theme' },
  { id: 'music', name: 'Music', color: 'bg-pink-400/20 text-pink-300 border-pink-400/30', category: 'theme' },
  { id: 'cooking', name: 'Cooking', color: 'bg-orange-400/20 text-orange-300 border-orange-400/30', category: 'theme' },
  { id: 'gaming', name: 'Gaming', color: 'bg-green-400/20 text-green-300 border-green-400/30', category: 'theme' },
  { id: 'isekai', name: 'Isekai', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', category: 'theme' },
  
  // Demographics
  { id: 'shounen', name: 'Shounen', color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30', category: 'demographic' },
  { id: 'shoujo', name: 'Shoujo', color: 'bg-pink-300/20 text-pink-200 border-pink-300/30', category: 'demographic' },
  { id: 'seinen', name: 'Seinen', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30', category: 'demographic' },
  { id: 'josei', name: 'Josei', color: 'bg-purple-300/20 text-purple-200 border-purple-300/30', category: 'demographic' },
  
  // Status
  { id: 'ongoing', name: 'Ongoing', color: 'bg-green-500/20 text-green-300 border-green-500/30', category: 'status' },
  { id: 'completed', name: 'Completed', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', category: 'status' },
  { id: 'upcoming', name: 'Upcoming', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', category: 'status' },
  { id: 'on-hold', name: 'On Hold', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', category: 'status' },
  
  // Ratings
  { id: 'g', name: 'G', color: 'bg-green-400/20 text-green-300 border-green-400/30', category: 'rating' },
  { id: 'pg', name: 'PG', color: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30', category: 'rating' },
  { id: 'pg-13', name: 'PG-13', color: 'bg-orange-400/20 text-orange-300 border-orange-400/30', category: 'rating' },
  { id: 'r', name: 'R', color: 'bg-red-400/20 text-red-300 border-red-400/30', category: 'rating' },
  { id: 'r+', name: 'R+', color: 'bg-red-500/20 text-red-400 border-red-500/30', category: 'rating' },
]

export const getTagById = (id: string): Tag | undefined => {
  return ANIME_TAGS.find(tag => tag.id === id)
}

export const getTagsByCategory = (category: Tag['category']): Tag[] => {
  return ANIME_TAGS.filter(tag => tag.category === category)
}
