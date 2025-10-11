'use client'

import { MessageSquare, Flag, Eye } from 'lucide-react'

export function ContentTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Content Moderation</h2>
        <p className="text-gray-400">Manage posts, comments, and reports</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Content Moderation Coming Soon</h3>
        <p className="text-gray-400 mb-6">This feature will allow you to moderate user-generated content including posts, comments, and reports.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4">
            <MessageSquare className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Manage Posts</p>
            <p className="text-xs text-gray-500 mt-1">Review and moderate posts</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Flag className="h-6 w-6 text-warning-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Handle Reports</p>
            <p className="text-xs text-gray-500 mt-1">Review flagged content</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Eye className="h-6 w-6 text-success-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Monitor Activity</p>
            <p className="text-xs text-gray-500 mt-1">Track user interactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}

