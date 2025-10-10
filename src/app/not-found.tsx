'use client'

import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="text-center max-w-2xl px-4">
          {/* 404 Animation */}
          <div className="mb-8">
            <h1 className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent leading-none animate-pulse">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="glass rounded-2xl p-8 md:p-12 mb-8">
            <div className="mb-6">
              <span className="text-6xl mb-4 block">🔍</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Page Not Found
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Oops! The page you're looking for doesn't exist.
              </p>
              <p className="text-gray-400">
                It might have been moved, deleted, or the URL might be incorrect.
              </p>
            </div>

            {/* Popular Pages */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <p className="text-sm text-gray-400 mb-4">Here are some helpful links instead:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Anime
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>
      </main>
    </div>
  )
}
