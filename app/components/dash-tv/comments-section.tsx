
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Heart,
  Reply,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  videoId?: string
  streamId?: string
}

export function CommentsSection({ videoId, streamId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [videoId, streamId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const params = videoId ? `videoId=${videoId}` : `streamId=${streamId}`
      const response = await fetch(`/api/dash-tv/comments?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (parentId: string | null = null) => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/dash-tv/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          streamId,
          content: newComment.trim(),
          parentId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment')
      }

      toast.success('Comment posted!')
      setNewComment('')
      setReplyingTo(null)
      loadComments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="bg-slate-900/80 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-slate-800/50 border-slate-700/50 min-h-[80px]"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/500
            </span>
            <Button
              onClick={() => handleSubmit(null)}
              disabled={submitting || !newComment.trim()}
              size="sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.user?.avatar || comment.user?.displayName?.[0] || '?'}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{comment.user?.displayName}</span>
                      {comment.user?.isVerified && (
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        @{comment.user?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    
                    <div className="flex items-center space-x-3 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                      {comment.replies?.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 space-y-3 pl-4 border-l-2 border-slate-700/50">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                          {reply.user?.avatar || reply.user?.displayName?.[0] || '?'}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">{reply.user?.displayName}</span>
                            {reply.user?.isVerified && (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-300">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="ml-12 space-y-2">
                    <Textarea
                      placeholder={`Reply to ${comment.user?.displayName}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50"
                      maxLength={500}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSubmit(comment.id)}
                        disabled={submitting || !newComment.trim()}
                        size="sm"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Reply
                      </Button>
                      <Button
                        onClick={() => {
                          setReplyingTo(null)
                          setNewComment('')
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
