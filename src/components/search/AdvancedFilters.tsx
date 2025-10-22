'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building,
  Tag,
  Film,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface AdvancedFiltersProps {
  // Data
  genres: string[]
  studios: string[]
  seasons: string[]
  years: string[]
  statuses?: string[]
  types?: string[]

  // Selected values
  selectedGenres: string[]
  selectedStudios: string[]
  selectedSeasons: string[]
  selectedYears: string[]
  selectedStatuses?: string[]
  selectedTypes?: string[]
  minRating?: number
  maxRating?: number
  minYear?: number
  maxYear?: number

  // Callbacks
  onGenresChange: (genres: string[]) => void
  onStudiosChange: (studios: string[]) => void
  onSeasonsChange: (seasons: string[]) => void
  onYearsChange: (years: string[]) => void
  onStatusesChange?: (statuses: string[]) => void
  onTypesChange?: (types: string[]) => void
  onRatingChange?: (min: number, max: number) => void
  onYearRangeChange?: (min: number, max: number) => void
  onClearAll: () => void
}

export function AdvancedFilters({
  genres,
  studios,
  seasons,
  years,
  statuses = ['Finished Airing', 'Currently Airing', 'Not Yet Aired'],
  types = ['TV', 'Movie', 'OVA', 'ONA', 'Special'],
  selectedGenres,
  selectedStudios,
  selectedSeasons,
  selectedYears,
  selectedStatuses = [],
  selectedTypes = [],
  minRating = 0,
  maxRating = 10,
  onGenresChange,
  onStudiosChange,
  onSeasonsChange,
  onYearsChange,
  onStatusesChange,
  onTypesChange,
  onRatingChange,
  onClearAll,
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    genres: true,
    studios: false,
    seasons: false,
    years: false,
    status: false,
    type: false,
    rating: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleFilter = (
    type: 'genre' | 'studio' | 'season' | 'year' | 'status' | 'type',
    value: string
  ) => {
    switch (type) {
      case 'genre':
        onGenresChange(
          selectedGenres.includes(value)
            ? selectedGenres.filter((g) => g !== value)
            : [...selectedGenres, value]
        )
        break
      case 'studio':
        onStudiosChange(
          selectedStudios.includes(value)
            ? selectedStudios.filter((s) => s !== value)
            : [...selectedStudios, value]
        )
        break
      case 'season':
        onSeasonsChange(
          selectedSeasons.includes(value)
            ? selectedSeasons.filter((s) => s !== value)
            : [...selectedSeasons, value]
        )
        break
      case 'year':
        onYearsChange(
          selectedYears.includes(value)
            ? selectedYears.filter((y) => y !== value)
            : [...selectedYears, value]
        )
        break
      case 'status':
        if (onStatusesChange) {
          onStatusesChange(
            selectedStatuses.includes(value)
              ? selectedStatuses.filter((s) => s !== value)
              : [...selectedStatuses, value]
          )
        }
        break
      case 'type':
        if (onTypesChange) {
          onTypesChange(
            selectedTypes.includes(value)
              ? selectedTypes.filter((t) => t !== value)
              : [...selectedTypes, value]
          )
        }
        break
    }
  }

  const activeFiltersCount =
    selectedGenres.length +
    selectedStudios.length +
    selectedSeasons.length +
    selectedYears.length +
    selectedStatuses.length +
    selectedTypes.length

  const FilterSection = ({
    title,
    icon: Icon,
    sectionKey,
    items,
    selected,
    onToggle,
    maxHeight = 'max-h-48',
  }: {
    title: string
    icon: any
    sectionKey: string
    items: string[]
    selected: string[]
    onToggle: (value: string) => void
    maxHeight?: string
  }) => (
    <div className="glass rounded-xl p-4 border border-white/10">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between text-white hover:text-primary-300 transition-colors mb-3"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-medium">{title}</span>
          {selected.length > 0 && (
            <Badge className="bg-primary-500 text-white text-xs px-2 py-0.5">
              {selected.length}
            </Badge>
          )}
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expandedSections[sectionKey] && (
        <div className={cn('overflow-y-auto custom-scrollbar', maxHeight)}>
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No {title.toLowerCase()} available</p>
            ) : (
              items.map((item) => (
                <button
                  key={item}
                  onClick={() => onToggle(item)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all touch-manipulation active:scale-98',
                    selected.includes(item)
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                  )}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
        </div>
        {activeFiltersCount > 0 && (
          <Button
            onClick={onClearAll}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Pills */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 p-4 glass rounded-xl border border-white/10">
          {selectedGenres.map((genre) => (
            <Badge
              key={genre}
              className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1 cursor-pointer hover:bg-purple-500/30 transition-colors"
              onClick={() => toggleFilter('genre', genre)}
            >
              {genre}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
          {selectedStudios.map((studio) => (
            <Badge
              key={studio}
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 pr-1 cursor-pointer hover:bg-blue-500/30 transition-colors"
              onClick={() => toggleFilter('studio', studio)}
            >
              {studio}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
          {selectedSeasons.map((season) => (
            <Badge
              key={season}
              className="bg-green-500/20 text-green-300 border-green-500/30 pr-1 cursor-pointer hover:bg-green-500/30 transition-colors"
              onClick={() => toggleFilter('season', season)}
            >
              {season}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
          {selectedYears.map((year) => (
            <Badge
              key={year}
              className="bg-orange-500/20 text-orange-300 border-orange-500/30 pr-1 cursor-pointer hover:bg-orange-500/30 transition-colors"
              onClick={() => toggleFilter('year', year)}
            >
              {year}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 pr-1 cursor-pointer hover:bg-cyan-500/30 transition-colors"
              onClick={() => toggleFilter('status', status)}
            >
              {status}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              className="bg-pink-500/20 text-pink-300 border-pink-500/30 pr-1 cursor-pointer hover:bg-pink-500/30 transition-colors"
              onClick={() => toggleFilter('type', type)}
            >
              {type}
              <X className="w-3 h-3 ml-1 inline" />
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-3">
        <FilterSection
          title="Genres"
          icon={Tag}
          sectionKey="genres"
          items={genres}
          selected={selectedGenres}
          onToggle={(value) => toggleFilter('genre', value)}
          maxHeight="max-h-60"
        />

        <FilterSection
          title="Type"
          icon={Film}
          sectionKey="type"
          items={types}
          selected={selectedTypes}
          onToggle={(value) => toggleFilter('type', value)}
        />

        <FilterSection
          title="Status"
          icon={Clock}
          sectionKey="status"
          items={statuses}
          selected={selectedStatuses}
          onToggle={(value) => toggleFilter('status', value)}
        />

        <FilterSection
          title="Studios"
          icon={Building}
          sectionKey="studios"
          items={studios.slice(0, 50)} // Limit to prevent UI overload
          selected={selectedStudios}
          onToggle={(value) => toggleFilter('studio', value)}
        />

        <FilterSection
          title="Season"
          icon={Calendar}
          sectionKey="seasons"
          items={seasons}
          selected={selectedSeasons}
          onToggle={(value) => toggleFilter('season', value)}
        />

        <FilterSection
          title="Year"
          icon={TrendingUp}
          sectionKey="years"
          items={years.slice(0, 30)} // Show last 30 years
          selected={selectedYears}
          onToggle={(value) => toggleFilter('year', value)}
        />

        {/* Rating Range */}
        {onRatingChange && (
          <div className="glass rounded-xl p-4 border border-white/10">
            <button
              onClick={() => toggleSection('rating')}
              className="w-full flex items-center justify-between text-white hover:text-primary-300 transition-colors mb-3"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="font-medium">Rating</span>
              </div>
              {expandedSections.rating ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.rating && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Min</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => onRatingChange(Number(e.target.value), maxRating)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400/50"
                    />
                  </div>
                  <div className="text-gray-400 pt-5">-</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1 block">Max</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={maxRating}
                      onChange={(e) => onRatingChange(minRating, Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-400/50"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400 text-center">
                  {minRating} - {maxRating} / 10
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="glass rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (onRatingChange) onRatingChange(8, 10)
            }}
            className="border-white/20 text-white hover:bg-white/10 text-xs"
          >
            <Star className="w-3 h-3 mr-1" />
            Highly Rated (8+)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentYear = new Date().getFullYear()
              onYearsChange([String(currentYear)])
            }}
            className="border-white/20 text-white hover:bg-white/10 text-xs"
          >
            <Calendar className="w-3 h-3 mr-1" />
            This Year
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (onStatusesChange) onStatusesChange(['Currently Airing'])
            }}
            className="border-white/20 text-white hover:bg-white/10 text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Airing Now
          </Button>
        </div>
      </div>
    </div>
  )
}
