'use client'

import { useState } from 'react'
import { AlertTriangle, Ban, Flag, X, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { cn } from '../../app/lib/utils'

interface BlockReportModalProps {
  userId: string
  username: string
  onClose: () => void
  onBlock?: () => void
  onReport?: () => void
}

export function BlockReportModal({
  userId,
  username,
  onClose,
  onBlock,
  onReport,
}: BlockReportModalProps) {
  const toast = useToast()

  const [mode, setMode] = useState<'menu' | 'block' | 'report'>('menu')
  const [reportReason, setReportReason] = useState<
    'spam' | 'harassment' | 'inappropriate_content' | 'fake_account' | 'other'
  >('spam')
  const [reportDescription, setReportDescription] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const handleBlock = async () => {
    try {
      setLoading(true)

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'

      const response = await fetch(`${API_URL}/safety.blockUser`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          reason: blockReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to block user')
      }

      toast.success(`Blocked @${username}`, 'User Blocked')
      if (onBlock) onBlock()
      onClose()
    } catch (error) {
      console.error('Failed to block user:', error)
      toast.error('Failed to block user', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async () => {
    if (reportDescription.length < 10) {
      toast.error('Please provide more details (at least 10 characters)', 'Error')
      return
    }

    try {
      setLoading(true)

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'

      const response = await fetch(`${API_URL}/safety.reportUser`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          reason: reportReason,
          description: reportDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to report user')
      }

      toast.success('Report submitted. Our team will review it.', 'Report Submitted')
      if (onReport) onReport()
      onClose()
    } catch (error) {
      console.error('Failed to report user:', error)
      toast.error('Failed to submit report', 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu */}
        {mode === 'menu' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning-400" />
                Safety Options
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">Choose an action for @{username}</p>

            <div className="space-y-3">
              <button
                onClick={() => setMode('block')}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-error-500/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-error-500/20 rounded-lg flex items-center justify-center">
                    <Ban className="h-5 w-5 text-error-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Block User</div>
                    <div className="text-xs text-gray-400">They won't be able to contact you</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('report')}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-warning-500/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-500/20 rounded-lg flex items-center justify-center">
                    <Flag className="h-5 w-5 text-warning-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Report User</div>
                    <div className="text-xs text-gray-400">Report for violations</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {/* Block Confirmation */}
        {mode === 'block' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ban className="h-5 w-5 text-error-400" />
                Block @{username}
              </h3>
              <button
                onClick={() => setMode('menu')}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-lg mb-6">
              <p className="text-sm text-error-300">
                <strong>Warning:</strong> Blocking this user will:
              </p>
              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                <li>• Remove them as a friend</li>
                <li>• Prevent them from messaging you</li>
                <li>• Hide their content from you</li>
                <li>• Hide your content from them</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Why are you blocking this user?"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-error-500/50 min-h-[80px]"
                maxLength={200}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setMode('menu')}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlock}
                disabled={loading}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Block User'}
              </Button>
            </div>
          </>
        )}

        {/* Report Form */}
        {mode === 'report' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag className="h-5 w-5 text-warning-400" />
                Report @{username}
              </h3>
              <button
                onClick={() => setMode('menu')}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Reason for report
              </label>
              <div className="space-y-2">
                {[
                  { value: 'spam', label: 'Spam' },
                  { value: 'harassment', label: 'Harassment or Bullying' },
                  { value: 'inappropriate_content', label: 'Inappropriate Content' },
                  { value: 'fake_account', label: 'Fake Account' },
                  { value: 'other', label: 'Other' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setReportReason(option.value as any)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-all text-left',
                      reportReason === option.value
                        ? 'bg-warning-500/20 border-warning-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Additional details *
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide details about why you're reporting this user..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-warning-500/50 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{reportDescription.length}/500 (min 10)</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setMode('menu')}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={loading || reportDescription.length < 10}
                className="flex-1 bg-warning-500 hover:bg-warning-600 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Report'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
