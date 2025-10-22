import { Skeleton } from '@/components/ui/skeleton'

export default function MyListLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-12 w-64 mb-4 bg-white/10" />
          <Skeleton className="h-6 w-96 bg-white/5" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-6">
              <Skeleton className="h-6 w-20 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/5" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 bg-white/5" />
          ))}
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex gap-6">
              <Skeleton className="w-32 h-48 rounded-xl bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-2/3 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-5/6 bg-white/5" />
                <div className="flex gap-4 mt-4">
                  <Skeleton className="h-8 w-32 bg-white/5" />
                  <Skeleton className="h-8 w-32 bg-white/5" />
                  <Skeleton className="h-8 w-32 bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
