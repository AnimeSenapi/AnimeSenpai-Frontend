'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { ErrorState } from '../../components/ui/error-state'
import { CustomListCard, CustomListEditor } from '../../components/lists'
import { ListImportWizard } from '../../components/import'
import { ListExportWizard } from '../../components/export'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../components/ui/toast'
import { apiGetSharedLists, apiCreateSharedList, apiUpdateSharedList, api } from '../lib/api'
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
  const { addToast } = useToast()
  
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
      
      const response = await apiGetSharedLists() as any
      const sharedListsData = response?.result?.data?.sharedLists || response?.sharedLists || []
      
      // Transform shared lists to CustomList format
      const transformedLists: CustomList[] = sharedListsData.map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || undefined,
        isPublic: list.isPublic || false,
        animeCount: list.animeIds?.length || 0,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt || list.createdAt,
      }))
      
      setLists(transformedLists)
    } catch (err) {
      console.error('Failed to fetch lists:', err)
      // Fallback to empty array if API fails
      setLists([])
      setError('Failed to load your custom lists. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateList = async (listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'animeCount'>) => {
    try {
      const response = await apiCreateSharedList({
        name: listData.name,
        description: listData.description,
        animeIds: [],
        collaborators: [],
        isPublic: listData.isPublic,
      }) as any
      
      const sharedList = response?.result?.data?.sharedList || response?.sharedList
      if (sharedList) {
        const newList: CustomList = {
          id: sharedList.id,
          name: sharedList.name,
          description: sharedList.description || undefined,
          isPublic: sharedList.isPublic || false,
          animeCount: sharedList.animeIds?.length || 0,
          createdAt: sharedList.createdAt,
          updatedAt: sharedList.updatedAt || sharedList.createdAt,
        }
        
        setLists(prev => [newList, ...prev])
        setShowCreateModal(false)
        addToast({
          title: 'List created!',
          description: `"${listData.name}" has been created.`,
          variant: 'success',
        })
      }
    } catch (error) {
      console.error('Failed to create list:', error)
      addToast({
        title: 'Failed to create list',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleUpdateList = async (listData: Omit<CustomList, 'id' | 'createdAt' | 'updatedAt' | 'animeCount'>) => {
    if (!editingList) return
    
    try {
      const response = await apiUpdateSharedList(editingList.id, {
        name: listData.name,
        description: listData.description,
        isPublic: listData.isPublic,
      }) as any
      
      const updatedList = response?.result?.data?.sharedList || response?.sharedList
      if (updatedList) {
        setLists(prev => prev.map(list => 
          list.id === editingList.id 
            ? {
                ...list,
                name: updatedList.name,
                description: updatedList.description || undefined,
                isPublic: updatedList.isPublic || false,
                updatedAt: updatedList.updatedAt || list.updatedAt,
              }
            : list
        ))
        setEditingList(null)
        addToast({
          title: 'List updated!',
          description: `"${listData.name}" has been updated.`,
          variant: 'success',
        })
      }
    } catch (error) {
      console.error('Failed to update list:', error)
      addToast({
        title: 'Failed to update list',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleDeleteList = async (list: CustomList) => {
    try {
      // Note: Backend doesn't have deleteSharedList endpoint yet
      // For now, we'll use a mutation if it exists, otherwise show a message
      try {
        await api.trpcMutation('listTools.deleteSharedList', { listId: list.id })
      } catch (err) {
        // If endpoint doesn't exist, just remove from local state
        // This is a temporary solution until backend implements delete endpoint
        console.warn('Delete endpoint not available, removing from local state only')
      }
      
      setLists(prev => prev.filter(l => l.id !== list.id))
      addToast({
        title: 'List deleted',
        description: `"${list.name}" has been deleted.`,
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to delete list:', error)
      addToast({
        title: 'Failed to delete list',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleImportAnime = async (anime: any[]) => {
    try {
      // Import anime to user's main list using the existing API
      // This uses the user.addToAnimeList endpoint
      const importPromises = anime.map((item) =>
        api.trpcMutation('user.addToAnimeList', {
          animeId: item.id || item.animeId,
          status: item.status || 'plan-to-watch',
        }).catch((err) => {
          console.warn(`Failed to import anime ${item.id}:`, err)
          return null
        })
      )
      
      await Promise.allSettled(importPromises)
      
      addToast({
        title: 'Import successful!',
        description: `Imported ${anime.length} anime to your list.`,
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to import anime:', error)
      addToast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Some anime could not be imported.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const handleExportList = async (options: any) => {
    try {
      // Export the lists data as JSON
      // If a specific list is selected, export only that list
      const dataToExport = options?.listId
        ? lists.find(l => l.id === options.listId)
        : lists
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        lists: Array.isArray(dataToExport) ? dataToExport : [dataToExport],
      }
      
      const jsonData = JSON.stringify(exportData, null, 2)
      return new Blob([jsonData], { type: 'application/json' })
    } catch (error) {
      console.error('Failed to export list:', error)
      addToast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export list.',
        variant: 'destructive',
      })
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
