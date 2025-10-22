'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { 
  Plus, 
  X, 
  Edit3, 
  List, 
  Save,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Lock,
  Loader2
} from 'lucide-react'

interface CustomList {
  id: string
  name: string
  description?: string
  isPublic: boolean
  animeCount: number
  createdAt: string
  updatedAt: string
}

interface CustomListEditorProps {
  list?: CustomList | null
  onSave: (list: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'animeCount'>) => Promise<void>
  onCancel?: () => void
  onDelete?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function CustomListEditor({
  list,
  onSave,
  onCancel,
  onDelete,
  isOpen = false,
  onClose
}: CustomListEditorProps) {
  const [name, setName] = useState(list?.name || '')
  const [description, setDescription] = useState(list?.description || '')
  const [isPublic, setIsPublic] = useState(list?.isPublic ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (list) {
      setName(list.name)
      setDescription(list.description || '')
      setIsPublic(list.isPublic)
    } else {
      setName('')
      setDescription('')
      setIsPublic(false)
    }
  }, [list])

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        message: 'Please enter a name for your list.',
        type: 'error',
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      })
      
      toast({
        title: list ? 'List updated!' : 'List created!',
        message: `"${name.trim()}" has been ${list ? 'updated' : 'created'}.`,
        type: 'success',
      })
      
      onClose?.()
    } catch (error) {
      console.error('Failed to save list:', error)
      toast({
        title: 'Failed to save list',
        message: 'Please try again.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!list || !onDelete) return

    const confirmed = confirm(`Are you sure you want to delete "${list.name}"? This action cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await onDelete()
      toast({
        title: 'List deleted',
        message: `"${list.name}" has been deleted.`,
        type: 'success',
      })
      onClose?.()
    } catch (error) {
      console.error('Failed to delete list:', error)
      toast({
        title: 'Failed to delete list',
        message: 'Please try again.',
        type: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setName(list?.name || '')
    setDescription(list?.description || '')
    setIsPublic(list?.isPublic ?? false)
    onCancel?.()
    onClose?.()
  }

  if (!isOpen) {
    return null
  }

  return (
    <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <List className="h-6 w-6 text-violet-400" />
          {list ? 'Edit List' : 'Create New List'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            List Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter list name..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">
            {name.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your list (optional)..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Privacy
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 focus:ring-violet-500"
              />
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Private</span>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  Only you can see this list
                </Badge>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 focus:ring-violet-500"
              />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">Public</span>
                <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                  Others can discover and view this list
                </Badge>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            {list && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isSaving || isDeleting}
                className="border-red-600 text-red-400 hover:bg-red-500/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || isDeleting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isDeleting || !name.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {list ? 'Update List' : 'Create List'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Standalone editor for use in modals or dedicated pages
export function StandaloneCustomListEditor({
  list,
  onSave,
  onCancel,
  onDelete
}: Omit<CustomListEditorProps, 'isOpen' | 'onClose'>) {
  return (
    <CustomListEditor
      list={list}
      onSave={onSave}
      onCancel={onCancel}
      onDelete={onDelete}
      isOpen={true}
    />
  )
}
