import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Search Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-12 w-64 mb-4 bg-white/10" />
          <Skeleton className="h-6 w-96 bg-white/5" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Skeleton className="h-10 w-32 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
          <Skeleton className="h-10 w-32 bg-white/5" />
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-48 bg-white/5" />
        </div>

        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <Skeleton className="aspect-[2/3] bg-white/10" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-2/3 bg-white/5" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12 bg-white/5" />
                  <Skeleton className="h-5 w-12 bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

