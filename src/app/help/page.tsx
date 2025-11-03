'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  ChevronDown,
  Search,
  HelpCircle,
  Mail,
  BookOpen,
  User,
  Star,
  Bookmark,
  Shield,
  Settings,
  Zap,
  MessageCircle,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is AnimeSenpai?',
    answer:
      'AnimeSenpai is your ultimate anime companion! Track what you watch, discover new favorites based on your tastes, rate and review anime, and connect with other anime fans. We use advanced ML recommendations to help you find your next favorite show.',
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer:
      'Click "Sign Up" in the top right corner, enter your email, create a username and password, and verify your email. After that, you\'ll go through a quick onboarding to help us understand your anime preferences!',
  },
  {
    category: 'Getting Started',
    question: 'Is AnimeSenpai free?',
    answer:
      'Yes! AnimeSenpai is completely free to use. All features including recommendations, list management, and social features are available at no cost.',
  },

  // Account & Profile
  {
    category: 'Account & Profile',
    question: 'How do I change my username?',
    answer:
      "Go to Settings → Profile tab and update your username. Make sure it's unique and at least 2 characters long.",
  },
  {
    category: 'Account & Profile',
    question: 'How do I upload an avatar?',
    answer:
      'Go to your Profile page (click your avatar in the navbar → "Profile"), hover over your avatar, and click the camera icon. Choose an image file (max 2MB) and it will upload automatically!',
  },
  {
    category: 'Account & Profile',
    question: 'Can I reset my password?',
    answer:
      'Yes! On the sign-in page, click "Forgot password?" and enter your email. We\'ll send you a reset link that\'s valid for 1 hour.',
  },
  {
    category: 'Account & Profile',
    question: 'How do I make my profile private?',
    answer:
      'Go to Settings → Privacy tab and adjust what information is visible on your public profile (watch history, favorites, ratings, etc.).',
  },

  // Anime Lists
  {
    category: 'Anime Lists',
    question: 'How do I add anime to my list?',
    answer:
      'Click on any anime card to view its details, then click "Add to List". Choose a status (Watching, Completed, Plan to Watch, or Favorite) and it will be added to your collection!',
  },
  {
    category: 'Anime Lists',
    question: "What's the difference between Favorite and other statuses?",
    answer:
      'Favorite is for anime you absolutely love! It\'s separate from your watch status. You can mark an anime as both "Completed" and "Favorite".',
  },
  {
    category: 'Anime Lists',
    question: 'How do I rate anime?',
    answer:
      'Add the anime to your list first, then click "Rate Anime" on the detail page. You can rate from 1-10 stars and optionally write a review!',
  },
  {
    category: 'Anime Lists',
    question: 'Can I search my own list?',
    answer:
      'Yes! Go to "My List" and use the search bar to find anime by title or studio. You can also filter by category and sort by different criteria.',
  },

  // Recommendations
  {
    category: 'Recommendations',
    question: 'How do recommendations work?',
    answer:
      'We use a triple-hybrid system: content-based filtering (genre/tags), collaborative filtering (similar users), and ML embeddings (semantic similarity). The more anime you add and rate, the better your recommendations become!',
  },
  {
    category: 'Recommendations',
    question: 'Why am I seeing the same recommendations?',
    answer:
      "Try rating more anime! Our algorithm improves as you interact with the platform. Also complete the onboarding if you haven't already - it helps us understand your preferences.",
  },
  {
    category: 'Recommendations',
    question: 'Can I see what my friends are watching?',
    answer:
      'Yes! Follow other users and you\'ll see "Your Friends Are Watching" on your dashboard. This shows popular anime among people you follow.',
  },

  // Features
  {
    category: 'Features',
    question: 'Where can I watch the anime?',
    answer:
      'On each anime detail page, we show "Where to Watch" with links to streaming platforms like Crunchyroll, Funimation, Netflix, and Hulu (when available).',
  },
  {
    category: 'Features',
    question: 'Can I see anime trailers?',
    answer:
      'Yes! Many anime have trailers on their detail pages. Just click play on the trailer preview at the top of the page.',
  },
  {
    category: 'Features',
    question: 'How do I find related seasons?',
    answer:
      'When viewing an anime, scroll down to the "More from this Series" section to see other seasons and related content from the same franchise.',
  },
  {
    category: 'Features',
    question: "Can I see other users' profiles?",
    answer:
      'Yes! Click on any username to view their public profile. You can see their stats, favorites, and recent activity (depending on their privacy settings).',
  },

  // Technical
  {
    category: 'Troubleshooting',
    question: "Why can't I sign in?",
    answer:
      'Make sure you\'ve verified your email address. Check your spam folder for the verification email. If you forgot your password, use the "Forgot password?" link on the sign-in page.',
  },
  {
    category: 'Troubleshooting',
    question: "Images aren't loading. What should I do?",
    answer:
      'Try refreshing the page. If the problem persists, it might be a temporary connection issue with our image server. Images should load within a few seconds.',
  },
  {
    category: 'Troubleshooting',
    question: 'The site is running slow. How can I fix it?',
    answer:
      'Try clearing your browser cache and cookies. Also ensure you have a stable internet connection. If problems persist, try a different browser.',
  },
  {
    category: 'Troubleshooting',
    question: 'I found a bug. How do I report it?',
    answer:
      'We appreciate your feedback! Please email us with details about the bug, what you were doing when it occurred, and your browser/device information.',
  },

  // Privacy & Security
  {
    category: 'Privacy & Security',
    question: 'Is my data safe?',
    answer:
      'Yes! We use industry-standard encryption for passwords, secure authentication tokens, and follow GDPR guidelines. We never sell your data or share it with third parties.',
  },
  {
    category: 'Privacy & Security',
    question: 'Can I delete my account?',
    answer:
      "Yes. Go to Settings → Security tab and you'll find the option to delete your account. This action is permanent and cannot be undone.",
  },
  {
    category: 'Privacy & Security',
    question: 'Do you use cookies?',
    answer:
      'Yes, we use essential cookies for authentication and user preferences. We also use analytics cookies (with your consent) to improve the platform. You can manage cookie preferences in the banner at the bottom of the page.',
  },
]

