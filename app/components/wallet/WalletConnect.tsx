
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet, SUPPORTED_CHAINS } from '@/contexts/WalletContext'
import { 
  Wallet, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Zap,
  Globe,
  ArrowRight
} from 'lucide-react'

interface WalletConnectProps {
  onConnect?: () => void
  showFeatures?: boolean
}

export function WalletConnect({ onConnect, showFeatures = true }: WalletConnectProps) {
  const { isConnected, isConnecting, connect, error } = useWallet()
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      await connect()
      onConnect?.()
    } catch (err) {
      console.error('Connection failed:', err)
    }
  }

  if (isConnected) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Wallet Connected
              </h3>
              <p className="text-sm text-muted-foreground">
                Ready to track and analyze your DeFi positions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const features = [
    {
      id: 'tracking',
      icon: <Globe className="w-6 h-6" />,
      title: 'Portfolio Tracking',
      description: 'Real-time tracking of your DeFi positions across multiple chains',
      benefits: ['Multi-chain support', 'Real-time updates', 'Performance analytics']
    },
    {
      id: 'security',
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Connection',
      description: 'Your wallet stays secure - we only read public transaction data',
      benefits: ['Read-only access', 'No private keys', 'Coinbase security']
    },
    {
      id: 'insights',
      icon: <Zap className="w-6 h-6" />,
      title: 'Smart Insights',
      description: 'Get AI-powered insights and alerts about your DeFi activities',
      benefits: ['Whale tracking', 'Risk analysis', 'Profit opportunities']
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Connection Card */}
      <Card className="border-blue-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <p className="text-muted-foreground">
            Connect your Coinbase Wallet to start tracking your DeFi portfolio and get smart money insights
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Supported Networks */}
          <div>
            <h4 className="text-sm font-medium mb-3">Supported Networks</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                <Badge key={id} variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  {chain.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Connect Button */}
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Coinbase Wallet
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center justify-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Don't have Coinbase Wallet? 
            <a 
              href="https://www.coinbase.com/wallet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              Download it here
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {showFeatures && (
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedFeature === feature.id 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'hover:border-blue-500/30'
              }`}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 mt-1">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    
                    {selectedFeature === feature.id && (
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                    selectedFeature === feature.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
