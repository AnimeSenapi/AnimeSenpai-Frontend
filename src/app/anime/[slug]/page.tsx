import { notFound } from 'next/navigation'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { BackButton } from '../../../components/ui/back-button'
import { Anime } from '../../../types/anime'
import { getTagById } from '../../../types/tags'
import { 
  Play, 
  Bookmark, 
  Heart, 
  Share2, 
  Star, 
  Calendar, 
  Clock, 
  Users, 
  Award
} from 'lucide-react'

// Enable ISR (Incremental Static Regeneration)
// Pages will be regenerated at most once every 3600 seconds (1 hour)
export const revalidate = 3600 // Revalidate every hour

// Generate static params for popular anime at build time
export async function generateStaticParams() {
  // In production, this would fetch from your database
  // For now, we'll generate for the known anime from mock data
  const popularAnime = [
    'attack-on-titan',
    'demon-slayer',
    'one-piece',
    'jujutsu-kaisen',
    'chainsaw-man',
    'my-hero-academia',
  ]
  
  return popularAnime.map((slug) => ({
    slug: slug,
  }))
}

// Mock data - in a real app, this would come from an API
const mockAnimeData: Record<string, Anime & {
  description: string
  director: string
  cast: string[]
  relatedAnime: Anime[]
  reviews: {
    rating: number
    comment: string
    user: string
  }[]
}> = {
  'attack-on-titan': {
    id: '1',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    year: 2023,
    rating: 9.2,
    status: 'new',
    tags: ['action', 'drama', 'supernatural'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio',
    description: 'Humanity fights for survival against the Titans, giant humanoid creatures that devour humans seemingly without reason. Eren Yeager joins the military to avenge his mother and protect what remains of humanity.',
    director: 'Tetsuro Araki',
    cast: ['Yuki Kaji', 'Yui Ishikawa', 'Marina Inoue'],
    relatedAnime: [
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
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Absolutely incredible! The animation and story are top-tier.',
        user: 'AnimeFan123'
      },
      {
        rating: 5,
        comment: 'One of the best anime I\'ve ever watched. Highly recommended!',
        user: 'OtakuMaster'
      }
    ]
  },
  'demon-slayer': {
    id: '2',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    year: 2023,
    rating: 9.1,
    status: 'trending',
    tags: ['action', 'supernatural', 'shounen'],
    episodes: 26,
    duration: 23,
    studio: 'Ufotable',
    description: 'Tanjiro Kamado becomes a demon slayer after his family is slaughtered by demons. He sets out on a journey to find a way to turn his demon sister back into a human.',
    director: 'Haruo Sotozaki',
    cast: ['Natsuki Hanae', 'Akari Kitō', 'Hiro Shimono'],
    relatedAnime: [
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
      }
    ],
    reviews: [
      {
        rating: 5,
        comment: 'The animation quality is absolutely stunning!',
        user: 'DemonSlayerFan'
      }
    ]
  },
  'one-piece': {
    id: '3',
    slug: 'one-piece',
    title: 'One Piece',
    year: 2023,
    rating: 9.5,
    status: 'hot',
    tags: ['adventure', 'comedy', 'shounen'],
    episodes: 1000,
    duration: 24,
    studio: 'Toei Animation',
    description: 'Monkey D. Luffy sets out on a journey to become the Pirate King by finding the legendary treasure known as One Piece.',
    director: 'Eiichiro Oda',
    cast: ['Mayumi Tanaka', 'Kazuya Nakai', 'Akemi Okamura'],
    relatedAnime: [
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
      }
    ],
    reviews: [
      {
        rating: 5,
        comment: 'The greatest adventure anime of all time!',
        user: 'PirateKing'
      }
    ]
  },
  'fullmetal-alchemist': {
    id: '4',
    slug: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist',
    year: 2009,
    rating: 9.3,
    status: 'classic',
    tags: ['action', 'fantasy', 'drama'],
    episodes: 64,
    duration: 24,
    studio: 'Bones',
    description: 'Two brothers search for the Philosopher\'s Stone to restore their bodies after a failed alchemy experiment.',
    director: 'Seiji Mizushima',
    cast: ['Romi Park', 'Rie Kugimiya', 'Shinichiro Miki'],
    relatedAnime: [
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
      }
    ],
    reviews: [
      {
        rating: 5,
        comment: 'A masterpiece of storytelling and animation!',
        user: 'AlchemistFan'
      }
    ]
  },
  'jujutsu-kaisen': {
    id: '5',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    year: 2023,
    rating: 8.9,
    status: 'trending',
    tags: ['action', 'supernatural', 'school'],
    episodes: 24,
    duration: 24,
    studio: 'MAPPA',
    description: 'Yuji Itadori joins his school\'s Occult Club and becomes involved in the world of curses and sorcery.',
    director: 'Sunghoo Park',
    cast: ['Junya Enoki', 'Yuma Uchida', 'Asami Seto'],
    relatedAnime: [
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
      }
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Incredible animation and fight scenes!',
        user: 'JujutsuFan'
      }
    ]
  },
  'my-hero-academia': {
    id: '6',
    slug: 'my-hero-academia',
    title: 'My Hero Academia',
    year: 2023,
    rating: 8.7,
    status: 'hot',
    tags: ['action', 'school', 'shounen'],
    episodes: 138,
    duration: 24,
    studio: 'Bones',
    description: 'Izuku Midoriya dreams of becoming a hero in a world where most people have superpowers called Quirks.',
    director: 'Kenji Nagasaki',
    cast: ['Daiki Yamashita', 'Nobuhiko Okamoto', 'Ayane Sakura'],
    relatedAnime: [
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
      }
    ],
    reviews: [
      {
        rating: 5,
        comment: 'Plus Ultra! Amazing superhero anime!',
        user: 'HeroFan'
      }
    ]
  }
}

