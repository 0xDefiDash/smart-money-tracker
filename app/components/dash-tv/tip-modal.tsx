
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bitcoin, 
  Wallet, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  QrCode,
  Zap,
  DollarSign
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface TipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  streamerId: string
  streamerName: string
  streamerAvatar?: string
  streamId?: string
  videoId?: string
}

interface WalletInfo {
  walletAddress: string
  walletType: string
  blockchain: string
  qrCode?: string
}

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'bg-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'bg-blue-500' },
  { symbol: 'SOL', name: 'Solana', icon: 'S', color: 'bg-purple-500' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', color: 'bg-green-500' },
  { symbol: 'USDT', name: 'Tether', icon: '₮', color: 'bg-teal-500' },
]

const QUICK_AMOUNTS = [5, 10, 25, 50, 100]

export function TipModal({
  open,
  onOpenChange,
  streamerId,
  streamerName,
  streamerAvatar,
  streamId,
  videoId
}: TipModalProps) {
  const { data: session } = useSession() || {}
  const [selectedCrypto, setSelectedCrypto] = useState('ETH')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tipStatus, setTipStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (open) {
      fetchWalletInfo()
    }
  }, [open, streamerId])

  const fetchWalletInfo = async () => {
    try {
      const response = await fetch(`/api/dash-tv/wallet/${streamerId}`)
      if (response.ok) {
        const data = await response.json()
        setWalletInfo(data)
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error)
    }
  }

  const handleCopyAddress = () => {
    if (walletInfo?.walletAddress) {
      navigator.clipboard.writeText(walletInfo.walletAddress)
      setCopied(true)
      toast.success('Wallet address copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendTip = async () => {
    if (!session?.user) {
      toast.error('Please sign in to send tips')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!walletInfo?.walletAddress) {
      toast.error('Streamer wallet not configured')
      return
    }

    setLoading(true)
    setTipStatus('processing')

    try {
      const response = await fetch('/api/dash-tv/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStreamerId: streamerId,
          streamId,
          videoId,
          amount: parseFloat(amount),
          cryptocurrency: selectedCrypto,
          message,
          walletAddress: walletInfo.walletAddress
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTipStatus('success')
        toast.success(`Tip of ${amount} ${selectedCrypto} sent to ${streamerName}!`)
        
        setTimeout(() => {
          onOpenChange(false)
          setAmount('')
          setMessage('')
          setTipStatus('idle')
        }, 2000)
      } else {
        throw new Error('Failed to send tip')
      }
    } catch (error) {
      setTipStatus('error')
      toast.error('Failed to send tip. Please try again.')
      console.error('Error sending tip:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Send Crypto Tip</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Support {streamerName} with cryptocurrency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Streamer Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={streamerAvatar} />
              <AvatarFallback>{streamerName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{streamerName}</p>
              <p className="text-sm text-muted-foreground">Content Creator</p>
            </div>
          </div>

          {tipStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Tip Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {streamerName} will receive your {amount} {selectedCrypto} tip
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Crypto Selection */}
              <div className="space-y-3">
                <Label>Select Cryptocurrency</Label>
                <div className="grid grid-cols-5 gap-2">
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <button
                      key={crypto.symbol}
                      onClick={() => setSelectedCrypto(crypto.symbol)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        selectedCrypto === crypto.symbol
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${crypto.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {crypto.icon}
                      </div>
                      <span className="text-xs font-medium">{crypto.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label htmlFor="amount">Tip Amount ({selectedCrypto})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.001"
                  min="0"
                  className="text-lg"
                />
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="flex-1 min-w-[60px]"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Leave a message with your tip..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length}/200
                </p>
              </div>

              {/* Wallet Info */}
              {walletInfo && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Streamer's Wallet</Label>
                    <Badge variant="outline">{walletInfo.blockchain}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs p-2 bg-background rounded border overflow-x-auto">
                      {walletInfo.walletAddress}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {walletInfo.qrCode && (
                    <div className="flex justify-center pt-2">
                      <div className="relative w-32 h-32 bg-white rounded-lg p-2">
                        <Image
                          src={walletInfo.qrCode}
                          alt="Wallet QR Code"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSendTip}
                disabled={loading || !amount || !walletInfo}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Send {amount || '0'} {selectedCrypto} Tip
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By sending a tip, you agree to transfer cryptocurrency to the streamer's wallet address shown above.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
