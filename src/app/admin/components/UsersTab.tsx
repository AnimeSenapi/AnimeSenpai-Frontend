'use client'

import { useEffect, useState } from 'react'
import {
  apiGetAllUsers,
  apiAdminSearchUsers,
  apiDeleteUser,
  apiGetUserDetails,
  apiSendPasswordResetEmail,
  apiToggleEmailVerification,
  apiUpdateUserDetails,
  apiGetUserActivity,
  apiSendCustomEmail,
} from '../../lib/api'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  X,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowUpDown,
  Check,
  Users,
  KeyRound,
  Edit,
  Send,
  Activity,
  MailOpen,
  Filter,
  LayoutDashboard,
  RotateCcw,
} from 'lucide-react'
import { getRoleConfig, getRoleIcon, getRoleBadgeClasses } from '../../../lib/role-config'
import { Button } from '../../../components/ui/button'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../../components/ui/error-state'
import { Badge } from '../../../components/ui/badge'
import { Checkbox } from '../../../components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'
import { useToast } from '../../../components/ui/toast'

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

interface UserActivity {
  user: {
    id: string
    email: string
    name: string | null
    username: string | null
    createdAt: string
    lastLoginAt: string | null
  }
  stats: {
    animeList: number
    reviews: number
    friends: number
    followers: number
  }
  recentActivity: Array<{
    id: string
    eventType: string
    createdAt: string
    ipAddress: string | null
    userAgent: string | null
  }>
}

