'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  Search,
  Film,
  UserPlus,
  X,
  Users,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../components/ui/toast'
import { cn } from '../lib/utils'

interface Conversation {
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
    anime?: {
      slug: string
      title: string
      titleEnglish: string | null
    } | null
  } | null
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  animeId: string | null
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  anime?: {
    id: string
    slug: string
    title: string
    titleEnglish: string | null
    coverImage: string | null
  } | null
}

export default function MessagesPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [friends, setFriends] = useState<any[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // User not authenticated, redirecting to sign in
      router.push('/auth/signin')
      return
    }

          // User authenticated successfully
    loadConversations()
  }, [isAuthenticated, authLoading, user])

  const loadConversations = async () => {
    try {
      setLoading(true)

      // Check for auth token
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      // Auth token check

      const { apiGetConversations } = await import('../lib/api')
      const data = (await apiGetConversations()) as any

      if (data?.conversations) {
        setConversations(data.conversations)
        // Conversations loaded successfully
      } else {
        // No conversations data returned
      }
    } catch (error: any) {
      console.error('❌ Failed to load conversations:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)

      // Check if it's an auth error
      if (error.message?.includes('No authentication') || error.message?.includes('UNAUTHORIZED')) {
        addToast({
        title: 'Authentication Required',
        description: 'Please sign in to view messages',
        variant: 'destructive',
      })
        router.push('/auth/signin')
      } else {
        addToast({
        title: 'Error',
        description: error.message || 'Failed to load conversations',
        variant: 'destructive',
      })
      }
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      setLoadingMessages(true)
      setSelectedConversation(userId)

      const { apiGetMessages } = await import('../lib/api')
      const data = (await apiGetMessages(userId, { limit: 50 })) as any

      if (data?.messages) {
        setMessages(data.messages)

        // Mark conversation as read
        setConversations((prev) =>
          prev.map((conv) => (conv.user.id === userId ? { ...conv, unreadCount: 0 } : conv))
        )
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSending(true)

      const { apiSendMessage } = await import('../lib/api')
      const data = (await apiSendMessage(selectedConversation, newMessage)) as any

      if (data?.message) {
        setMessages((prev) => [...prev, data.message])
        setNewMessage('')

        // Update conversation last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user.id === selectedConversation ? { ...conv, lastMessage: data.message } : conv
          )
        )
        addToast({
        title: 'Success',
        description: 'Message sent!',
        variant: 'success',
      })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      addToast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const loadFriends = async () => {
    try {
      setLoadingFriends(true)
      const { apiGetFriends } = await import('../lib/api')
      const data = (await apiGetFriends()) as any
      setFriends(data?.friends || [])
    } catch (error) {
      console.error('Failed to load friends:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load friends',
        variant: 'destructive',
      })
    } finally {
      setLoadingFriends(false)
    }
  }

  const startNewConversation = async (friendId: string) => {
    setShowNewMessageModal(false)
    setSelectedConversation(friendId)
    await loadMessages(friendId)
  }

  useEffect(() => {
    if (showNewMessageModal && friends.length === 0) {
      loadFriends()
    }
  }, [showNewMessageModal])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = conversations.find((c) => c.user.id === selectedConversation)?.user

  if (loading) {
    return <LoadingState variant="full" text="Loading messages..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
              <MessageCircle className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Messages</h1>
              <p className="text-gray-400 text-sm">Chat with friends and share recommendations</p>
            </div>
          </div>

          {/* New Message Button */}
          <Button
            onClick={() => setShowNewMessageModal(true)}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-5 py-2.5 text-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Message</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-380px)] min-h-[500px]">
          {/* Conversations List */}
          <div className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all text-sm"
                  style={{ borderRadius: '0.5rem' }}
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-500 text-xs mt-2">Start chatting with your friends!</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => loadMessages(conv.user.id)}
                    className={cn(
                      'w-full p-4 border-b border-white/10 hover:bg-white/5 transition-all text-left',
                      selectedConversation === conv.user.id && 'bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-l-2 border-l-primary-500'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
                          {conv.user.avatar ? (
                            <Image
                              src={conv.user.avatar}
                              alt={conv.user.username}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary-400">
                              {conv.user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{conv.unreadCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white truncate text-sm">
                            {conv.user.name || conv.user.username}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-xs truncate',
                            conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'
                          )}
                        >
                          {conv.lastMessage?.anime
                            ? `📺 ${conv.lastMessage.anime.titleEnglish || conv.lastMessage.anime.title}`
                            : conv.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message View */}
          {selectedConversation && selectedUser ? (
            <div className="glass rounded-xl border border-white/10 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link
                  href={`/user/${selectedUser.username}`}
                  className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10 flex-shrink-0">
                    {selectedUser.avatar ? (
                      <Image
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary-400">
                        {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {selectedUser.name || selectedUser.username}
                    </div>
                    <div className="text-xs text-gray-400">@{selectedUser.username}</div>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No messages yet</p>
                      <p className="text-gray-500 text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === user?.id

                    return (
                      <div
                        key={message.id}
                        className={cn('flex gap-3', isOwn ? 'flex-row-reverse' : 'flex-row', 'items-end')}
                      >
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10 flex-shrink-0">
                            {message.sender.avatar ? (
                              <Image
                                src={message.sender.avatar}
                                alt={message.sender.username}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary-400">
                                {message.sender.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn('max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
                          <div
                            className={cn(
                              'rounded-xl px-4 py-2.5',
                              isOwn
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                : 'bg-white/10 text-white border border-white/10'
                            )}
                          >
                            {message.anime && (
                              <Link href={`/anime/${message.anime.slug}`}>
                                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg mb-2 hover:bg-black/30 transition-all">
                                  {message.anime.coverImage && (
                                    <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 relative">
                                      <Image
                                        src={message.anime.coverImage}
                                        alt={message.anime.title}
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                                      <Film className="h-3 w-3" />
                                      <span>Anime Recommendation</span>
                                    </div>
                                    <div className="font-semibold text-sm truncate">
                                      {message.anime.titleEnglish || message.anime.title}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )}
                            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-2">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all text-sm"
                    style={{ borderRadius: '0.5rem' }}
                    maxLength={500}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{newMessage.length}/500</p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl border border-white/10 flex items-center justify-center">
              <div className="text-center p-12">
                <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-400 text-sm">Choose a friend to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Message Modal */}
      {showNewMessageModal &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowNewMessageModal(false)
              }
            }}
          >
            <div className="glass rounded-xl max-w-md w-full p-5 relative border border-white/10 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
              {/* Close Button */}
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                aria-label="Close new message modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <h3 className="text-xl font-semibold text-white mb-5 flex items-center gap-2 pr-10">
                <UserPlus className="h-5 w-5 text-primary-400" />
                New Message
              </h3>

              {/* Friends List */}
              <div className="flex-1 overflow-y-auto -mx-4 px-4">
                {loadingFriends ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No friends yet</p>
                    <p className="text-gray-500 text-xs mt-1">Add friends to start chatting!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend: any) => (
                      <button
                        key={friend.id}
                        onClick={() => startNewConversation(friend.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                      >
                        {friend.avatar ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={friend.avatar}
                              alt={friend.username}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary-400" />
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {friend.name || friend.username}
                          </p>
                          <p className="text-gray-400 text-xs truncate">@{friend.username}</p>
                        </div>
                        <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
