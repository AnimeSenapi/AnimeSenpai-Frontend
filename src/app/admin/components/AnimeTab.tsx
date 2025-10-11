'use client'

import { Film, Plus, Edit, Database } from 'lucide-react'

export function AnimeTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Anime Management</h2>
        <p className="text-gray-400">Manage anime database and metadata</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Film className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Anime Management Coming Soon</h3>
        <p className="text-gray-400 mb-6">This feature will allow you to manage the anime database, add new entries, edit existing ones, and sync with external APIs.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4">
            <Plus className="h-6 w-6 text-success-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Add Anime</p>
            <p className="text-xs text-gray-500 mt-1">Import new anime entries</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Edit className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Edit Metadata</p>
            <p className="text-xs text-gray-500 mt-1">Update anime information</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Database className="h-6 w-6 text-secondary-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Sync Database</p>
            <p className="text-xs text-gray-500 mt-1">Sync with external APIs</p>
          </div>
        </div>
      </div>
    </div>
  )
}