interface AnimePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { slug } = await params
  
  // Fetch anime from API
  let anime
  try {
    const { apiGetAnimeBySlug } = await import('../../lib/api')
    anime = await apiGetAnimeBySlug(slug)
  } catch (error) {
    console.error('Failed to load anime:', error)
    notFound()
  }

  if (!anime) {
    notFound()
  }

  // Extract data from API response
  const { title, year, rating, status, episodes, duration, studio, description, genres = [] } = anime
  const tags = genres.map((g) => g.name || g.slug)
  
  // These would come from API in production
  const director = studio || 'Unknown'
  const cast = ['Voice Actor 1', 'Voice Actor 2', 'Voice Actor 3']
  const relatedAnime: Anime[] = [] // Would come from API
  const reviews: Array<{ id: string; user: string; rating: number; comment: string }> = [] // Would come from API

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Anime Poster/Image */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary-500/20 text-primary-400 border-brand-primary-500/30">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>{year}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-primary-400 fill-current" />
                    <span>{rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anime Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary-400 fill-current" />
                  <span className="text-2xl font-bold text-white">{rating}</span>
                </div>
                <Badge className="bg-primary-500/20 text-primary-400 border-brand-primary-500/30 text-lg px-3 py-1">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Bookmark className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Anime Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary-400" />
                  <span className="text-sm text-gray-300">Year</span>
                </div>
                <span className="text-white font-semibold">{year}</span>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary-400" />
                  <span className="text-sm text-gray-300">Episodes</span>
                </div>
                <span className="text-white font-semibold">{episodes}</span>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary-400" />
                  <span className="text-sm text-gray-300">Duration</span>
                </div>
                <span className="text-white font-semibold">{duration}m</span>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-primary-400" />
                  <span className="text-sm text-gray-300">Studio</span>
                </div>
                <span className="text-white font-semibold">{studio}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tagId: string, index: number) => {
                  const tag = getTagById(tagId) || { name: tagId, color: 'bg-primary-500/20 text-primary-400' }
                  return tag ? (
                    <Badge key={index} className={tag.color}>
                      {tag.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed text-lg">{description}</p>
        </div>

        {/* Cast & Crew */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Cast</h3>
            <div className="space-y-2">
              {cast.map((actor, index) => (
                <div key={index} className="text-gray-300">{actor}</div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Director</h3>
            <div className="text-gray-300">{director}</div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="glass rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-primary-400 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">{review.user}</span>
                  </div>
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Anime */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Related Anime</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedAnime.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                variant="grid"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
