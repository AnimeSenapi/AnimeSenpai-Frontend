'use client'

import { useEffect, useState } from 'react'
import { apiGetAllUsers, apiAdminSearchUsers, apiUpdateUserRole, apiDeleteUser, apiGetUserDetails } from '../../lib/api'
import { Search, ChevronLeft, ChevronRight, Shield, ShieldCheck, Crown, Trash2, Ban, Eye, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  role: string
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    loadUsers()
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
    } catch (error) {
      console.error('Failed to load users:', error)
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
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    try {
      await apiUpdateUserRole(userId, newRole)
      loadUsers()
      alert('User role updated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
      return
    }

    try {
      await apiDeleteUser(userId)
      loadUsers()
      alert('User deleted successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to delete user')
    }
  }

  const handleViewDetails = async (user: User) => {
    try {
      const details = await apiGetUserDetails(user.id)
      setSelectedUser(details as any)
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-400">Manage user accounts and permissions</p>
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
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading users...</div>
        </div>
      ) : (
        <>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || user.username || 'Unknown'}</p>
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
                            onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
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
                <p className="text-white">{selectedUser.email}</p>
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
              {(selectedUser as any)._count && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Anime List Entries</p>
                  <p className="text-white">{(selectedUser as any)._count.userAnimeList}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

