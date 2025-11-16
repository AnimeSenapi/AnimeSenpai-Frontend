'use client'

import { useEffect, useState } from 'react'
import {
  apiGetAllRoles,
  apiGetAllPermissions,
  apiCreateRole,
  apiUpdateRole,
  apiDeleteRole,
  apiAssignRoleToUser,
  apiRemoveRoleFromUser,
  apiCreatePermission,
  apiUpdatePermission,
  apiDeletePermission,
  apiGetAllUsers,
} from '../../lib/api'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Save,
  Users,
  Key,
  AlertCircle,
  RefreshCw,
  Download,
  Shield,
  Filter,
  Search,
} from 'lucide-react'
import { getRoleConfig, getRoleIcon, getRoleBadgeClasses, getRoleCardClasses } from '../../../lib/role-config'
import { Button } from '../../../components/ui/button'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../../components/ui/error-state'
import { Badge } from '../../../components/ui/badge'
import { Checkbox } from '../../../components/ui/checkbox'
import { useToast } from '../../../components/ui/toast'

interface Role {
  id: string
  name: string
  displayName: string
  description?: string
  isSystem: boolean
  isDefault: boolean
  priority: number
  userCount: number
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  key: string
  name: string
  description?: string
  category: string
}

interface User {
  id: string
  email: string
  username: string | null
  name: string | null
  role: string
}

