'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'
import { useThrottle } from '../hooks/use-performance'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
  gap?: number
}

/**
 * Virtual List Component
 * Renders only visible items for optimal performance with large lists
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={animeList}
 *   itemHeight={320}
 *   height={800}
 *   renderItem={(anime, index) => (
 *     <AnimeCard key={anime.id} anime={anime} />
 *   )}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className = '',
  gap = 0,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useThrottle(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, 16) // ~60fps

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / (itemHeight + gap)) + overscan
  )

  // Calculate total height and offset
  const totalHeight = items.length * (itemHeight + gap)
  const offsetY = startIndex * (itemHeight + gap)

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto relative ${className}`}
      style={{ height }}
    >
      {/* Spacer to maintain total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, i) => (
            <div
              key={startIndex + i}
              style={{ 
                height: itemHeight,
                marginBottom: gap,
              }}
            >
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Virtual Grid Component
 * For grid layouts (like anime cards)
 */
interface VirtualGridProps<T> {
  items: T[]
  itemWidth: number
  itemHeight: number
  columns: number
  gap?: number
  height: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columns,
  gap = 16,
  height,
  renderItem,
  className = '',
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useThrottle(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, 16)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const rowHeight = itemHeight + gap
  const totalRows = Math.ceil(items.length / columns)
  const totalHeight = totalRows * rowHeight

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2)
  const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + height) / rowHeight) + 2)

  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> = []
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col,
        })
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto relative ${className}`}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Infinite Scroll Component
 * Automatically loads more items when scrolling near bottom
 */
interface InfiniteScrollProps {
  children: ReactNode
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  threshold?: number
  className?: string
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading,
  threshold = 300,
  className = '',
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasMore || loading) return

    const handleScroll = () => {
      if (loadingRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < threshold) {
        loadingRef.current = true
        onLoadMore()
      }
    }

    const throttledScroll = () => {
      requestAnimationFrame(handleScroll)
    }

    container.addEventListener('scroll', throttledScroll)
    return () => container.removeEventListener('scroll', throttledScroll)
  }, [hasMore, loading, onLoadMore, threshold])

  useEffect(() => {
    if (!loading) {
      loadingRef.current = false
    }
  }, [loading])

  return (
    <div ref={containerRef} className={`overflow-y-auto ${className}`}>
      {children}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No more items to load
        </div>
      )}
    </div>
  )
}

