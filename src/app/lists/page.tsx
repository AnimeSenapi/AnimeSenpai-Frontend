'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { ErrorState } from '../../components/ui/error-state'
import { CustomListCard, CustomListEditor } from '../../components/lists'
import { ListImportWizard } from '../../components/import'
import { ListExportWizard } from '../../components/export'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../components/ui/toast'
import { 
  Plus, 
  List, 
  Grid3X3, 
  Search,
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  Upload,
  Download
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

export default function CustomListsPage() {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  
  const [lists, setLists] = useState<CustomList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPublicOnly, setShowPublicOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created' | 'animeCount'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingList, setEditingList] = useState<CustomList | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchLists()
    }
  }, [isAuthenticated])

  const fetchLists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockLists: CustomList[] = [
        {
          id: '1',
          name: 'My Favorites',
          description: 'All my favorite anime that I absolutely love',
          isPublic: false,
          animeCount: 12,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-10-20T14:30:00Z',
        },
        {
          id: '2',
          name: 'Must Watch',
          description: 'Anime I highly recommend to everyone',
          isPublic: true,
          animeCount: 8,
          createdAt: '2024-02-01T09:15:00Z',
          updatedAt: '2024-10-18T16:45:00Z',
        },
        {
          id: '3',
          name: 'Currently Watching',
          description: 'Anime I am currently watching',
          isPublic: false,
          animeCount: 5,
          createdAt: '2024-03-10T14:20:00Z',
          updatedAt: '2024-10-22T11:30:00Z',
        },
      ]
      
      setLists(mockLists)
    } catch (err) {
      console.error('Failed to fetch lists:', err)
      setError('Failed to load your custom lists. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateList = async (listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'animeCount'>) => {
    try {
      // TODO: Replace with actual API call
      const newList: CustomList = {
        id: Date.now().toString(),
        ...listData,
        animeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setLists(prev => [newList, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create list:', error)
      throw error
    }
  }

  const handleUpdateList = async (listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'animeCount'>) => {
    try {
      // TODO: Replace with actual API call
      setLists(prev => prev.map(list => 
        list.id === editingList?.id 
          ? { ...list, ...listData, updatedAt: new Date().toISOString() }
          : list
      ))
      setEditingList(null)
    } catch (error) {
      console.error('Failed to update list:', error)
      throw error
    }
  }

  const handleDeleteList = async (list: CustomList) => {
    try {
      // TODO: Replace with actual API call
      setLists(prev => prev.filter(l => l.id !== list.id))
    } catch (error) {
      console.error('Failed to delete list:', error)
      throw error
    }
  }

  const handleImportAnime = async (anime: any[]) => {
    try {
      // TODO: Replace with actual API call
      // This would import anime to the user's main list
      toast({
        title: 'Import successful!',
        message: `Imported ${anime.length} anime to your list.`,
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to import anime:', error)
      throw error
    }
  }

  const handleExportList = async (options: any) => {
    try {
      // TODO: Replace with actual API call
      // This would generate and return the export file
      const mockData = JSON.stringify(lists, null, 2)
      return new Blob([mockData], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export list:', error)
      throw error
    }
  }

  const filteredAndSortedLists = lists
    .filter(list => {
      const matchesSearch = list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           list.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrivacy = showPublicOnly ? list.isPublic : true
      return matchesSearch && matchesPrivacy
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'animeCount':
          comparison = a.animeCount - b.animeCount
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          title="Authentication Required"
          message="Please sign in to view and manage your custom lists."
          showHome={true}
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingState variant="full" text="Loading your custom lists..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          title="Failed to Load Lists"
          message={error}
          showHome={true}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Custom Lists</h1>
              <p className="text-gray-400">
                Create and manage your personal anime collections
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                onClick={() => setShowExportModal(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span>{lists.length} lists</span>
            <span>•</span>
            <span>{lists.reduce((sum, list) => sum + list.animeCount, 0)} total anime</span>
            <span>•</span>
            <span>{lists.filter(list => list.isPublic).length} public</span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Privacy Filter */}
            <Button
              variant={showPublicOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPublicOnly(!showPublicOnly)}
              className="h-8"
            >
              {showPublicOnly ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {showPublicOnly ? 'Public Only' : 'All Lists'}
            </Button>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="updated-asc">Oldest Updated</option>
              <option value="created-desc">Recently Created</option>
              <option value="created-asc">Oldest Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="animeCount-desc">Most Anime</option>
              <option value="animeCount-asc">Least Anime</option>
            </select>
          </div>
        </div>

        {/* Lists Grid/List */}
        {filteredAndSortedLists.length === 0 ? (
          <div className="text-center py-12">
            <List className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No lists found' : 'No custom lists yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first custom list to organize your favorite anime'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </Button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredAndSortedLists.map((list) => (
              <CustomListCard
                key={list.id}
                list={list}
                variant={viewMode}
                onEdit={setEditingList}
                onDelete={handleDeleteList}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingList) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CustomListEditor
                list={editingList}
                onSave={editingList ? handleUpdateList : handleCreateList}
                onCancel={() => {
                  setShowCreateModal(false)
                  setEditingList(null)
                }}
                onDelete={editingList ? () => handleDeleteList(editingList) : undefined}
                isOpen={true}
                onClose={() => {
                  setShowCreateModal(false)
                  setEditingList(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ListImportWizard
            onImport={handleImportAnime}
            onCancel={() => setShowImportModal(false)}
            isOpen={true}
            onClose={() => setShowImportModal(false)}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ListExportWizard
            onExport={handleExportList}
            onCancel={() => setShowExportModal(false)}
            isOpen={true}
            onClose={() => setShowExportModal(false)}
          />
        )}
      </div>
    </div>
  )
}
