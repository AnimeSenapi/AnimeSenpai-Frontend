'use client'

import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Home, Search, ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-32">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go back
        </button>

        {/* 404 Card */}
        <div className="glass rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-white/10">
          {/* 404 Number - Large and Eye-catching */}
          <div className="mb-8">
            <h1 className="text-[120px] md:text-[160px] font-bold leading-none mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent animate-pulse">
                404
              </span>
            </h1>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center">
              <Compass className="h-8 w-8 text-primary-400" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Page Not Found</h2>

          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            This page seems to have wandered off. Let's get you back on track.
          </p>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Anime
              </Button>
            </Link>
          </div>

          {/* Popular Destinations */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-gray-500 text-sm mb-4">Popular pages</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/mylist"
                className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all border border-white/10"
              >
                My List
              </Link>
              <Link
                href="/social/friends"
                className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all border border-white/10"
              >
                Friends
              </Link>
              <Link
                href="/user/settings"
                className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all border border-white/10"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Lost? Try using the search bar in the navbar
        </p>
      </div>
    </div>
  )
}
