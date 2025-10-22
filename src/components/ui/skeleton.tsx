import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-white/10', className)} {...props} />
}

// Shimmer effect skeleton (more polished)
function ShimmerSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-white/5',
        'before:absolute before:inset-0',
        'before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/10 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

// Anime Card Skeleton
function AnimeCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Image skeleton */}
      <div className="aspect-[2/3] bg-white/5 relative overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// Profile Header Skeleton
function ProfileHeaderSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden mb-8">
      {/* Cover */}
      <Skeleton className="h-32 w-full" />

      {/* Profile Info */}
      <div className="px-8 pb-8 -mt-12 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 justify-between">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <Skeleton className="w-24 h-24 rounded-2xl" />

            {/* User Info */}
            <div className="pb-2">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Search Result Skeleton
function SearchResultSkeleton() {
  return (
    <div className="glass rounded-xl p-4 flex gap-4">
      <Skeleton className="w-20 h-28 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// List Item Skeleton (for MyList)
function ListItemSkeleton() {
  return (
    <div className="glass rounded-xl p-6 flex items-center gap-4">
      <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  )
}

// Carousel Skeleton
function CarouselSkeleton({ itemCount = 5 }: { itemCount?: number }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Detail Page Hero Skeleton
function DetailHeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Poster */}
      <div className="lg:col-span-1">
        <Skeleton className="aspect-[2/3] rounded-2xl" />
      </div>

      {/* Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title Card */}
        <div className="glass rounded-2xl p-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>

        {/* Genres */}
        <div className="glass rounded-xl p-6">
          <Skeleton className="h-6 w-24 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/10">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className={cn('h-10', i === 0 ? 'w-12' : 'flex-1')} />
      ))}
    </div>
  )
}

// Form Skeleton
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  )
}

// Comment/Review Skeleton
function CommentSkeleton() {
  return (
    <div className="flex gap-4 p-4 glass rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  )
}

// Grid Skeleton (for dashboards, galleries)
function GridSkeleton({ items = 8, columns = 4 }: { items?: number; columns?: number }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        columns === 5 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Page Skeleton (full page loading)
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <GridSkeleton items={8} columns={4} />
      </div>
    </div>
  )
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Carousel Sections */}
      <CarouselSkeleton itemCount={5} />
      <CarouselSkeleton itemCount={5} />
      <CarouselSkeleton itemCount={5} />
    </div>
  )
}

export {
  Skeleton,
  ShimmerSkeleton,
  AnimeCardSkeleton,
  StatsCardSkeleton,
  ProfileHeaderSkeleton,
  SearchResultSkeleton,
  ListItemSkeleton,
  CarouselSkeleton,
  DetailHeroSkeleton,
  TableRowSkeleton,
  FormSkeleton,
  CommentSkeleton,
  GridSkeleton,
  PageSkeleton,
  DashboardSkeleton,
}
