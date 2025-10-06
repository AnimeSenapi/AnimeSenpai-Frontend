'use client'

import Link from 'next/link'
import { Button } from '../components/ui/button'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>

          {/* Error Content */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
            <h1 className="text-8xl font-bold text-white mb-4">404</h1>
            <h2 className="text-3xl font-bold text-white mb-6">
              Page Not Found
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-lg mx-auto">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button
                onClick={() => window.location.href = '/search'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Anime
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Pages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/dashboard"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/search"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Search
                </Link>
                <Link 
                  href="/mylist"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  My List
                </Link>
                <Link 
                  href="/user/profile"
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
