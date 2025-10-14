import { Activity } from 'lucide-react'

export default function ActivityLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
            <div>
              <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
          
          {/* Filter Skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Activity Items Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="glass rounded-xl p-4 border border-white/10">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="w-16 h-24 bg-white/5 rounded-lg animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

