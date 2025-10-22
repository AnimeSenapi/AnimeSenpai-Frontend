'use client'

import { useState, useEffect, useMemo } from 'react'
import { api } from '@/app/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Lock,
  Eye,
  Filter,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react'

interface Permission {
  id: string
  key: string
  name: string
  description: string | null
  category: string
  roles: Array<{
    role: {
      id: string
      name: string
      displayName: string
    }
    granted: boolean
  }>
  _count: {
    roles: number
  }
  createdAt: string
  updatedAt: string
}

interface PermissionsTabProps {
  onSuccess?: () => void
}

export default function PermissionsTab({ onSuccess }: PermissionsTabProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Load permissions
  const loadPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await api.trpcQuery('admin.getAllPermissions', {
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      })

      setPermissions(data.permissions)
      setCategories(data.categories)
    } catch (err: any) {
      console.error('Failed to load permissions:', err)
      setError(err.message || 'Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    loadPermissions()
  }, [])

  // Reload when filters change
  useEffect(() => {
    if (!loading) {
      loadPermissions()
    }
  }, [searchQuery, selectedCategory])

  // Filter and group permissions
  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = !selectedCategory || p.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Group by category
    const grouped: Record<string, Permission[]> = {}
    filtered.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = []
      }
      grouped[permission.category]!.push(permission)
    })

    return grouped
  }, [permissions, searchQuery, selectedCategory])

  // Category color mapping
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      user_management: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      role_management: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      content: 'bg-green-500/10 text-green-500 border-green-500/20',
      moderation: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      social: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      analytics: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      security: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  // Format category name
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.key || formData.key.length < 3) {
      errors.key = 'Key must be at least 3 characters'
    }
    if (!/^[a-z_\.]+$/.test(formData.key)) {
      errors.key = 'Key must contain only lowercase letters, underscores, and dots'
    }
    if (!formData.name || formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters'
    }
    if (!formData.category || formData.category.length < 3) {
      errors.category = 'Category is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Create permission
  const handleCreate = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError(null)

      await api.trpcMutation('admin.createPermission', formData)

      setShowCreateModal(false)
      setFormData({ key: '', name: '', description: '', category: '' })
      setFormErrors({})
      await loadPermissions()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to create permission')
    } finally {
      setSubmitting(false)
    }
  }

  // Update permission
  const handleUpdate = async () => {
    if (!selectedPermission || !validateForm()) return

    try {
      setSubmitting(true)
      setError(null)

      await api.trpcMutation('admin.updatePermission', {
        id: selectedPermission.id,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
      })

      setShowEditModal(false)
      setSelectedPermission(null)
      setFormData({ key: '', name: '', description: '', category: '' })
      setFormErrors({})
      await loadPermissions()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to update permission')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete permission
  const handleDelete = async () => {
    if (!selectedPermission) return

    try {
      setSubmitting(true)
      setError(null)

      await api.trpcMutation('admin.deletePermission', {
        id: selectedPermission.id,
      })

      setShowDeleteModal(false)
      setSelectedPermission(null)
      await loadPermissions()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to delete permission')
    } finally {
      setSubmitting(false)
    }
  }

  // Open edit modal
  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormData({
      key: permission.key,
      name: permission.name,
      description: permission.description || '',
      category: permission.category,
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission)
    setShowDeleteModal(true)
  }

  // Open roles modal
  const openRolesModal = (permission: Permission) => {
    setSelectedPermission(permission)
    setShowRolesModal(true)
  }

  if (loading && permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Permission Management</h2>
          <p className="text-gray-400 mt-1">
            Manage system permissions and their assignments to roles
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ key: '', name: '', description: '', category: '' })
            setFormErrors({})
            setShowCreateModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Permission
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-500 font-medium">Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory) && (
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Permissions</p>
              <p className="text-2xl font-bold text-white mt-1">{permissions.length}</p>
            </div>
            <Shield className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white mt-1">{categories.length}</p>
            </div>
            <Filter className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Filtered Results</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Object.values(groupedPermissions).reduce((sum, perms) => sum + perms.length, 0)}
              </p>
            </div>
            <Search className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Permissions List - Grouped by Category */}
      {Object.keys(groupedPermissions).length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No permissions found</h3>
          <p className="text-gray-400">
            {searchQuery || selectedCategory
              ? 'Try adjusting your filters'
              : 'Create your first permission to get started'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <Badge className={getCategoryColor(category)}>{formatCategoryName(category)}</Badge>
                <span className="text-sm text-gray-400">
                  {categoryPermissions.length}{' '}
                  {categoryPermissions.length === 1 ? 'permission' : 'permissions'}
                </span>
              </div>

              {/* Permissions in Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categoryPermissions.map((permission) => (
                  <Card
                    key={permission.id}
                    className="bg-gray-800/50 border-gray-700 p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h4 className="font-medium text-white truncate">{permission.name}</h4>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mb-2">{permission.key}</p>
                        {permission.description && (
                          <p className="text-sm text-gray-300 mb-3">{permission.description}</p>
                        )}

                        {/* Roles */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Assigned to:</span>
                          <button
                            onClick={() => openRolesModal(permission)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {permission._count.roles}{' '}
                            {permission._count.roles === 1 ? 'role' : 'roles'}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openRolesModal(permission)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View roles"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => openEditModal(permission)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit permission"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(permission)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete permission"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">Create Permission</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Key *</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase() })}
                  placeholder="e.g., users.manage"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                {formErrors.key && <p className="text-red-400 text-sm mt-1">{formErrors.key}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Manage Users"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value.toLowerCase() })
                  }
                  placeholder="e.g., user_management"
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {formErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">Edit Permission</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key (read-only)
                </label>
                <input
                  type="text"
                  value={formData.key}
                  disabled
                  className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 font-mono text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value.toLowerCase() })
                  }
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  list="categories"
                />
                {formErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Permission</h3>
                <p className="text-gray-300">
                  Are you sure you want to delete the permission "{selectedPermission.name}"?
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  This will remove the permission from {selectedPermission._count.roles} role
                  {selectedPermission._count.roles === 1 ? '' : 's'}.
                </p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                <strong>Warning:</strong> This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Roles Modal */}
      {showRolesModal && selectedPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Assigned Roles</h3>
              <button
                onClick={() => setShowRolesModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-300 font-medium">{selectedPermission.name}</p>
              <p className="text-sm text-gray-400 font-mono">{selectedPermission.key}</p>
            </div>

            {selectedPermission.roles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Not assigned to any roles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPermission.roles.map(({ role, granted }) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{role.displayName}</p>
                      <p className="text-sm text-gray-400">{role.name}</p>
                    </div>
                    <Badge
                      className={
                        granted
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }
                    >
                      {granted ? 'Granted' : 'Denied'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setShowRolesModal(false)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
