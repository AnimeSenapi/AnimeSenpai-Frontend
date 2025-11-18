'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Calendar, ChevronDown, X } from 'lucide-react'
import { cn } from '../../app/lib/utils'

interface DateRangePickerProps {
  startDate: Date
  endDate: Date
  onDateRangeChange: (start: Date, end: Date) => void
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  className
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(startDate.toISOString().split('T')[0] || '')
  const [tempEndDate, setTempEndDate] = useState(endDate.toISOString().split('T')[0] || '')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      if (isOpen) {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  useEffect(() => {
    setTempStartDate(startDate.toISOString().split('T')[0] || '')
    setTempEndDate(endDate.toISOString().split('T')[0] || '')
  }, [startDate, endDate])

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${start} - ${end}`
  }

  const handleApply = () => {
    const start = new Date(tempStartDate)
    const end = new Date(tempEndDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    onDateRangeChange(start, end)
    setIsOpen(false)
  }

  const handleQuickSelect = (type: 'today' | 'thisWeek' | 'nextWeek' | 'thisMonth') => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (type) {
      case 'today':
        start = new Date(now)
        end = new Date(now)
        break
      case 'thisWeek':
        start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'nextWeek':
        start = new Date(now)
        start.setDate(now.getDate() - now.getDay() + 7)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
    }

    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    onDateRangeChange(start, end)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)} ref={pickerRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">{formatDateRange()}</span>
        <span className="sm:hidden">Date</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 min-w-[280px]">
          <div className="space-y-4">
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickSelect('today')}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickSelect('thisWeek')}
                className="text-xs"
              >
                This Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickSelect('nextWeek')}
                className="text-xs"
              >
                Next Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickSelect('thisMonth')}
                className="text-xs"
              >
                This Month
              </Button>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    min={tempStartDate}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApply}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

