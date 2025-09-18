
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Heart,
  Gift,
  Crown,
  Star,
  Zap
} from 'lucide-react'

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
  userLevel: number
  userRank?: number
  isVerified?: boolean
  isModerator?: boolean
  isStreamer?: boolean
  messageType?: 'chat' | 'gift' | 'follow' | 'like'
  amount?: number
}

interface LiveChatProps {
  streamerId: string
}

export function LiveChat({ streamerId }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock chat messages
  const mockMessages: ChatMessage[] = [
    {
      id: 'msg1',
      username: 'BlockHunter92',
      message: 'This strategy is insane! 🔥',
      timestamp: Date.now() - 300000,
      userLevel: 23,
      userRank: 45,
      isVerified: false,
      messageType: 'chat'
    },
    {
      id: 'msg2',
      username: 'CryptoWhale',
      message: 'Just gifted 100 coins!',
      timestamp: Date.now() - 250000,
      userLevel: 67,
      userRank: 3,
      isVerified: true,
      messageType: 'gift',
      amount: 100
    },
    {
      id: 'msg3',
      username: 'NewbieFighter',
      message: 'How do you steal blocks so efficiently?',
      timestamp: Date.now() - 200000,
      userLevel: 8,
      messageType: 'chat'
    },
    {
      id: 'msg4',
      username: 'ModeratorX',
      message: 'Keep chat respectful everyone! 🛡️',
      timestamp: Date.now() - 150000,
      userLevel: 45,
      userRank: 12,
      isModerator: true,
      messageType: 'chat'
    },
    {
      id: 'msg5',
      username: 'DefidashFan',
      message: 'Started following! Great content 👑',
      timestamp: Date.now() - 100000,
      userLevel: 19,
      messageType: 'follow'
    },
    {
      id: 'msg6',
      username: 'EpicGamer2025',
      message: 'Can you show your block collection?',
      timestamp: Date.now() - 50000,
      userLevel: 31,
      userRank: 78,
      messageType: 'chat'
    }
  ]

  useEffect(() => {
    setMessages(mockMessages)

    // Simulate real-time chat messages
    const interval = setInterval(() => {
      const randomMessages = [
        { user: 'ChatViewer' + Math.floor(Math.random() * 1000), text: 'Amazing play! 🎯', level: Math.floor(Math.random() * 50) + 1 },
        { user: 'BlockMaster', text: 'What\'s your secret strategy?', level: Math.floor(Math.random() * 30) + 10 },
        { user: 'CryptoFan', text: 'LFG! 🚀', level: Math.floor(Math.random() * 40) + 5 },
        { user: 'GameProud', text: 'This is the best stream!', level: Math.floor(Math.random() * 35) + 15 },
        { user: 'DefidashLover', text: 'How long have you been playing?', level: Math.floor(Math.random() * 25) + 8 }
      ]

      const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)]
      
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        username: randomMsg.user,
        message: randomMsg.text,
        timestamp: Date.now(),
        userLevel: randomMsg.level,
        messageType: 'chat'
      }

      setMessages(prev => [...prev, newMsg])
    }, Math.random() * 15000 + 5000) // Random interval between 5-20 seconds

    return () => clearInterval(interval)
  }, [streamerId])

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: `user_msg_${Date.now()}`,
      username: 'You',
      message: newMessage,
      timestamp: Date.now(),
      userLevel: 25,
      userRank: 150,
      messageType: 'chat'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'now'
  }

  const getUserBadge = (message: ChatMessage) => {
    if (message.isStreamer) return <Crown className="w-3 h-3 text-yellow-500" />
    if (message.isModerator) return <Star className="w-3 h-3 text-blue-500" />
    if (message.isVerified) return <Zap className="w-3 h-3 text-green-500" />
    if (message.userRank && message.userRank <= 10) return <Crown className="w-3 h-3 text-orange-500" />
    return null
  }

  const getMessageColor = (message: ChatMessage) => {
    switch (message.messageType) {
      case 'gift': return 'text-yellow-400'
      case 'follow': return 'text-blue-400'
      case 'like': return 'text-pink-400'
      default: return 'text-gray-300'
    }
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Live Chat</span>
          </div>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="h-80" ref={scrollAreaRef}>
          <div className="space-y-3 pr-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-blue-400">{message.username}</span>
                  {getUserBadge(message)}
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    L{message.userLevel}
                  </Badge>
                  {message.userRank && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      #{message.userRank}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">{formatTime(message.timestamp)}</span>
                </div>
                
                <div className={`text-sm ${getMessageColor(message)}`}>
                  {message.messageType === 'gift' && (
                    <div className="flex items-center space-x-1">
                      <Gift className="w-4 h-4 text-yellow-500" />
                      <span>Gifted {message.amount} coins! 🎁</span>
                    </div>
                  )}
                  {message.messageType === 'follow' && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span>Started following the stream! 💫</span>
                    </div>
                  )}
                  {message.messageType === 'like' && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span>Liked the stream! ❤️</span>
                    </div>
                  )}
                  {message.messageType === 'chat' && (
                    <p>{message.message}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Say something nice..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-slate-800/50 border-slate-700/50 focus:border-blue-500/50"
            maxLength={200}
          />
          <Button 
            onClick={sendMessage}
            size="sm"
            disabled={!newMessage.trim()}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Reactions */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            🔥 Fire
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            👏 Clap
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            🚀 Rocket
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            💎 Diamond
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
