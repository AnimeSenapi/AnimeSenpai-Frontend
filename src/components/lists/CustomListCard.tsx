'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { 
  List, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Lock,
  Calendar,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface CustomList {
  id: string
  name: string
  description?: string
  isPublic: boolean
  animeCount: number
  createdAt: string
  updatedAt: string
}

interface CustomListCardProps {
  list: CustomList
  onEdit?: (list: CustomList) => void
  onDelete?: (list: CustomList) => void
  variant?: 'grid' | 'list'
  className?: string
}

export function CustomListCard({
  list,
  onEdit,
  onDelete,
  variant = 'grid',
  className
}: CustomListCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = confirm(`Are you sure you want to delete "${list.name}"? This action cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await onDelete(list)
      toast({
        title: 'List deleted',
        message: `"${list.name}" has been deleted.`,
        type: 'success',
      })
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (variant === 'list') {
    return (
      <Card className={cn(
        "border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <List className="h-4 w-4 text-violet-400" />
                <Link 
                  href={`/lists/${list.id}`}
                  className="font-medium text-white hover:text-violet-300 transition-colors truncate"
                >
                  {list.name}
                </Link>
                {list.isPublic ? (
                  <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              
              {list.description && (
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {list.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{list.animeCount} anime</span>
                <span>•</span>
                <span>Updated {formatDate(list.updatedAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(list)}
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg text-white mb-2">
              <List className="h-5 w-5 text-violet-400 flex-shrink-0" />
              <Link 
                href={`/lists/${list.id}`}
                className="hover:text-violet-300 transition-colors truncate"
              >
                {list.name}
              </Link>
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {list.isPublic ? (
                <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                  <Eye className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(list)}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-500/10 text-red-400 hover:text-red-300"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {list.description && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
            {list.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <List className="h-3 w-3" />
              {list.animeCount} anime
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(list.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
