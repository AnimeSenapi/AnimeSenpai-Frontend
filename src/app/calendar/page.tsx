'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { ErrorState } from '../../components/ui/error-state'
import { AnimeCalendar, SeasonalCalendar } from '../../components/calendar'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../components/ui/toast'
import { 
  Calendar, 
  Clock, 
  TrendingUp,
  Star
} from 'lucide-react'

export default function CalendarPage() {
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'episodes' | 'seasonal'>('episodes')
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  const handleEpisodeClick = (episode: any) => {
    console.log('Episode clicked:', episode)
    addToast({
        title: 'Episode clicked',
        description: `${episode.animeTitle} Episode ${episode.episodeNumber}`,
        variant: 'default',
      })
  }

  const handleAnimeClick = (animeId: string) => {
    console.log('Anime clicked:', animeId)
    addToast({
        title: 'Anime clicked',
        description: 'Redirecting to anime page...',
        variant: 'default',
      })
  }

  const handleStatusChange = (animeId: string, status: string) => {
    console.log('Status changed:', animeId, status)
    addToast({
      title: 'Status updated',
      description: `Added to ${status.replace('-', ' ')}`,
      variant: 'success',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          title="Authentication Required"
          message="Please sign in to view the anime calendar."
          showHome={true}
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingState variant="full" text="Loading calendar..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          title="Failed to Load Calendar"
          message={error}
          showHome={true}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Anime Calendar</h1>
              <p className="text-gray-400">
                Track upcoming episodes and discover seasonal anime
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant={activeTab === 'episodes' ? 'default' : 'outline'}
              onClick={() => setActiveTab('episodes')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Episode Schedule
            </Button>
            <Button
              variant={activeTab === 'seasonal' ? 'default' : 'outline'}
              onClick={() => setActiveTab('seasonal')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Seasonal Anime
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'episodes' && (
          <div className="space-y-6">
            <AnimeCalendar
              onEpisodeClick={handleEpisodeClick}
              onAnimeClick={handleAnimeClick}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'seasonal' && (
          <div className="space-y-6">
            <SeasonalCalendar
              onAnimeClick={handleAnimeClick}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">This Week</h3>
            </div>
            <p className="text-2xl font-bold text-violet-400 mb-1">12</p>
            <p className="text-sm text-gray-400">Episodes airing</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Trending</h3>
            </div>
            <p className="text-2xl font-bold text-green-400 mb-1">8</p>
            <p className="text-sm text-gray-400">Popular anime</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Watching</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">5</p>
            <p className="text-sm text-gray-400">Currently watching</p>
          </div>
        </div>
      </div>
    </div>
  )
}
