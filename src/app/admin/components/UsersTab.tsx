'use client'

import { useEffect, useState } from 'react'
import { apiGetAllUsers, apiAdminSearchUsers, apiUpdateUserRole, apiDeleteUser, apiGetUserDetails } from '../../lib/api'
import { Search, ChevronLeft, ChevronRight, Shield, ShieldCheck, Crown, Trash2, Ban, Eye, X, RefreshCw, Mail, CheckCircle, AlertCircle, Download, ArrowUpDown, Check, Users } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState } from '../../../components/ui/error-state'
import { Badge } from '../../../components/ui/badge'
import { useToast } from '../../../lib/toast-context'

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  role: 'user' | 'moderator' | 'admin'
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

interface UserDetails extends User {
  _count?: {
    userAnimeList: number
  }
}

export function UsersTab() {
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastLoginAt' | 'email'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await apiGetAllUsers({ 
        page, 
        limit: 20,
        role: roleFilter === 'all' ? undefined : roleFilter 
      })
      setUsers(data.users)
      setTotalPages(data.pagination.pages)
    } catch (error: any) {
      console.error('Failed to load users:', error)
      if (error.message?.includes('FORBIDDEN') || error.message?.includes('admin')) {
        alert('Access denied. Admin privileges required.')
        window.location.href = '/dashboard'
      } else {
        alert('Failed to load users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers()
      return
    }

    try {
      setLoading(true)
      const results = await apiAdminSearchUsers(searchQuery, 20)
      setUsers(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      await apiUpdateUserRole(userId, newRole)
      loadUsers()
      toast.success(`User role updated to ${newRole}`, 'Success')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role', 'Error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    setUserToDelete(user || null)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await apiDeleteUser(userToDelete.id)
      loadUsers()
      setShowUserModal(false)
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      toast.success('User deleted successfully', 'Deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user', 'Error')
    }
  }

  const handleViewDetails = async (user: User) => {
    try {
      const details = await apiGetUserDetails(user.id)
      setSelectedUser(details as UserDetails)
      setShowUserModal(true)
    } catch (error) {
      console.error('Failed to load user details:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-400" />
      case 'moderator':
        return <ShieldCheck className="h-4 w-4 text-blue-400" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return
    
    if (!confirm(`Delete ${selectedUsers.size} selected users? This cannot be undone!`)) {
      return
    }

    try {
      for (const userId of selectedUsers) {
        await apiDeleteUser(userId)
      }
      loadUsers()
      setSelectedUsers(new Set())
      toast.success(`Deleted ${selectedUsers.size} users`, 'Success')
    } catch (error: any) {
      toast.error('Failed to delete some users', 'Error')
    }
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Username', 'Name', 'Role', 'Email Verified', 'Created At', 'Last Login']
    const rows = users.map(u => [
      u.email,
      u.username || '',
      u.name || '',
      u.role,
      u.emailVerified ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleString(),
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `animesenpai-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Users exported to CSV', 'Exported')
  }

  const getFilteredAndSortedUsers = () => {
    let filtered = [...users]

    // Filter by verification status
    if (verifiedFilter !== 'all') {
      filtered = filtered.filter(u => 
        verifiedFilter === 'verified' ? u.emailVerified : !u.emailVerified
      )
    }

    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'email') {
        comparison = a.email.localeCompare(b.email)
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'lastLoginAt') {
        const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
        const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
        comparison = aTime - bTime
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'moderator':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
          />
          <Button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 rounded-lg"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="moderator">Moderators</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Bulk Actions & Export */}
      {selectedUsers.size > 0 && (
        <div className="glass rounded-lg p-4 border border-primary-500/30 flex items-center justify-between">
          <p className="text-white font-medium">
            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedUsers(new Set())}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="border-error-500/30 text-error-300 hover:bg-error-500/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Stats & Export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">
            Total: <span className="text-white font-medium">{users.length}</span>
          </span>
          <span className="text-gray-400">
            Verified: <span className="text-green-400 font-medium">{users.filter(u => u.emailVerified).length}</span>
          </span>
          <span className="text-gray-400">
            Admins: <span className="text-yellow-400 font-medium">{users.filter(u => u.role === 'admin').length}</span>
          </span>
        </div>
        <Button
          onClick={exportToCSV}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingState variant="inline" text="Loading users..." size="md" />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-gray-500" />}
          title="No users found"
          message={
            searchQuery
              ? `No users match "${searchQuery}". Try a different search term.`
              : roleFilter !== 'all'
              ? `No users with role "${roleFilter}". Try changing the filter.`
              : 'No users registered yet.'
          }
          actionLabel={searchQuery || roleFilter !== 'all' ? 'Clear Filters' : undefined}
          onAction={
            searchQuery || roleFilter !== 'all'
              ? () => {
                  setSearchQuery('')
                  setRoleFilter('all')
                  loadUsers()
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => {
                      if (sortBy === 'email') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('email')
                      }
                    }}>
                      <div className="flex items-center gap-1">
                        User
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => {
                      if (sortBy === 'createdAt') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('createdAt')
                      }
                    }}>
                      <div className="flex items-center gap-1">
                        Joined
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => {
                      if (sortBy === 'lastLoginAt') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy('lastLoginAt')
                      }
                    }}>
                      <div className="flex items-center gap-1">
                        Last Login
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {getFilteredAndSortedUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{user.name || user.username || 'Unknown'}</p>
                            {user.emailVerified ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-warning-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-1.5 hover:bg-primary-500/20 rounded text-primary-400 hover:text-primary-300"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'moderator' | 'admin')}
                            className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-primary-500/50"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-error-500/20 rounded text-error-400 hover:text-error-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowUserModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Name</p>
                <p className="text-white">{selectedUser.name || selectedUser.username || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-white">{selectedUser.email}</p>
                  {selectedUser.emailVerified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-warning-500/20 text-warning-400 border-warning-500/30 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Role</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                  {getRoleIcon(selectedUser.role)}
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Joined</p>
                <p className="text-white">{new Date(selectedUser.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Last Login</p>
                <p className="text-white">
                  {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email Verified</p>
                <p className={selectedUser.emailVerified ? 'text-success-400' : 'text-error-400'}>
                  {selectedUser.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedUser._count && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Anime List Entries</p>
                  <p className="text-white">{selectedUser._count.userAnimeList}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full border border-error-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-error-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Are you sure you want to delete <strong>{userToDelete.name || userToDelete.username || userToDelete.email}</strong>?
                </p>
                <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-3 mb-4">
                  <p className="text-error-300 text-xs font-semibold mb-1">⚠️ Warning</p>
                  <p className="text-error-300/80 text-xs">
                    This action cannot be undone. All user data, including their anime list, ratings, and activity, will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteUser}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

