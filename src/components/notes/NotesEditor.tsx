'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { 
  Save, 
  X, 
  Edit3, 
  FileText, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Undo,
  Redo,
  Loader2
} from 'lucide-react'

interface NotesEditorProps {
  animeId: string
  animeTitle: string
  initialNotes?: string | null
  onSave: (notes: string) => Promise<void>
  onCancel?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function NotesEditor({
  animeId: _animeId,
  animeTitle,
  initialNotes = '',
  onSave,
  onCancel,
  isOpen = false,
  onClose: _onClose
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setNotes(initialNotes || '')
    setHasChanges(false)
  }, [initialNotes])

  const handleEdit = () => {
    setIsEditing(true)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(notes)
      setIsEditing(false)
      setHasChanges(false)
      toast({
        title: 'Notes saved!',
        message: `Your notes for ${animeTitle} have been saved.`,
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to save notes:', error)
      toast({
        title: 'Failed to save notes',
        message: 'Please try again.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNotes(initialNotes || '')
    setHasChanges(false)
    setIsEditing(false)
    onCancel?.()
  }


  const handleContentChange = (content: string) => {
    setNotes(content)
    setHasChanges(content !== (initialNotes || ''))
  }

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value || '')
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      handleContentChange(content)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      formatText('createLink', url)
    }
  }

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
    { separator: true },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { command: 'formatBlock', value: 'blockquote', icon: Quote, label: 'Quote' },
    { separator: true },
    { action: 'link', icon: Link, label: 'Link' },
    { command: 'undo', icon: Undo, label: 'Undo' },
    { command: 'redo', icon: Redo, label: 'Redo' },
  ]

  const renderToolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700 bg-gray-800">
      {toolbarButtons.map((button, index) => {
        if (button.separator) {
          return <div key={index} className="w-px h-6 bg-gray-600 mx-1" />
        }

        if (button.action === 'link') {
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className="h-8 w-8 p-0 hover:bg-gray-700"
              title={button.label}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          )
        }

        const Icon = button.icon as React.ComponentType<{ className?: string }>
        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => {
              if ('command' in button && typeof button.command === 'string') {
                const cmd = button.command
                if ('value' in button && typeof button.value === 'string') {
                  formatText(cmd, button.value)
                } else {
                  formatText(cmd)
                }
              }
            }}
            className="h-8 w-8 p-0 hover:bg-gray-700"
            title={button.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          {renderToolbar()}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[200px] p-4 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent prose prose-invert max-w-none"
            style={{ minHeight: '200px' }}
            onInput={(e) => {
              const content = (e.target as HTMLDivElement).innerHTML
              handleContentChange(content)
            }}
            dangerouslySetInnerHTML={{ __html: notes }}
            suppressContentEditableWarning
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Notes
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-400" />
            <span className="text-sm text-gray-400">Personal Notes</span>
            {notes && (
              <Badge variant="secondary" className="bg-violet-900/30 text-violet-300">
                {notes.length} characters
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {notes ? 'Edit Notes' : 'Add Notes'}
          </Button>
        </div>

        {notes ? (
          <div
            className="prose prose-invert max-w-none p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            dangerouslySetInnerHTML={{ __html: notes }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p className="text-lg font-medium mb-2">No notes yet</p>
            <p className="text-sm">Add your personal thoughts and observations about this anime.</p>
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) {
    return null
  }

  return (
    <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <FileText className="h-6 w-6 text-violet-400" />
          Notes for {animeTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  )
}

// Standalone notes editor for use in modals or dedicated pages
export function StandaloneNotesEditor({
  animeId,
  animeTitle,
  initialNotes = '',
  onSave,
  onCancel
}: Omit<NotesEditorProps, 'isOpen' | 'onClose'>) {
  return (
    <NotesEditor
      animeId={animeId}
      animeTitle={animeTitle}
      initialNotes={initialNotes}
      onSave={onSave}
      onCancel={onCancel}
      isOpen={true}
    />
  )
}