export function RoleManagementTab() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'assignments'>('roles')

  // Roles state
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Permissions state
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})

  // Users state (for assignments)
  const [users, setUsers] = useState<User[]>([])

  // Modal states
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [showDeleteRole, setShowDeleteRole] = useState(false)
  const [showCreatePermission, setShowCreatePermission] = useState(false)
  const [showEditPermission, setShowEditPermission] = useState(false)
  const [showDeletePermission, setShowDeletePermission] = useState(false)
  const [showAssignRole, setShowAssignRole] = useState(false)

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    priority: 0,
    permissionIds: [] as string[],
  })
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<string>('')

  const [permissionForm, setPermissionForm] = useState({
    key: '',
    name: '',
    description: '',
    category: 'general',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<string>('all')

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim())
  }

  useEffect(() => {
    loadData()
    setSearchQuery('')
    setSearchTerm('')
    if (activeTab === 'permissions') {
      setPermissionCategoryFilter('all')
    }
  }, [activeTab])

  const loadData = async () => {
      setLoading(true)
    setLoadError(null)

    try {
      if (activeTab === 'roles') {
        const rolesData = (await apiGetAllRoles()) as Role[]
        setRoles(Array.isArray(rolesData) ? rolesData : [])
      } else if (activeTab === 'permissions') {
        const permsData = (await apiGetAllPermissions()) as Record<string, Permission[]>
        setPermissions(permsData || {})
      } else if (activeTab === 'assignments') {
        const [rolesData, usersData] = await Promise.all([
          apiGetAllRoles(),
          apiGetAllUsers({ limit: 100 }),
        ])
        setRoles(Array.isArray(rolesData) ? rolesData : [])
        const normalizedUsers = Array.isArray((usersData as any)?.users)
          ? (usersData as any).users
          : Array.isArray(usersData)
            ? (usersData as any)
            : []
        setUsers(normalizedUsers)
      }
    } catch (error: any) {
      console.error('Failed to load data:', error)

      if (error?.message?.includes('FORBIDDEN') || error?.message?.includes('admin')) {
        alert('Access denied. Admin privileges required.')
        window.location.href = '/dashboard'
        return
      }

      setLoadError(
        error instanceof Error
          ? error.message || 'Failed to load role management data. Please try again.'
          : 'Failed to load role management data. Please try again.'
      )
      if (activeTab === 'roles' || activeTab === 'assignments') {
        setRoles([])
      }
      if (activeTab === 'permissions') {
        setPermissions({})
      }
      if (activeTab === 'assignments') {
        setUsers([])
      }
      addToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message || 'Failed to load data'
            : 'Failed to load data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!roleForm.name || !roleForm.displayName) {
      addToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiCreateRole(roleForm)
      addToast({
        title: 'Success',
        description: 'Role created successfully',
        variant: 'success',
      })
      setShowCreateRole(false)
      setRoleForm({ name: '', displayName: '', description: '', priority: 0, permissionIds: [] })
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create role',
        variant: 'destructive',
      })
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole || !roleForm.displayName) {
      addToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiUpdateRole({
        roleId: selectedRole.id,
        displayName: roleForm.displayName,
        description: roleForm.description,
        priority: roleForm.priority,
        permissionIds: roleForm.permissionIds,
      })
      addToast({
        title: 'Success',
        description: 'Role updated successfully',
        variant: 'success',
      })
      setShowEditRole(false)
      setSelectedRole(null)
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      await apiDeleteRole(selectedRole.id)
      addToast({
        title: 'Success',
        description: 'Role deleted successfully',
        variant: 'success',
      })
      setShowDeleteRole(false)
      setSelectedRole(null)
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        variant: 'destructive',
      })
    }
  }

  const handleCreatePermission = async () => {
    const key = permissionForm.key.trim().toLowerCase()
    const name = permissionForm.name.trim()
    const description = permissionForm.description.trim()
    const category = (permissionForm.category || 'general').trim().toLowerCase()

    if (!key || !name) {
      addToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (!/^[a-z0-9]+([._-][a-z0-9]+)*$/.test(key)) {
      addToast({
        title: 'Invalid Key',
        description: 'Key must use lowercase letters, numbers, dots, underscores, or hyphens.',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiCreatePermission({
        key,
        name,
        description,
        category,
      })
      addToast({
        title: 'Success',
        description: 'Permission created successfully',
        variant: 'success',
      })
      setShowCreatePermission(false)
      setPermissionForm({ key: '', name: '', description: '', category: 'general' })
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create permission',
        variant: 'destructive',
      })
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return

    const name = permissionForm.name.trim()
    const description = permissionForm.description.trim()
    const category = (permissionForm.category || 'general').trim().toLowerCase()

    if (!name) {
      addToast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiUpdatePermission({
        permissionId: selectedPermission.id,
        name,
        description,
        category,
      })
      addToast({
        title: 'Success',
        description: 'Permission updated successfully',
        variant: 'success',
      })
      setShowEditPermission(false)
      setSelectedPermission(null)
      setPermissionForm({ key: '', name: '', description: '', category: 'general' })
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update permission',
        variant: 'destructive',
      })
    }
  }

  const handleDeletePermission = async () => {
    if (!selectedPermission) return

    try {
      await apiDeletePermission(selectedPermission.id)
      addToast({
        title: 'Success',
        description: 'Permission deleted successfully',
        variant: 'success',
      })
      setShowDeletePermission(false)
      setSelectedPermission(null)
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete permission',
        variant: 'destructive',
      })
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleForUser) {
      addToast({
        title: 'Validation Error',
        description: 'Please select a user and role',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiAssignRoleToUser(selectedUser.id, selectedRoleForUser)
      addToast({
        title: 'Success',
        description: 'Role assigned successfully',
        variant: 'success',
      })
      setShowAssignRole(false)
      setSelectedUser(null)
      setSelectedRoleForUser('')
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveRole = async (user: User) => {
    try {
      await apiRemoveRoleFromUser(user.id)
      addToast({
        title: 'Success',
        description: 'Role removed successfully',
        variant: 'success',
      })
      loadData()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive',
      })
    }
  }

  const openEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      priority: role.priority,
      permissionIds: role.permissions.map((p) => p.id),
    })
    setShowEditRole(true)
  }

  const openEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setPermissionForm({
      key: permission.key,
      name: permission.name,
      description: permission.description || '',
      category: (permission.category || 'general').toLowerCase(),
    })
    setShowEditPermission(true)
  }

  const togglePermission = (permissionId: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }))
  }

  const exportToCSV = () => {
    const headers = [
      'Role Name',
      'Display Name',
      'Description',
      'Priority',
      'User Count',
      'Permissions',
    ]
    const rows = filteredRoles.map((role) => [
      role.name,
      role.displayName,
      role.description || '',
      role.priority.toString(),
      role.userCount.toString(),
      role.permissions.map((p) => p.name).join('; '),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `animesenpai-roles-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast({
        title: 'Exported',
        description: 'Roles exported to CSV',
        variant: 'success',
      })
  }

  const normalizedSearch = searchTerm.toLowerCase()
  const defaultPermissionCategories = ['general', 'admin', 'content', 'user', 'moderation', 'feature', 'analytics', 'security']
  const availablePermissionCategories = Array.from(
    new Set(
      Object.values(permissions)
        .flat()
        .map((perm) => (perm.category || 'general').toLowerCase())
    )
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  const categoryOptions = Array.from(
    new Set([...defaultPermissionCategories, ...availablePermissionCategories])
  ).sort((a, b) => a.localeCompare(b))

  const filteredRoles = !normalizedSearch
    ? roles
    : roles.filter((role) => {
        const haystack = [role.name, role.displayName, role.description || '']
        return haystack.some((value) => value.toLowerCase().includes(normalizedSearch))
      })

  const allPermissions = Object.values(permissions).flat()
  const filteredPermissionsArray = !normalizedSearch
    ? allPermissions
    : allPermissions.filter((perm) => {
        const haystack = [perm.name, perm.key, perm.description || '', perm.category]
        return haystack.some((value) => value.toLowerCase().includes(normalizedSearch))
      })
  const filteredPermissionsByCategory = filteredPermissionsArray.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const category = (perm.category || 'general').toLowerCase()
      if (permissionCategoryFilter !== 'all' && category !== permissionCategoryFilter) {
        return acc
      }

      if (!acc[category]) acc[category] = []
      acc[category].push(perm)
      return acc
    },
    {}
  )

  const flattenedFilteredPermissions = Object.values(filteredPermissionsByCategory).flat()

  const totalPermissionCategories = Object.keys(permissions).length
  const showingPermissionCategories = Object.keys(filteredPermissionsByCategory).length
  const showingPermissions = flattenedFilteredPermissions.length
  const filteredUsers = !normalizedSearch
    ? users
    : users.filter((user) => {
        const haystack = [user.username || '', user.email, user.role]
        return haystack.some((value) => value.toLowerCase().includes(normalizedSearch))
      })

  const hasActiveSearch = normalizedSearch.length > 0
  const hasPermissionFilters = hasActiveSearch || permissionCategoryFilter !== 'all'

  const showInitialLoading = loading && !loadError &&
    ((activeTab === 'roles' && roles.length === 0) ||
      (activeTab === 'permissions' && allPermissions.length === 0) ||
      (activeTab === 'assignments' && users.length === 0))

  const showError = !loading && Boolean(loadError)
  const resolvedErrorMessage =
    loadError || 'Failed to load role management data. Please try again.'

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </div>
        <div>
              <h2 className="text-3xl font-semibold text-white">Access Control</h2>
              <p className="text-sm text-gray-400">Define roles, assign permissions, and manage user access consistently.</p>
        </div>
          </div>
          <div className="flex items-start sm:items-center gap-3">
        <Button
              onClick={() => setActiveTab('roles')}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
              <Shield className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Roles</span>
            </Button>
            <Button
              onClick={() => setActiveTab('permissions')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Key className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Permissions</span>
            </Button>
            <Button
              onClick={() => setActiveTab('assignments')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Assignments</span>
        </Button>
          </div>
      </div>

        <nav className="mt-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1 text-sm text-gray-400">
          {[
            { id: 'roles', label: 'Roles', icon: Shield },
            { id: 'permissions', label: 'Permissions', icon: Key },
            { id: 'assignments', label: 'Assignments', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            return (
        <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 rounded-lg px-4 py-2.5 transition ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-100 border border-primary-500/40'
                    : 'border border-transparent hover:border-white/10 hover:text-white'
          }`}
        >
                <span className="flex items-center justify-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </span>
        </button>
            )
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  setSearchTerm(value.trim())
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {activeTab === 'permissions' && (
                <select
                  value={permissionCategoryFilter}
                  onChange={(e) => setPermissionCategoryFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/40"
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              )}
              {activeTab === 'roles' && (
          <Button
                  onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
          </Button>
              )}
          <Button
                onClick={() => {
                  setSearchQuery('')
                  setSearchTerm('')
                  setPermissionCategoryFilter('all')
                }}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
                <Filter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Clear</span>
          </Button>
      </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {showInitialLoading ? (
        <LoadingState variant="inline" text={`Loading ${activeTab}...`} size="md" />
      ) : showError ? (
        <ErrorState
          variant="inline"
          title="Unable to load role management data"
          message={resolvedErrorMessage}
          showRetry
          showHome={false}
          onRetry={loadData}
        />
      ) : (
        <>
          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">
                    Total: <span className="text-white font-medium">{roles.length}</span>
                  </span>
                  <span className="text-gray-400">
                    System:{' '}
                    <span className="text-yellow-400 font-medium">
                      {roles.filter((r) => r.isSystem).length}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    Custom:{' '}
                    <span className="text-blue-400 font-medium">
                      {roles.filter((r) => !r.isSystem).length}
                    </span>
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setRoleForm({
                      name: '',
                      displayName: '',
                      description: '',
                      priority: 0,
                      permissionIds: [],
                    })
                    setShowCreateRole(true)
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>

              {filteredRoles.length === 0 ? (
                <EmptyState
                  icon={<Shield className="h-10 w-10 text-gray-500" />}
                  title="No roles found"
                  message={
                    hasActiveSearch
                      ? `No roles match "${searchQuery}". Try a different search term.`
                      : 'No roles created yet. Create your first role to get started.'
                  }
                  actionLabel={hasActiveSearch ? 'Clear Search' : 'Create Role'}
                  onAction={
                    hasActiveSearch
                      ? () => {
                          setSearchQuery('')
                          setSearchTerm('')
                        }
                      : () => {
                          setRoleForm({
                            name: '',
                            displayName: '',
                            description: '',
                            priority: 0,
                            permissionIds: [],
                          })
                          setShowCreateRole(true)
                        }
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRoles.map((role) => (
                    <div key={role.id} className="glass rounded-xl p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={getRoleCardClasses(role.name)}>
                            {(() => {
                              const { IconComponent, className } = getRoleIcon(role.name, 'h-6 w-6')
                              return <IconComponent className={className} />
                            })()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{role.displayName}</h3>
                            <p className="text-sm text-gray-400">@{role.name}</p>
                          </div>
                        </div>
                        <div className={getRoleBadgeClasses(role.name)}>
                          {(() => {
                            const { IconComponent, className } = getRoleIcon(role.name)
                            return <IconComponent className={className} />
                          })()}
                          <span className="capitalize">{role.name}</span>
                        </div>
                      </div>

                      {role.description && (
                        <p className="text-sm text-gray-400 mb-4">{role.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Priority</p>
                          <p className="text-white font-medium">{role.priority}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Users</p>
                          <p className="text-white font-medium">{role.userCount}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Permissions ({role.permissions.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm.id} variant="outline" className="text-xs">
                              {perm.name}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!role.isSystem && (
                          <>
                            <Button
                              onClick={() => openEditRole(role)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRole(role)
                                setShowDeleteRole(true)
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-error-500/30 text-error-400 hover:bg-error-500/20"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                        {role.isSystem && (
                          <Badge
                            variant="outline"
                            className="flex-1 justify-center border-yellow-500/30 text-yellow-400"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            System Role
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-400">Permissions</p>
                    <p className="text-lg font-semibold text-white">
                      {hasPermissionFilters
                        ? `${showingPermissions}/${allPermissions.length}`
                        : allPermissions.length}
                    </p>
                </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-400">Categories</p>
                    <p className="text-lg font-semibold text-white">
                      {hasPermissionFilters
                        ? `${showingPermissionCategories}/${totalPermissionCategories}`
                        : totalPermissionCategories}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-400">Active Filters</p>
                    <p className="text-lg font-semibold text-white">
                      {hasPermissionFilters ? 'On' : 'Off'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPermissionForm({ key: '', name: '', description: '', category: 'general' })
                    setShowCreatePermission(true)
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Permission
                </Button>
                </div>
              </div>

              {Object.keys(filteredPermissionsByCategory).length === 0 ? (
                <EmptyState
                  icon={<Key className="h-10 w-10 text-gray-500" />}
                  title={hasPermissionFilters ? 'No permissions match' : 'No permissions found'}
                  message={
                    hasPermissionFilters
                      ? 'No permissions match the current filters. Try clearing your search or selecting a different category.'
                      : 'No permissions created yet. Create your first permission to get started.'
                  }
                  actionLabel={hasPermissionFilters ? 'Clear Filters' : 'Create Permission'}
                  onAction={
                    hasPermissionFilters
                      ? () => {
                          setSearchQuery('')
                          setSearchTerm('')
                          setPermissionCategoryFilter('all')
                        }
                      : () => {
                          setPermissionForm({
                            key: '',
                            name: '',
                            description: '',
                            category: 'general',
                          })
                    setShowCreatePermission(true)
                        }
                  }
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(filteredPermissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">{category}</h3>
                          <p className="text-xs text-gray-400">{perms.length} permission{perms.length === 1 ? '' : 's'}</p>
                        </div>
                        <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                          Category • {category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((perm) => (
                          <div key={perm.id} className="rounded-xl border border-white/10 bg-white/10 p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-white">{perm.name}</h4>
                                  <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10">
                                    {perm.key}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400">
                                  {(perm.description || '').trim().length > 0
                                    ? perm.description
                                    : 'No description provided.'}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => openEditPermission(perm)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-300 hover:text-white"
                                  title="Edit permission"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedPermission(perm)
                                    setShowDeletePermission(true)
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-error-300 hover:text-white"
                                  title="Delete permission"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-[11px] uppercase tracking-wide text-gray-500">
                              Key • {perm.key}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">
                    Total Users: <span className="text-white font-medium">{users.length}</span>
                  </span>
                  <span className="text-gray-400">
                    Showing:{' '}
                    <span className="text-white font-medium">{filteredUsers.length}</span>
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedUser(null)
                    setSelectedRoleForUser('')
                    setShowAssignRole(true)
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </div>

              {filteredUsers.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-10 w-10 text-gray-500" />}
                  title={
                    hasActiveSearch
                      ? 'No matching users'
                      : 'No users available for assignments'
                  }
                  message={
                    hasActiveSearch
                      ? 'No users match the current search. Try a different name or email.'
                      : 'Looks like there are no users yet. Invite users before assigning roles.'
                  }
                  actionLabel={hasActiveSearch ? 'Clear Search' : undefined}
                  onAction={
                    hasActiveSearch
                      ? () => {
                          setSearchQuery('')
                          setSearchTerm('')
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Current Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user.username || user.email}
                              </p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={getRoleBadgeClasses(user.role)}>
                              {(() => {
                                const { IconComponent, className } = getRoleIcon(user.role)
                                return <IconComponent className={className} />
                              })()}
                              <span className="capitalize">{user.role}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setSelectedRoleForUser(user.role)
                                  setShowAssignRole(true)
                                }}
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Change
                              </Button>
                              {user.role !== 'user' && (
                                <Button
                                  onClick={() => handleRemoveRole(user)}
                                  variant="outline"
                                  size="sm"
                                  className="border-warning-500/30 text-warning-400 hover:bg-warning-500/20"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCreateRole(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Role</h3>
              <button
                onClick={() => setShowCreateRole(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Name (lowercase, no spaces) *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      name: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="e.g., content-moderator"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={roleForm.displayName}
                  onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="e.g., Content Moderator"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 min-h-[80px] resize-y"
                  placeholder="Describe what this role can do..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority (0-100)</label>
                <input
                  type="number"
                  value={roleForm.priority}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, priority: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Higher priority = more permissions</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-3 border border-white/10">
                  {Object.entries(permissions).map(([category, perms]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                        {category}
                      </h4>
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer"
                        >
                          <Checkbox
                            checked={roleForm.permissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-white">{perm.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{perm.key}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCreateRole(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRole}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRole && selectedRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowEditRole(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Role</h3>
              <button
                onClick={() => setShowEditRole(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Display Name *</label>
                <input
                  type="text"
                  value={roleForm.displayName}
                  onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Priority (0-100)</label>
                <input
                  type="number"
                  value={roleForm.priority}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, priority: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Permissions</label>
                <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-3 border border-white/10">
                  {Object.entries(permissions).map(([category, perms]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                        {category}
                      </h4>
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer"
                        >
                          <Checkbox
                            checked={roleForm.permissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-white">{perm.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{perm.key}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditRole(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditRole}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {showDeleteRole && selectedRole && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteRole(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-error-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-error-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Role?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Are you sure you want to delete <strong>{selectedRole.displayName}</strong>?
                </p>
                <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-3">
                  <p className="text-error-300 text-xs font-semibold mb-1">⚠️ Warning</p>
                  <p className="text-error-300/80 text-xs">
                    This action cannot be undone. Users with this role will be reverted to the
                    default user role.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteRole(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRole}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Permission Modal */}
      {showCreatePermission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCreatePermission(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Permission</h3>
              <button
                onClick={() => setShowCreatePermission(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Key (lowercase, dots, hyphens) *
                </label>
                <input
                  type="text"
                  value={permissionForm.key}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      key: e.target.value.toLowerCase().replace(/\s+/g, '.'),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="e.g., content.reviews.moderate"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Name *</label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="e.g., Moderate Reviews"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={permissionForm.description}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 min-h-[80px] resize-y"
                  placeholder="Describe what this permission allows..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={permissionForm.category}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      category: e.target.value.toLowerCase(),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCreatePermission(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePermission}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Permission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditPermission && selectedPermission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowEditPermission(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Permission</h3>
              <button
                onClick={() => setShowEditPermission(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Key</label>
                <input
                  type="text"
                  value={permissionForm.key}
                  disabled
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Key cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Name *</label>
                <input
                  type="text"
                  value={permissionForm.name}
                  onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={permissionForm.description}
                  onChange={(e) =>
                    setPermissionForm({ ...permissionForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 min-h-[80px] resize-y"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={permissionForm.category}
                  onChange={(e) =>
                    setPermissionForm({
                      ...permissionForm,
                      category: e.target.value.toLowerCase(),
                    })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditPermission(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePermission}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permission Confirmation Modal */}
      {showDeletePermission && selectedPermission && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDeletePermission(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-error-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-error-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Permission?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Are you sure you want to delete <strong>{selectedPermission.name}</strong>?
                </p>
                <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-3">
                  <p className="text-error-300 text-xs font-semibold mb-1">⚠️ Warning</p>
                  <p className="text-error-300/80 text-xs">
                    This permission will be removed from all roles that currently have it.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeletePermission(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePermission}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permission
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowAssignRole(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Assign Role</h3>
              <button
                onClick={() => setShowAssignRole(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select User</label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find((u) => u.id === e.target.value)
                    setSelectedUser(user || null)
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Role</label>
                <select
                  value={selectedRoleForUser}
                  onChange={(e) => setSelectedRoleForUser(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                >
                  <option value="">Choose a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName} ({role.userCount} users)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowAssignRole(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignRole}
                disabled={!selectedUser || !selectedRoleForUser}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

