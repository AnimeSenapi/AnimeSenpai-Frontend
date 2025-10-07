'use client'

import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { Anime } from '../../../types/anime'
import { RequireAuth } from '../../lib/protected-route'
import { 
  User, 
  Mail, 
  Calendar, 
  Star, 
  Bookmark, 
  Clock, 
  Edit3,
  Camera,
  Settings,
  Heart,
  Play,
  CheckCircle
} from 'lucide-react'

// Mock user data
const userData = {
  id: '1',
  name: 'Anime Fan',
  email: 'user@animesenpai.app',
  avatar: undefined,
  joinDate: '2023-01-15',
  totalAnime: 156,
  favorites: 23,
  watching: 8,
  completed: 89,
  planToWatch: 36,
  totalWatchTime: 2840, // in hours
  averageRating: 8.7,
  favoriteGenres: ['Action', 'Drama', 'Supernatural'],
  recentActivity: [
    {
      type: 'completed',
      anime: 'Attack on Titan',
      date: '2023-12-01',
      rating: 5
    },
    {
      type: 'started',
      anime: 'Demon Slayer',
      date: '2023-11-28',
      rating: null
    },
    {
      type: 'favorited',
      anime: 'Jujutsu Kaisen',
      date: '2023-11-25',
      rating: null
    }
  ]
}

// Sample anime for recent activity
const recentAnime: Anime[] = [
  {
    id: '1',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    year: 2023,
    rating: 9.2,
    status: 'new',
    tags: ['action', 'drama', 'supernatural'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio'
  },
  {
    id: '2',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    year: 2023,
    rating: 9.1,
    status: 'trending',
    tags: ['action', 'supernatural', 'shounen'],
    episodes: 26,
    duration: 23,
    studio: 'Ufotable'
  },
  {
    id: '3',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    year: 2023,
    rating: 8.9,
    status: 'trending',
    tags: ['action', 'supernatural', 'school'],
    episodes: 24,
    duration: 24,
    studio: 'MAPPA'
  }
]

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center ring-4 ring-white/20">
                <span className="text-white font-bold text-2xl">{userData.name.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userData.totalAnime}</div>
                  <div className="text-sm text-gray-400">Total Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userData.favorites}</div>
                  <div className="text-sm text-gray-400">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userData.completed}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userData.totalWatchTime}h</div>
                  <div className="text-sm text-gray-400">Watch Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Preferences */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Average Rating</span>
                  <span className="text-white font-semibold">{userData.averageRating}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Currently Watching</span>
                  <span className="text-white font-semibold">{userData.watching}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Plan to Watch</span>
                  <span className="text-white font-semibold">{userData.planToWatch}</span>
                </div>
              </div>
            </div>

            {/* Favorite Genres */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary-400" />
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {userData.favoriteGenres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-secondary-500/20 text-secondary-400 border-brand-secondary-500/30">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-400" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      {activity.type === 'completed' && <CheckCircle className="h-4 w-4 text-success-400" />}
                      {activity.type === 'started' && <Play className="h-4 w-4 text-primary-400" />}
                      {activity.type === 'favorited' && <Heart className="h-4 w-4 text-secondary-400" />}
                    </div>
                    <div className="flex-grow">
                      <div className="text-white font-medium">{activity.anime}</div>
                      <div className="text-gray-400 text-xs">
                        {activity.type === 'completed' && 'Completed'}
                        {activity.type === 'started' && 'Started watching'}
                        {activity.type === 'favorited' && 'Added to favorites'}
                        {' • '}{new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-warning-400" />
                        <span className="text-warning-400 text-xs">{activity.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Anime */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary-400" />
                  Recently Watched
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="featured"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </RequireAuth>
  )
}
