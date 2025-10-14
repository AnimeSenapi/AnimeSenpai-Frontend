'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { 
  MessageCircle, 
  Send, 
  Loader2,
  ArrowLeft,
  Search,
  Film
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState } from '../../components/ui/error-state'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../lib/toast-context'
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
  const toast = useToast()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return
    }
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, redirecting to sign in')
      router.push('/auth/signin')
      return
    }
    
    console.log('✅ User authenticated:', user.username)
    loadConversations()
  }, [isAuthenticated, authLoading, user])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Check for auth token
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      console.log('🔑 Auth token exists:', !!token)
      
      const { apiGetConversations } = await import('../lib/api')
      const data = await apiGetConversations()
      
      if (data?.conversations) {
        setConversations(data.conversations)
        console.log('✅ Loaded conversations:', data.conversations.length)
      } else {
        console.log('⚠️ No conversations data returned')
      }
    } catch (error: any) {
      console.error('❌ Failed to load conversations:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check if it's an auth error
      if (error.message?.includes('No authentication') || error.message?.includes('UNAUTHORIZED')) {
        toast.error('Please sign in to view messages', 'Authentication Required')
        router.push('/auth/signin')
      } else {
        toast.error(error.message || 'Failed to load conversations', 'Error')
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
      const data = await apiGetMessages(userId, { limit: 50 })
      
      if (data?.messages) {
        setMessages(data.messages)
        
        // Mark conversation as read
        setConversations(prev => 
          prev.map(conv => 
            conv.user.id === userId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Failed to load messages', 'Error')
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
      const data = await apiSendMessage(selectedConversation, newMessage)
      
      if (data?.message) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        
        // Update conversation last message
        setConversations(prev =>
          prev.map(conv =>
            conv.user.id === selectedConversation
              ? { ...conv, lastMessage: data.message }
              : conv
          )
        )
        toast.success('Message sent!', 'Success')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message', 'Error')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedUser = conversations.find(c => c.user.id === selectedConversation)?.user

  if (loading) {
    return <LoadingState variant="full" text="Loading messages..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Messages</h1>
            <p className="text-gray-400">Chat with friends and share recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-300px)] min-h-[500px]">
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
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
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
                filteredConversations.map(conv => (
                  <button
                    key={conv.user.id}
                    onClick={() => loadMessages(conv.user.id)}
                    className={cn(
                      "w-full p-4 border-b border-white/5 hover:bg-white/5 transition-all text-left",
                      selectedConversation === conv.user.id && "bg-white/10"
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
                              {conv.user.username[0].toUpperCase()}
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
                          <span className="font-semibold text-white truncate">
                            {conv.user.name || conv.user.username}
                          </span>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          conv.unreadCount > 0 ? "text-white font-medium" : "text-gray-400"
                        )}>
                          {conv.lastMessage?.anime
                            ? `📺 Recommended: ${conv.lastMessage.anime.titleEnglish || conv.lastMessage.anime.title}`
                            : conv.lastMessage?.content || 'No messages yet'
                          }
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
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link href={`/user/${selectedUser.username}`} className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
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
                        {selectedUser.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selectedUser.name || selectedUser.username}</div>
                    <div className="text-xs text-gray-400">@{selectedUser.username}</div>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        className={cn(
                          "flex gap-3",
                          isOwn ? "flex-row-reverse" : "flex-row"
                        )}
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
                                {message.sender.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[70%]",
                          isOwn ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-2",
                            isOwn 
                              ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white" 
                              : "bg-white/10 text-white"
                          )}>
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
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
                    maxLength={500}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
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
                <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-400">Choose a friend to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

