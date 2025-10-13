'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Target,
  Compass,
  Zap,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../lib/auth-context'
import { RequireAuth } from '../lib/protected-route'

interface Genre {
  id: string
  name: string
  slug: string
  color?: string
}

interface Anime {
  id: string
  slug: string
  title: string
  coverImage: string | null
  year: number | null
  averageRating: number | null
  genres: Genre[]
}

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    name: 'Just Starting',
    description: 'New to anime, show me the classics!',
    emoji: '🌱'
  },
  {
    id: 'intermediate',
    name: 'Watched Some',
    description: 'Seen a few popular ones, want more',
    emoji: '📺'
  },
  {
    id: 'expert',
    name: 'Anime Veteran',
    description: 'Deep into anime culture, surprise me!',
    emoji: '🎌'
  }
]

const CONTENT_PREFERENCES = [
  { id: 'action', name: 'Action-Packed', emoji: '⚔️' },
  { id: 'story', name: 'Story-Driven', emoji: '📖' },
  { id: 'character', name: 'Character-Focused', emoji: '👥' },
  { id: 'visual', name: 'Visually Stunning', emoji: '🎨' },
  { id: 'comedy', name: 'Funny & Lighthearted', emoji: '😄' },
  { id: 'emotional', name: 'Emotional & Deep', emoji: '💙' }
]

const LENGTH_PREFERENCES = [
  { id: 'short', name: 'Short (1-13 episodes)', emoji: '⚡', description: 'Quick and concise stories' },
  { id: 'medium', name: 'Medium (13-26 episodes)', emoji: '📖', description: 'Perfect balance' },
  { id: 'long', name: 'Long (26+ episodes)', emoji: '📚', description: 'Epic adventures' },
  { id: 'movies', name: 'Movies', emoji: '🎬', description: 'Feature-length films' },
  { id: 'any', name: 'Any Length', emoji: '🌟', description: "I'll watch anything good!" }
]

const TAG_OPTIONS = [
  { id: 'dark', name: 'Dark & Intense', emoji: '🌑' },
  { id: 'wholesome', name: 'Wholesome', emoji: '💝' },
  { id: 'action-packed', name: 'Action-Packed', emoji: '💥' },
  { id: 'emotional', name: 'Emotional', emoji: '😢' },
  { id: 'comedy', name: 'Comedy', emoji: '😄' },
  { id: 'romantic', name: 'Romantic', emoji: '💕' },
  { id: 'supernatural', name: 'Supernatural', emoji: '👻' },
  { id: 'slice-of-life', name: 'Slice of Life', emoji: '🍵' }
]

const AUDIO_PREFERENCES = [
  { id: 'sub', name: 'Subtitles (Original Japanese)', emoji: '🎌', description: 'Original voices with subtitles' },
  { id: 'dub', name: 'Dubbed (English Voices)', emoji: '🎙️', description: 'English voice acting' },
  { id: 'both', name: 'Both Are Fine', emoji: '🌐', description: "I don't have a preference" }
]

const STREAMING_PLATFORMS = [
  { id: 'crunchyroll', name: 'Crunchyroll', emoji: '🟠' },
  { id: 'funimation', name: 'Funimation', emoji: '🔵' },
  { id: 'netflix', name: 'Netflix', emoji: '🔴' },
  { id: 'hulu', name: 'Hulu', emoji: '🟢' },
  { id: 'amazon-prime', name: 'Amazon Prime', emoji: '💙' },
  { id: 'hidive', name: 'HIDIVE', emoji: '🟣' },
  { id: 'other', name: 'Other', emoji: '📺' }
]