export function UsersTab() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(() => new Set())
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastLoginAt' | 'email'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all')

  // New modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ username: '', email: '' })
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' })
  const [userToEmail, setUserToEmail] = useState<User | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [loadingActivity, setLoadingActivity] = useState(false)

  useEffect(() => {
    if (isSearchMode) {
      // Pagination of search results is handled locally (single page)
      return
    }
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter])

  const loadUsers = async (override?: { page?: number; role?: string }) => {
    setLoading(true)
    setLoadError(null)

    const activePage = override?.page ?? page
    const activeRole = override?.role ?? roleFilter

    try {
      const data = (await apiGetAllUsers({
        page: activePage,
        limit: 20,
        role: activeRole === 'all' ? undefined : activeRole,
      })) as any

      const normalizedUsers = data?.users || []
      const pages =
        data?.pagination?.pages || data?.pagination?.totalPages || data?.pagination?.total || 1

      setUsers(normalizedUsers)
      setTotalPages(Math.max(pages, 1))
      setIsSearchMode(false)
      setSelectedUsers(new Set())
    } catch (error: any) {
      console.error('Failed to load users:', error)

      if (error?.message?.includes('FORBIDDEN') || error?.message?.includes('admin')) {
        alert('Access denied. Admin privileges required.')
        window.location.href = '/dashboard'
        return
      }

      setLoadError(
        error instanceof Error
          ? error.message || 'Failed to load users. Please try again.'
          : 'Failed to load users. Please try again.'
      )
      setUsers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    const term = searchQuery.trim()

    if (!term) {
      setSearchTerm('')
      setIsSearchMode(false)
      setPage(1)
      loadUsers({ page: 1 })
      return
    }

    try {
      setLoading(true)
      setLoadError(null)
      const results = (await apiAdminSearchUsers(term, 50)) as any
      const normalizedResults = Array.isArray(results)
        ? results
        : Array.isArray(results?.users)
          ? results.users
          : []

      setUsers(normalizedResults)
      setSearchTerm(term)
      setIsSearchMode(true)
      setPage(1)
      setTotalPages(1)
      setSelectedUsers(new Set())
    } catch (error: any) {
      console.error('Search failed:', error)
      setLoadError(
        error instanceof Error
          ? error.message || 'Search failed. Please try again.'
          : 'Search failed. Please try again.'
      )
      setUsers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
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
      addToast({
        title: 'Deleted',
        description: `User ${userToDelete.username || userToDelete.email} deleted successfully`,
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const handleViewDetails = async (user: User) => {
    try {
      setLoadingActivity(true)
      const [details, activity] = await Promise.all([
        apiGetUserDetails(user.id) as any,
        apiGetUserActivity(user.id) as any,
      ])
      setSelectedUser(details as UserDetails)
      setUserActivity(activity as UserActivity)
      setShowUserModal(true)
    } catch (error) {
      console.error('Failed to load user details:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load user details',
        variant: 'destructive',
      })
    } finally {
      setLoadingActivity(false)
    }
  }

  const handleSendPasswordReset = async (user: User) => {
    try {
      await apiSendPasswordResetEmail(user.id)
      addToast({
        title: 'Email Sent',
        description: `Password reset email sent to ${user.email}`,
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to send password reset email',
        variant: 'destructive',
      })
    }
  }

  const handleToggleEmailVerification = async (user: User) => {
    const action = user.emailVerified ? 'unverify' : 'verify'

    try {
      await apiToggleEmailVerification(user.id, !user.emailVerified)
      loadUsers()
      addToast({
        title: 'Success',
        description: `Email ${action}ed successfully`,
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || `Failed to ${action} email`,
        variant: 'destructive',
      })
    }
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user)
    setEditForm({
      username: user.username || '',
      email: user.email,
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!userToEdit) return

    // Validate inputs
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      addToast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    if (editForm.username && (editForm.username.length < 3 || editForm.username.length > 30)) {
      addToast({
        title: 'Invalid Username',
        description: 'Username must be between 3 and 30 characters',
        variant: 'destructive',
      })
      return
    }

    // Check if anything changed
    if (
      editForm.username === (userToEdit.username || '') &&
      editForm.email === userToEdit.email
    ) {
      addToast({
        title: 'No Changes',
        description: 'No changes detected',
        variant: 'destructive',
      })
      return
    }

    try {
      const updates: any = {}
      if (editForm.username !== (userToEdit.username || ''))
        updates.username = editForm.username || undefined
      if (editForm.email !== userToEdit.email) updates.email = editForm.email

      await apiUpdateUserDetails(userToEdit.id, updates)
      loadUsers()
      setShowEditModal(false)
      setUserToEdit(null)
      addToast({
        title: 'Success',
        description: 'User details updated successfully',
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update user details',
        variant: 'destructive',
      })
    }
  }

  const handleSendCustomEmail = (user: User) => {
    setUserToEmail(user)
    setEmailForm({ subject: '', message: '' })
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    if (!userToEmail || !emailForm.subject || !emailForm.message) {
      addToast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      await apiSendCustomEmail(userToEmail.id, emailForm.subject, emailForm.message)
      setShowEmailModal(false)
      setUserToEmail(null)
      addToast({
        title: 'Success',
        description: 'Email sent successfully',
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to send email',
        variant: 'destructive',
      })
    }
  }

  const handleResetFilters = () => {
    const wasRoleChanged = roleFilter !== 'all'
    const wasVerifiedChanged = verifiedFilter !== 'all'
    const wasSearchChanged = searchTerm.length > 0 || searchQuery.length > 0
    const wasPageChanged = page !== 1

    setRoleFilter('all')
    setVerifiedFilter('all')
    setSearchQuery('')
    setSearchTerm('')
    setIsSearchMode(false)
    setPage(1)
    setSelectedUsers(new Set())

    loadUsers({ page: 1, role: 'all' })
  }


  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const toggleSelectAll = (visibleUsers: User[]) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      const allVisibleSelected = visibleUsers.every((user) => next.has(user.id))

      if (allVisibleSelected) {
        visibleUsers.forEach((user) => next.delete(user.id))
      } else {
        visibleUsers.forEach((user) => next.add(user.id))
      }

      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return

    try {
      for (const userId of selectedUsers) {
        await apiDeleteUser(userId)
      }
      loadUsers()
      setSelectedUsers(new Set())
      addToast({
        title: 'Success',
        description: `Deleted ${selectedUsers.size} users`,
        variant: 'success',
      })
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: 'Failed to delete some users',
        variant: 'destructive',
      })
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Email',
      'Username',
      'Role',
      'Email Verified',
      'Created At',
      'Last Login',
    ]
    const rows = filteredUsers.map((u) => [
      u.email,
      u.username || '',
      u.role,
      u.emailVerified ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleString(),
      u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `animesenpai-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast({
        title: 'Exported',
        description: 'Users exported to CSV',
        variant: 'success',
      })
  }

  const getFilteredAndSortedUsers = () => {
    let filtered = [...users]

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    // Filter by verification status
    if (verifiedFilter !== 'all') {
      filtered = filtered.filter((u) =>
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

  const filteredUsers = getFilteredAndSortedUsers()
  const hasActiveFilters =
    roleFilter !== 'all' || verifiedFilter !== 'all' || searchTerm.length > 0 || isSearchMode
  const showInitialLoading = loading && users.length === 0 && !loadError
  const showError = !loading && Boolean(loadError)
  const showEmpty = !loading && !loadError && filteredUsers.length === 0
  const resolvedErrorMessage =
    loadError || 'Failed to load users. Please try again.'
  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedUsers.has(user.id))
  const verifiedCount = filteredUsers.filter((u) => u.emailVerified).length
  const adminCount = filteredUsers.filter((u) => u.role === 'admin').length

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Users className="h-4 w-4" />
              User Management
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Manage Members</h2>
              <p className="text-sm text-gray-400">Search users, adjust roles, and monitor account activity.</p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-3">
            <Button
              onClick={() => handleResetFilters()}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset Filters</span>
            </Button>
            <Button
              onClick={() => loadUsers({ page: 1 })}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/40"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/40"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="moderator">Moderators</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus;border-primary-500/40"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <Button
                onClick={handleSearch}
                size="sm"
                className="min-w-[110px] bg-primary-500/20 border border-primary-500/40 text-primary-100 hover:bg-primary-500/30"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-gray-400">
            <div className="flex flex-wrap gap-4">
              <span>
                Showing <span className="font-semibold text-white">{filteredUsers.length}</span> users
              </span>
              <span>
                Verified <span className="font-semibold text-green-300">{verifiedCount}</span>
              </span>
              <span>
                Admins <span className="font-semibold text-yellow-300">{adminCount}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasActiveFilters && (
                <Button
                  onClick={handleResetFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </Button>
              )}
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {selectedUsers.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3">
          <p className="text-sm text-primary-100">
            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedUsers(new Set())}
              variant="ghost"
              size="sm"
              className="text-primary-100 hover:text-white"
            >
              Clear
            </Button>
            <Button
              onClick={handleBulkDelete}
              variant="outline"
              size="sm"
              className="border-error-500/40 text-error-200 hover:bg-error-500/20"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {showInitialLoading ? (
        <LoadingState variant="inline" text="Loading users..." size="md" />
      ) : showError ? (
        <ErrorState
          variant="inline"
          title="Unable to load users"
          message={resolvedErrorMessage}
          showRetry
          showHome={false}
          onRetry={() => loadUsers({ page: 1 })}
        />
      ) : showEmpty ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-primary-300" />}
          title="No users to display"
          message={
            hasActiveFilters
              ? 'No users match the current filters or search term.'
              : 'No users have registered yet.'
          }
          suggestions={
            hasActiveFilters
              ? [
                  'Try resetting the filters to view all users',
                  'Search for a different name or email address',
                ]
              : [
                  'Invite users to join AnimeSenpai',
                  'Seed initial accounts for testing and moderation',
                ]
          }
          actionLabel="Reset filters"
          onAction={handleResetFilters}
          secondaryActionLabel="Reload"
          onSecondaryAction={() => loadUsers({ page: 1 })}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={() => toggleSelectAll(filteredUsers)}
                      />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortBy === 'email') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        } else {
                          setSortBy('email')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        User
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortBy === 'createdAt') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        } else {
                          setSortBy('createdAt')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Joined
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => {
                        if (sortBy === 'lastLoginAt') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                        } else {
                          setSortBy('lastLoginAt')
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        Last Login
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">
                              {user.username || user.email}
                            </p>
                            {user.emailVerified ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-warning-400" />
                            )}
                          </div>
                          {user.username && <p className="text-xs text-gray-400">{user.email}</p>}
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
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <TooltipProvider>
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleViewDetails(user)}
                                  className="p-1.5 hover:bg-primary-500/20 rounded text-primary-400 hover:text-primary-300 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>View Details & Activity</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit User</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleSendPasswordReset(user)}
                                  className="p-1.5 hover:bg-orange-500/20 rounded text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Send Password Reset</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleToggleEmailVerification(user)}
                                  className={`p-1.5 rounded transition-colors ${user.emailVerified ? 'hover:bg-warning-500/20 text-warning-400 hover:text-warning-300' : 'hover:bg-success-500/20 text-success-400 hover:text-success-300'}`}
                                >
                                  {user.emailVerified ? (
                                    <AlertCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {user.emailVerified ? 'Unverify Email' : 'Verify Email'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleSendCustomEmail(user)}
                                  className="p-1.5 hover:bg-purple-500/20 rounded text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                  <MailOpen className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Send Custom Email</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 hover:bg-error-500/20 rounded text-error-400 hover:text-error-300 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">
                          {user.username || user.email}
                        </p>
                        {user.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-warning-400 flex-shrink-0" />
                        )}
                      </div>
                      {user.username && (
                        <p className="text-xs text-gray-400 break-all">{user.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className={getRoleBadgeClasses(user.role)}>
                          {(() => {
                            const { IconComponent, className } = getRoleIcon(user.role)
                            return <IconComponent className={className} />
                          })()}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3 pb-3 border-b border-white/10">
                  <div>
                    <p className="text-gray-400">Joined</p>
                    <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Login</p>
                    <p className="text-white">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-primary-500/20 rounded text-primary-400 hover:text-primary-300 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-[10px]">View</span>
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-[10px]">Edit</span>
                  </button>
                  <button
                    onClick={() => handleSendPasswordReset(user)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-orange-500/20 rounded text-orange-400 hover:text-orange-300 transition-colors"
                    title="Password"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span className="text-[10px]">Reset</span>
                  </button>
                  <button
                    onClick={() => handleToggleEmailVerification(user)}
                    className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${user.emailVerified ? 'hover:bg-warning-500/20 text-warning-400 hover:text-warning-300' : 'hover:bg-success-500/20 text-success-400 hover:text-success-300'}`}
                    title={user.emailVerified ? 'Unverify' : 'Verify'}
                  >
                    {user.emailVerified ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="text-[10px]">
                      {user.emailVerified ? 'Unverify' : 'Verify'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handleSendCustomEmail(user)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-purple-500/20 rounded text-purple-400 hover:text-purple-300 transition-colors"
                    title="Email"
                  >
                    <MailOpen className="h-4 w-4" />
                    <span className="text-[10px]">Email</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-error-500/20 rounded text-error-400 hover:text-error-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-[10px]">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {isSearchMode
                ? `${filteredUsers.length} matching users`
                : `Page ${page} of ${totalPages}`}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details & Activity</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingActivity ? (
              <LoadingState variant="inline" text="Loading activity..." size="sm" />
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Username</p>
                    <p className="text-white">{selectedUser.username || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">User ID</p>
                    <p className="text-white break-all">{selectedUser.id}</p>
                  </div>
                  <div className="md:col-span-2">
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
                    <div className={getRoleBadgeClasses(selectedUser.role)}>
                      {(() => {
                        const { IconComponent, className } = getRoleIcon(selectedUser.role)
                        return <IconComponent className={className} />
                      })()}
                      <span className="capitalize">{selectedUser.role}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Joined</p>
                    <p className="text-white">
                      {new Date(selectedUser.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Login</p>
                    <p className="text-white">
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {userActivity && (
                  <>
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary-400" />
                        User Statistics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Anime List</p>
                          <p className="text-xl font-bold text-white">
                            {userActivity.stats.animeList}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Reviews</p>
                          <p className="text-xl font-bold text-white">
                            {userActivity.stats.reviews}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Friends</p>
                          <p className="text-xl font-bold text-white">
                            {userActivity.stats.friends}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Followers</p>
                          <p className="text-xl font-bold text-white">
                            {userActivity.stats.followers}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    {userActivity.recentActivity.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-white mb-3">
                          Recent Security Events
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {userActivity.recentActivity.map((event) => (
                            <div
                              key={event.id}
                              className="bg-white/5 rounded-lg p-3 border border-white/10 text-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium">
                                  {event.eventType.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(event.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {event.ipAddress && (
                                <p className="text-xs text-gray-400">IP: {event.ipAddress}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteConfirm(false)}
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
                <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Are you sure you want to delete{' '}
                  <strong>
                    {userToDelete.username || userToDelete.email}
                  </strong>
                  ?
                </p>
                <div className="bg-error-500/10 border border-error-500/20 rounded-lg p-3 mb-4">
                  <p className="text-error-300 text-xs font-semibold mb-1">⚠️ Warning</p>
                  <p className="text-error-300/80 text-xs">
                    This action cannot be undone. All user data, including their anime list,
                    ratings, and activity, will be permanently deleted.
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

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-400" />
                Edit User Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="Unique username"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="user@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Changing email will mark it as unverified
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Email Modal */}
      {showEmailModal && userToEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-lg w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MailOpen className="h-5 w-5 text-purple-400" />
                Send Custom Email
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-sm text-gray-400">Sending to:</p>
              <p className="text-white font-medium">
                {userToEmail.username || userToEmail.email || 'Unknown'}
              </p>
              <p className="text-sm text-gray-400">{userToEmail.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  placeholder="Email subject"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message *</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 min-h-[150px] resize-y"
                  placeholder="Your message to the user..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {emailForm.message.length}/5000 characters
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEmailModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                disabled={!emailForm.subject || !emailForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