const categories = [
  'Getting Started',
  'Account & Profile',
  'Anime Lists',
  'Recommendations',
  'Features',
  'Troubleshooting',
  'Privacy & Security',
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openFAQs, setOpenFAQs] = useState<Set<number>>(new Set())

  const toggleFAQ = (index: number) => {
    const newOpenFAQs = new Set(openFAQs)
    if (newOpenFAQs.has(index)) {
      newOpenFAQs.delete(index)
    } else {
      newOpenFAQs.add(index)
    }
    setOpenFAQs(newOpenFAQs)
  }

  // Filter FAQs by search and category
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || faq.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categoryIcons: Record<string, any> = {
    'Getting Started': BookOpen,
    'Account & Profile': User,
    'Anime Lists': Bookmark,
    Recommendations: Star,
    Features: Zap,
    Troubleshooting: HelpCircle,
    'Privacy & Security': Shield,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-primary-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-xl text-gray-300">
              Find answers to common questions about AnimeSenpai
            </p>
          </div>

          {/* Search Bar */}
          <div className="glass rounded-2xl p-1 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={`${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              }`}
            >
              All Topics
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || HelpCircle
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category}
                </Button>
              )
            })}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Link href="/dashboard">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bookmark className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Browse Anime</h3>
                <p className="text-gray-400 text-sm">Discover thousands of anime titles</p>
              </div>
            </Link>
            <Link href="/user/settings">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-secondary-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Account Settings</h3>
                <p className="text-gray-400 text-sm">Manage your profile and preferences</p>
              </div>
            </Link>
            <a href="mailto:support@animesenpai.com">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-success-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Contact Support</h3>
                <p className="text-gray-400 text-sm">Get help from our team</p>
              </div>
            </a>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-6">
                  Try different keywords or browse all categories
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredFAQs.map((faq, index) => {
                const isOpen = openFAQs.has(index)
                const Icon = categoryIcons[faq.category] || HelpCircle

                return (
                  <div key={index} className="glass rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left hover:bg-white/5 transition-colors flex items-start gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge className="bg-primary-500/20 text-primary-400 border-0 mb-2 text-xs">
                              {faq.category}
                            </Badge>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {faq.question}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                              isOpen ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                        {isOpen && (
                          <p className="text-gray-300 mt-3 leading-relaxed">{faq.answer}</p>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Still Need Help? */}
          <div className="glass rounded-2xl p-8 mt-12 text-center">
            <MessageCircle className="h-12 w-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Still need help?</h2>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@animesenpai.com">
                <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </a>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Link href="/terms">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary-400" />
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">
                      Terms of Service
                    </h3>
                    <p className="text-gray-400 text-sm">Read our terms and conditions</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/privacy">
              <div className="glass rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-secondary-400" />
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-secondary-400 transition-colors">
                      Privacy Policy
                    </h3>
                    <p className="text-gray-400 text-sm">Learn how we protect your data</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
