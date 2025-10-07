import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Hero Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-12 w-80 mb-4 bg-white/10" />
          <Skeleton className="h-6 w-96 bg-white/5" />
        </div>

        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-10 w-32 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[2/3] bg-white/10" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-3 w-2/3 bg-white/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 bg-white/5" />
                    <Skeleton className="h-5 w-16 bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-12">
          <Skeleton className="h-8 w-48 mb-6 bg-white/10" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[2/3] bg-white/10" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-3 w-2/3 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

