
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3 } from '@/lib/web3-provider';
import CommentSection from './CommentSection';
import TipModal from './TipModal';
import { cn } from '@/lib/utils';

interface TweetEngagementBarProps {
  tweetId: string;
  kolUsername: string;
  kolDisplayName: string;
  initialLikes?: number;
  initialComments?: number;
  walletAddresses?: {
    ethAddress?: string;
    bnbAddress?: string;
    solAddress?: string;
    usdcEthAddress?: string;
    usdcBnbAddress?: string;
    usdcSolAddress?: string;
  };
}

export default function TweetEngagementBar({
  tweetId,
  kolUsername,
  kolDisplayName,
  initialLikes = 0,
  initialComments = 0,
  walletAddresses
}: TweetEngagementBarProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      checkIfLiked();
    }
  }, [isConnected, account, tweetId]);

  const checkIfLiked = async () => {
    try {
      const response = await fetch(
        `/api/shot-callers/tweets/${tweetId}/like?userAddress=${account}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsLiking(true);

    try {
      const response = await fetch(`/api/shot-callers/tweets/${tweetId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account,
          userName: account?.slice(0, 6) + '...' + account?.slice(-4)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like tweet');
    } finally {
      setIsLiking(false);
    }
  };

  const handleTip = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    setIsTipModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-4 pt-3 border-t">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "text-muted-foreground hover:text-red-500",
            isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4 mr-1.5", isLiked && "fill-current")} />
          {likesCount}
        </Button>

        {/* Comment Section */}
        <CommentSection tweetId={tweetId} initialCount={initialComments} />

        {/* Tip Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTip}
          className="text-muted-foreground hover:text-green-500 ml-auto"
        >
          <DollarSign className="h-4 w-4 mr-1.5" />
          Tip
        </Button>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        kolUsername={kolUsername}
        kolDisplayName={kolDisplayName}
        tweetId={tweetId}
        walletAddresses={walletAddresses}
      />
    </>
  );
}
