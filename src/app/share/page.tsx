'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Search, Plus, ArrowLeft } from 'lucide-react'

export default function SharePage() {
  const [sharedData, setSharedData] = useState<{
    title?: string
    text?: string
    url?: string
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Handle shared data from PWA
    const handleSharedData = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const title = urlParams.get('title') || ''
      const text = urlParams.get('text') || ''
      const url = urlParams.get('url') || ''

      setSharedData({ title, text, url })
      setIsLoading(false)
    }

    // Check if we're in a PWA context
    if ('share' in navigator) {
      handleSharedData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSearchAnime = () => {
    if (sharedData.title) {
      router.push(`/search?q=${encodeURIComponent(sharedData.title)}`)
    } else {
      router.push('/search')
    }
  }

  const handleAddToList = () => {
    if (sharedData.title) {
      router.push(`/search?q=${encodeURIComponent(sharedData.title)}&action=add`)
    } else {
      router.push('/search')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Processing shared content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Share to AnimeSenpai</h1>
              <p className="text-gray-400">Add anime to your list or discover new shows</p>
            </div>
          </div>

          {/* Shared Content */}
          {sharedData.title && (
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {sharedData.title}
                  </h3>
                  {sharedData.text && (
                    <p className="text-gray-400 text-sm mb-2">
                      {sharedData.text}
                    </p>
                  )}
                  {sharedData.url && (
                    <a
                      href={sharedData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                    >
                      {sharedData.url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleSearchAnime}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3"
            >
              <Search className="w-5 h-5" />
              <span>Search for "{sharedData.title || 'anime'}"</span>
            </button>

            <button
              onClick={handleAddToList}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-3"
            >
              <Plus className="w-5 h-5" />
              <span>Add to My List</span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/discover')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Discover
              </button>
              <button
                onClick={() => router.push('/mylist')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                My List
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <h4 className="text-white font-semibold mb-2">How to share to AnimeSenpai:</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Share anime links from other apps</li>
              <li>• Share anime titles from text messages</li>
              <li>• Share anime recommendations from friends</li>
              <li>• Use the share button in your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
