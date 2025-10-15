
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Wallet, CheckCircle2, AlertCircle, Copy, QrCode, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

const WALLET_TYPES = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'phantom', label: 'Phantom' },
  { value: 'coinbase', label: 'Coinbase Wallet' },
  { value: 'trust', label: 'Trust Wallet' },
  { value: 'other', label: 'Other' },
]

const BLOCKCHAINS = [
  { value: 'ethereum', label: 'Ethereum', supported: ['ETH', 'USDC', 'USDT'] },
  { value: 'solana', label: 'Solana', supported: ['SOL', 'USDC'] },
  { value: 'polygon', label: 'Polygon', supported: ['MATIC', 'USDC', 'USDT'] },
  { value: 'bitcoin', label: 'Bitcoin', supported: ['BTC'] },
]

interface WalletSetupProps {
  streamerId?: string
}

export function WalletSetup({ streamerId }: WalletSetupProps) {
  const { data: session } = useSession() || {}
  const [walletAddress, setWalletAddress] = useState('')
  const [walletType, setWalletType] = useState('')
  const [blockchain, setBlockchain] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)
  const [walletData, setWalletData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (streamerId) {
      fetchWalletInfo()
    }
  }, [streamerId])

  const fetchWalletInfo = async () => {
    try {
      const response = await fetch(`/api/dash-tv/wallet/${streamerId}`)
      if (response.ok) {
        const data = await response.json()
        setWalletData(data)
        setHasWallet(true)
        setWalletAddress(data.walletAddress)
        setWalletType(data.walletType)
        setBlockchain(data.blockchain)
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  const handleSaveWallet = async () => {
    if (!walletAddress || !walletType || !blockchain) {
      toast.error('Please fill in all fields')
      return
    }

    // Basic wallet address validation
    if (walletAddress.length < 20) {
      toast.error('Invalid wallet address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/dash-tv/wallet', {
        method: hasWallet ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId,
          walletAddress,
          walletType,
          blockchain,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWalletData(data)
        setHasWallet(true)
        toast.success('Wallet saved successfully!')
      } else {
        throw new Error('Failed to save wallet')
      }
    } catch (error) {
      toast.error('Failed to save wallet')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    toast.success('Wallet address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedBlockchain = BLOCKCHAINS.find(b => b.value === blockchain)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Crypto Wallet Setup
        </CardTitle>
        <CardDescription>
          Configure your crypto wallet to receive tips from viewers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasWallet && walletData && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Wallet Connected
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can now receive crypto tips from your viewers!
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Tips Received:</span>
                <span className="font-semibold">
                  ${walletData.totalTipsReceivedUsd?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockchain">Blockchain Network</Label>
            <Select value={blockchain} onValueChange={setBlockchain}>
              <SelectTrigger>
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                {BLOCKCHAINS.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{chain.label}</span>
                      <div className="flex gap-1 ml-2">
                        {chain.supported.map((token) => (
                          <Badge key={token} variant="secondary" className="text-xs">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBlockchain && (
              <p className="text-xs text-muted-foreground">
                Supports: {selectedBlockchain.supported.join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletType">Wallet Type</Label>
            <Select value={walletType} onValueChange={setWalletType}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet type" />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((wallet) => (
                  <SelectItem key={wallet.value} value={wallet.value}>
                    {wallet.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... or your wallet address"
                className="font-mono text-sm"
              />
              {hasWallet && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your public wallet address to receive tips
            </p>
          </div>

          <Button 
            onClick={handleSaveWallet} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {hasWallet ? 'Update Wallet' : 'Save Wallet'}
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">Security Tips</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Only use your public wallet address, never your private keys</li>
            <li>• Double-check the address before saving</li>
            <li>• Use a wallet that supports the blockchain you selected</li>
            <li>• Keep your wallet software updated for security</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
