'use client'

import {
  ArrowUpDown,
  Star,
  Calendar,
  TrendingUp,
  Hash,
  Clock,
  Eye,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

export type SortOption =
  | 'relevance'
  | 'rating_desc'
  | 'rating_asc'
  | 'year_desc'
  | 'year_asc'
  | 'title_asc'
  | 'title_desc'
  | 'popularity_desc'
  | 'popularity_asc'
  | 'episodes_desc'
  | 'episodes_asc'
  | 'recently_added'

interface SortOptionsProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

const sortOptions: Array<{
  value: SortOption
  label: string
  icon: any
  description: string
}> = [
  {
    value: 'relevance',
    label: 'Relevance',
    icon: ArrowUpDown,
    description: 'Best match for your search',
  },
  {
    value: 'rating_desc',
    label: 'Highest Rated',
    icon: Star,
    description: 'Top rated anime first',
  },
  {
    value: 'rating_asc',
    label: 'Lowest Rated',
    icon: Star,
    description: 'Lower rated anime first',
  },
  {
    value: 'year_desc',
    label: 'Newest First',
    icon: Calendar,
    description: 'Most recent releases',
  },
  {
    value: 'year_asc',
    label: 'Oldest First',
    icon: Calendar,
    description: 'Classic anime first',
  },
  {
    value: 'popularity_desc',
    label: 'Most Popular',
    icon: TrendingUp,
    description: 'Trending and popular',
  },
  {
    value: 'popularity_asc',
    label: 'Least Popular',
    icon: TrendingUp,
    description: 'Hidden gems',
  },
  {
    value: 'title_asc',
    label: 'Title (A-Z)',
    icon: Hash,
    description: 'Alphabetical order',
  },
  {
    value: 'title_desc',
    label: 'Title (Z-A)',
    icon: Hash,
    description: 'Reverse alphabetical',
  },
  {
    value: 'episodes_desc',
    label: 'Most Episodes',
    icon: Clock,
    description: 'Longest series first',
  },
  {
    value: 'episodes_asc',
    label: 'Fewest Episodes',
    icon: Clock,
    description: 'Short series first',
  },
  {
    value: 'recently_added',
    label: 'Recently Added',
    icon: Eye,
    description: 'Newest to database',
  },
]

export function SortOptions({ value, onChange, className }: SortOptionsProps) {
  const currentOption = sortOptions.find((opt) => opt.value === value)
  const Icon = currentOption?.icon || ArrowUpDown

  return (
    <div className={cn('relative group', className)}>
      {/* Mobile: Dropdown Select */}
      <div className="md:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:border-primary-400/50 appearance-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Custom Dropdown */}
      <div className="hidden md:block">
        <button className="flex items-center gap-2 bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:border-primary-400/50 whitespace-nowrap">
          <Icon className="w-4 h-4" />
          <span>{currentOption?.label || 'Sort'}</span>
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
          <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
            {sortOptions.map((option) => {
              const OptionIcon = option.icon
              const isSelected = value === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-3 group/item',
                    isSelected
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                  )}
                >
                  <OptionIcon
                    className={cn(
                      'w-4 h-4 mt-0.5 flex-shrink-0',
                      isSelected ? 'text-primary-400' : 'text-gray-400 group-hover/item:text-white'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-primary-300' : 'text-white'
                      )}
                    >
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{option.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for mobile/tight spaces
export function SortOptionsCompact({ value, onChange }: SortOptionsProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:border-primary-400/50 appearance-none"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-900">
          {option.label}
        </option>
      ))}
    </select>
  )
}
