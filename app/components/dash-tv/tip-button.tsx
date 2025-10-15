
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DollarSign, Gift, Zap } from 'lucide-react'
import { TipModal } from './tip-modal'
import { cn } from '@/lib/utils'

interface TipButtonProps {
  streamerId: string
  streamerName: string
  streamerAvatar?: string
  streamId?: string
  videoId?: string
  variant?: 'default' | 'compact' | 'floating'
  className?: string
}

export function TipButton({ 
  streamerId, 
  streamerName, 
  streamerAvatar,
  streamId,
  videoId,
  variant = 'default',
  className 
}: TipButtonProps) {
  const [showTipModal, setShowTipModal] = useState(false)

  const getButtonContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <>
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Tip</span>
          </>
        )
      case 'floating':
        return (
          <>
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Send Tip</span>
          </>
        )
      default:
        return (
          <>
            <Gift className="w-4 h-4" />
            <span>Send Crypto Tip</span>
          </>
        )
    }
  }

  const getButtonStyles = () => {
    switch (variant) {
      case 'compact':
        return 'h-8 px-3 gap-1'
      case 'floating':
        return 'h-12 px-6 gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
      default:
        return 'gap-2'
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowTipModal(true)}
        className={cn(getButtonStyles(), className)}
        variant={variant === 'floating' ? 'default' : 'outline'}
      >
        {getButtonContent()}
      </Button>

      <TipModal
        open={showTipModal}
        onOpenChange={setShowTipModal}
        streamerId={streamerId}
        streamerName={streamerName}
        streamerAvatar={streamerAvatar}
        streamId={streamId}
        videoId={videoId}
      />
    </>
  )
}
