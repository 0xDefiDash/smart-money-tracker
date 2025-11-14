
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWallet } from '@/contexts/WalletContext'
import { WalletConnect } from './WalletConnect'
import { 
  Loader2, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  TrendingUp
} from 'lucide-react'

interface TokenGateProps {
  children: React.ReactNode
  requiredTokens?: number
  contractAddress?: string
  chainId?: string
  onAccessGranted?: () => void
}

interface TokenGateStatus {
  loading: boolean
  hasAccess: boolean
  balance: number
  required: number
  error: string | null
  chain: string
}

export function TokenGate({ 
  children, 
  requiredTokens = 3000,
  contractAddress = '0xd6df108d516a5dc83f39020a349085c79d4edf0d',
  chainId = '8453', // Base by default
  onAccessGranted 
}: TokenGateProps) {
  const { isConnected, address, chainId: walletChainId } = useWallet()
  const [status, setStatus] = useState<TokenGateStatus>({
    loading: false,
    hasAccess: false,
    balance: 0,
    required: requiredTokens,
    error: null,
    chain: 'Base'
  })

  // Check token balance when wallet connects
  useEffect(() => {
    const checkTokenBalance = async () => {
      if (!isConnected || !address) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          hasAccess: false,
          balance: 0,
          error: null
        }))
        return
      }

      setStatus(prev => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch(
          `/api/token-gate/check?address=${address}&chainId=${chainId}`
        )
        
        const data = await response.json()

        if (data.success) {
          setStatus({
            loading: false,
            hasAccess: data.hasAccess,
            balance: data.balance,
            required: data.required,
            error: null,
            chain: data.chain
          })

          if (data.hasAccess && onAccessGranted) {
            onAccessGranted()
          }
        } else {
          throw new Error(data.error || 'Failed to check token balance')
        }
      } catch (error: any) {
        console.error('Token gate error:', error)
        setStatus(prev => ({
          ...prev,
          loading: false,
          hasAccess: false,
          error: error.message || 'Failed to verify token balance'
        }))
      }
    }

    checkTokenBalance()
  }, [isConnected, address, chainId, requiredTokens, onAccessGranted])

  // If not connected, show wallet connect
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-blue-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Token-Gated Access</CardTitle>
            <p className="text-muted-foreground mt-2">
              This feature requires holding {requiredTokens} $DEFIDASH tokens
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert className="border-blue-500/20 bg-blue-500/5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <AlertDescription className="ml-2">
                  <div className="space-y-2">
                    <p className="font-semibold">Premium Feature</p>
                    <p className="text-sm">
                      The Wallet Tracker provides real-time multi-chain portfolio tracking,
                      transaction monitoring, and whale activity alerts. Hold {requiredTokens} $DEFIDASH
                      tokens to unlock this feature.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                  What you'll get:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Track wallet balances across 6+ blockchain networks</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Monitor token holdings with real-time USD valuations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Get instant alerts for whale transactions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Receive Telegram notifications for watchlist activity</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <WalletConnect showFeatures={false} />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have $DEFIDASH tokens?
                </p>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(`https://basescan.org/token/${contractAddress}`, '_blank')}
                >
                  <TrendingUp className="w-4 h-4" />
                  View Token Info
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If checking balance, show loading
  if (status.loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Verifying Token Balance</h3>
                <p className="text-sm text-muted-foreground">
                  Checking your $DEFIDASH holdings on {status.chain}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If error occurred
  if (status.error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-red-500/20">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Verification Error</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {status.error}
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If insufficient balance
  if (!status.hasAccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="border-yellow-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Insufficient Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <AlertDescription className="ml-2">
                <p className="font-semibold">More tokens needed</p>
                <p className="text-sm mt-1">
                  You need to hold at least {status.required} $DEFIDASH tokens to access this feature.
                </p>
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <p className="text-2xl font-bold">{status.balance.toFixed(2)}</p>
                  <Badge variant="outline" className="mt-2">$DEFIDASH</Badge>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Required Balance</p>
                  <p className="text-2xl font-bold text-green-600">{status.required}</p>
                  <Badge variant="outline" className="mt-2 border-green-500/50">$DEFIDASH</Badge>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                How to get $DEFIDASH tokens:
              </h4>
              <ol className="space-y-2 text-sm ml-6 list-decimal">
                <li>Purchase tokens on decentralized exchanges (DEX)</li>
                <li>Make sure you're on the {status.chain} network</li>
                <li>Refresh this page once you've acquired tokens</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Balance
              </Button>
              <Button 
                className="flex-1 gap-2"
                onClick={() => window.open(`https://basescan.org/token/${contractAddress}`, '_blank')}
              >
                Buy $DEFIDASH
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Connected Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If has access, show the children (protected content)
  return (
    <div>
      {/* Success banner */}
      <div className="bg-green-500/10 border-b border-green-500/20 mb-6">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Token Gate Passed
                </p>
                <p className="text-xs text-muted-foreground">
                  You hold {status.balance.toFixed(2)} $DEFIDASH tokens on {status.chain}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
              Premium Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Protected content */}
      {children}
    </div>
  )
}
