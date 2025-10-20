
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3 } from '@/lib/web3-provider';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  replies: Comment[];
}

interface CommentSectionProps {
  tweetId: string;
  initialCount?: number;
}

export default function CommentSection({ tweetId, initialCount = 0 }: CommentSectionProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && comments.length === 0) {
      fetchComments();
    }
  }, [isOpen]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shot-callers/tweets/${tweetId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/shot-callers/tweets/${tweetId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          userName: account?.slice(0, 6) + '...' + account?.slice(-4),
          content: newComment,
          parentId: null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const comment = await response.json();
      setComments([comment, ...comments]);
      setTotalCount(totalCount + 1);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toggle Comments Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4 mr-1.5" />
        {totalCount}
      </Button>

      {/* Comments Section */}
      {isOpen && (
        <div className="space-y-4 rounded-lg border bg-card p-4">
          {/* Comment Input */}
          <div className="space-y-2">
            <Textarea
              placeholder={isConnected ? "Share your thoughts..." : "Connect wallet to comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!isConnected}
              rows={3}
              className="resize-none"
            />
            {!isConnected ? (
              <Button onClick={connectWallet} className="w-full">
                Connect Wallet to Comment
              </Button>
            ) : (
              <Button
                onClick={handleSubmitComment}
                disabled={isSending || !newComment.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Comments List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>
                        {comment.userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
