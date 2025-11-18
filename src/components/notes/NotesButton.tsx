'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FileText, Edit3, Plus } from 'lucide-react'
import { NotesEditor } from './NotesEditor'
import { cn } from '../../lib/utils'

interface NotesButtonProps {
  animeId: string
  animeTitle: string
  currentNotes?: string | null
  onNotesUpdate?: (notes: string) => void
  variant?: 'button' | 'icon' | 'compact'
  className?: string
}

export function NotesButton({
  animeId,
  animeTitle,
  currentNotes,
  onNotesUpdate,
  variant = 'button',
  className
}: NotesButtonProps) {
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const [notes, setNotes] = useState(currentNotes || '')

  const hasNotes = notes && notes.trim().length > 0

  const handleSaveNotes = async (newNotes: string) => {
    try {
      const { TRPC_URL: API_URL } = await import('@/app/lib/api')
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`${API_URL}/user.addToList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          animeId,
          notes: newNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save notes')
      }

      setNotes(newNotes)
      onNotesUpdate?.(newNotes)
      
      return Promise.resolve()
    } catch (error) {
      console.error('Failed to save notes:', error)
      throw error
    }
  }

  const handleOpenNotes = () => {
    setShowNotesEditor(true)
  }

  const handleCloseNotes = () => {
    setShowNotesEditor(false)
  }

  const renderButton = () => {
    if (variant === 'icon') {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenNotes}
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-700",
            hasNotes && "text-violet-400 hover:text-violet-300",
            className
          )}
          title={hasNotes ? 'Edit notes' : 'Add notes'}
        >
          {hasNotes ? (
            <Edit3 className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      )
    }

    if (variant === 'compact') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenNotes}
          className={cn(
            "border-gray-600 text-gray-300 hover:bg-gray-700",
            hasNotes && "border-violet-500 text-violet-300 hover:bg-violet-900/20",
            className
          )}
        >
          <FileText className="h-4 w-4 mr-2" />
          {hasNotes ? 'Edit Notes' : 'Add Notes'}
          {hasNotes && (
            <Badge variant="secondary" className="ml-2 bg-violet-900/30 text-violet-300 text-xs">
              {notes.length}
            </Badge>
          )}
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        onClick={handleOpenNotes}
        className={cn(
          "border-gray-600 text-gray-300 hover:bg-gray-700",
          hasNotes && "border-violet-500 text-violet-300 hover:bg-violet-900/20",
          className
        )}
      >
        <FileText className="h-4 w-4 mr-2" />
        {hasNotes ? 'Edit Notes' : 'Add Notes'}
        {hasNotes && (
          <Badge variant="secondary" className="ml-2 bg-violet-900/30 text-violet-300">
            {notes.length} chars
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <>
      {renderButton()}
      
      {showNotesEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <NotesEditor
              animeId={animeId}
              animeTitle={animeTitle}
              initialNotes={notes}
              onSave={handleSaveNotes}
              onCancel={handleCloseNotes}
              isOpen={true}
              onClose={handleCloseNotes}
            />
          </div>
        </div>
      )}
    </>
  )
}

// Quick notes preview component for anime cards
export function NotesPreview({ 
  notes, 
  maxLength = 100 
}: { 
  notes?: string | null
  maxLength?: number 
}) {
  if (!notes || !notes.trim()) {
    return null
  }

  // Strip HTML tags for preview
  const textContent = notes.replace(/<[^>]*>/g, '')
  const preview = textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...'
    : textContent

  return (
    <div className="text-xs text-gray-400 mt-1 p-2 bg-gray-800/50 rounded border border-gray-700">
      <div className="flex items-center gap-1 mb-1">
        <FileText className="h-3 w-3" />
        <span className="font-medium">Notes:</span>
      </div>
      <p className="line-clamp-2">{preview}</p>
    </div>
  )
}