const DISCOVERY_MODES = [
  {
    id: 'focused',
    name: 'Focused',
    description: 'Stick to what I know and love',
    icon: Target,
    emoji: '🎯'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Mix of favorites and new discoveries',
    icon: Sparkles,
    emoji: '⚖️'
  },
  {
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Surprise me with new genres!',
    icon: Compass,
    emoji: '🌍'
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Step data
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [contentPreferences, setContentPreferences] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [audioPreference, setAudioPreference] = useState<'sub' | 'dub' | 'both'>('both')
  const [streamingPlatforms, setStreamingPlatforms] = useState<string[]>([])
  const [preferredLength, setPreferredLength] = useState<string[]>([])
  const [discoveryMode, setDiscoveryMode] = useState<'focused' | 'balanced' | 'exploratory'>('balanced')

  // Data from API
  const [genres, setGenres] = useState<Genre[]>([])
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 9 // Total steps including welcome
  const totalQuestions = 8 // Actual questions (excluding welcome)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'
  const getAuthHeaders = (): Record<string, string> => {
    // Check both localStorage (Remember Me) and sessionStorage (current session)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    return headers
  }

  // Popular genres to show in onboarding (limited selection)
  const POPULAR_GENRE_NAMES = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Mystery',
    'Thriller',
    'Horror',
    'Sports',
    'Supernatural',
    'Psychological',
    'Mecha',
    'Music'
  ]

  // Fetch genres on mount
  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await fetch(`${API_URL}/anime.getGenres`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        const data = await response.json()
        if (data.result?.data) {
          // Filter to only show popular genres
          const allGenres = data.result.data
          const popularGenres = allGenres.filter((genre: Genre) => 
            POPULAR_GENRE_NAMES.includes(genre.name)
          )
          // Sort by the order in POPULAR_GENRE_NAMES
          popularGenres.sort((a: Genre, b: Genre) => {
            const indexA = POPULAR_GENRE_NAMES.indexOf(a.name)
            const indexB = POPULAR_GENRE_NAMES.indexOf(b.name)
            return indexA - indexB
          })
          setGenres(popularGenres)
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err)
      }
    }

    fetchGenres()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  async function handleComplete() {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/onboarding.completeOnboarding`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          favoriteGenres: selectedGenres,
          ratings: [],
          favoriteTags: selectedTags,
          discoveryMode
        })
      })

      const data = await response.json()
      
      if (data.error) {
        setError(data.error.message || 'Failed to complete onboarding')
        return
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSkip() {
    try {
      await fetch(`${API_URL}/onboarding.skipOnboarding`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      router.push('/dashboard')
    } catch (err) {
      router.push('/dashboard')
    }
  }

  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId))
    } else if (selectedGenres.length < 8) {
      setSelectedGenres([...selectedGenres, genreId])
    }
  }

  const toggleContentPref = (prefId: string) => {
    if (contentPreferences.includes(prefId)) {
      setContentPreferences(contentPreferences.filter(id => id !== prefId))
    } else if (contentPreferences.length < 3) {
      setContentPreferences([...contentPreferences, prefId])
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else if (selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const toggleLength = (lengthId: string) => {
    if (preferredLength.includes(lengthId)) {
      setPreferredLength(preferredLength.filter(id => id !== lengthId))
    } else {
      setPreferredLength([...preferredLength, lengthId])
    }
  }

  const togglePlatform = (platformId: string) => {
    if (streamingPlatforms.includes(platformId)) {
      setStreamingPlatforms(streamingPlatforms.filter(id => id !== platformId))
    } else {
      setStreamingPlatforms([...streamingPlatforms, platformId])
    }
  }

  const canProceedFromStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1: return true // Welcome
      case 2: return true // Experience level has default
      case 3: return selectedGenres.length >= 3 // Genres required
      case 4: return contentPreferences.length >= 2 // Content prefs required
      case 5: return true // Tags are optional
      case 6: return true // Audio preference has default
      case 7: return true // Streaming platforms optional
      case 8: return preferredLength.length >= 1 // At least one length
      case 9: return true // Discovery mode has default
      default: return false
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

          <main className="container mx-auto px-4 pt-20 pb-20 relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Progress Bar - Only show for questions (not welcome) */}
              {step > 1 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Question {step - 1} of {totalQuestions}</span>
                    <button
                      onClick={handleSkip}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Skip for now
                    </button>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                      style={{ width: `${((step - 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              )}

            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Welcome to AnimeSenpai{user?.name ? `, ${user.name}` : ''}!
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Let's find anime you'll love! Answer a few quick questions and Senpai will curate perfect recommendations just for you.
                </p>
                <p className="text-gray-400 mb-8">
                  Takes about 2 minutes • Totally worth it
                </p>
                <Button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-3 rounded-xl"
                >
                  Let's Go! <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step 2: Experience Level */}
            {step === 2 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  How much anime have you watched?
                </h2>
                <p className="text-gray-400 mb-8">
                  This helps us recommend the right level of content
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setExperienceLevel(level.id as any)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        experienceLevel === level.id
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{level.emoji}</div>
                        <div className="text-white font-semibold mb-2">{level.name}</div>
                        <div className="text-sm text-gray-400">{level.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Pick Favorite Genres */}
            {step === 3 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  What genres do you love?
                </h2>
                <p className="text-gray-400 mb-8">
                  Pick at least 3 genres (up to 8) • Popular genres only
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
                    <p className="text-error-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {genres.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedGenres.includes(genre.id)
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {selectedGenres.includes(genre.id) ? '✨' : '🎬'}
                        </div>
                        <div className="text-white font-medium">{genre.name}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-gray-400">
                    {selectedGenres.length} selected (minimum 3)
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={selectedGenres.length < 3}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50"
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Content Preferences */}
            {step === 4 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  What matters most to you?
                </h2>
                <p className="text-gray-400 mb-8">
                  Pick at least 2 aspects you value in anime (up to 3)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {CONTENT_PREFERENCES.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => toggleContentPref(pref.id)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        contentPreferences.includes(pref.id)
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{pref.emoji}</div>
                        <div className="text-white font-medium text-sm">{pref.name}</div>
                        {contentPreferences.includes(pref.id) && (
                          <div className="mt-2">
                            <Check className="h-4 w-4 text-primary-400 mx-auto" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-400 text-sm">
                    {contentPreferences.length} selected (minimum 2, maximum 3)
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(5)}
                    disabled={contentPreferences.length < 2}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Pick Favorite Tags/Vibes */}
            {step === 5 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  What vibe are you looking for?
                </h2>
                <p className="text-gray-400 mb-8">
                  Pick themes that resonate with you (optional)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedTags.includes(tag.id)
                          ? 'bg-secondary-500/20 border-secondary-500 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-3xl mb-2">{tag.emoji}</div>
                      <div className="text-white font-medium text-sm">{tag.name}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(4)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(6)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Audio Preference */}
            {step === 6 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Sub or Dub?
                </h2>
                <p className="text-gray-400 mb-8">
                  How do you prefer to watch anime?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {AUDIO_PREFERENCES.map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => setAudioPreference(pref.id as any)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        audioPreference === pref.id
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{pref.emoji}</div>
                        <div className="text-white font-semibold mb-2">{pref.name}</div>
                        <div className="text-sm text-gray-400">{pref.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(5)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(7)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7: Streaming Platforms */}
            {step === 7 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Where do you watch anime?
                </h2>
                <p className="text-gray-400 mb-8">
                  Select the streaming platforms you use (optional)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {STREAMING_PLATFORMS.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        streamingPlatforms.includes(platform.id)
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{platform.emoji}</div>
                        <div className="text-white font-medium text-sm">{platform.name}</div>
                        {streamingPlatforms.includes(platform.id) && (
                          <div className="mt-2">
                            <Check className="h-4 w-4 text-primary-400 mx-auto" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(6)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(8)}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 8: Preferred Length */}
            {step === 8 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  How long should your anime be?
                </h2>
                <p className="text-gray-400 mb-8">
                  Pick your preferred anime lengths (select all that apply)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {LENGTH_PREFERENCES.map(length => (
                    <button
                      key={length.id}
                      onClick={() => toggleLength(length.id)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        preferredLength.includes(length.id)
                          ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{length.emoji}</div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium mb-1">{length.name}</div>
                          <div className="text-sm text-gray-400">{length.description}</div>
                        </div>
                        {preferredLength.includes(length.id) && (
                          <Check className="h-5 w-5 text-primary-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(7)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(9)}
                    disabled={preferredLength.length < 1}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 9: Discovery Preference */}
            {step === 9 && (
              <div className="glass rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  How adventurous are you?
                </h2>
                <p className="text-gray-400 mb-8">
                  Choose how we recommend anime to you
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {DISCOVERY_MODES.map(mode => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setDiscoveryMode(mode.id as any)}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          discoveryMode === mode.id
                            ? 'bg-primary-500/20 border-primary-500 shadow-lg shadow-primary-500/25'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="text-4xl mb-3">{mode.emoji}</div>
                        <h3 className="text-white font-bold text-lg mb-2">{mode.name}</h3>
                        <p className="text-gray-300 text-sm">{mode.description}</p>
                        {discoveryMode === mode.id && (
                          <div className="mt-3 flex justify-center">
                            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
                    <p className="text-error-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={() => setStep(8)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Zap className="mr-2 h-4 w-4 animate-pulse" />
                        Creating Your Experience...
                      </>
                    ) : (
                      <>
                        Complete Setup <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}

