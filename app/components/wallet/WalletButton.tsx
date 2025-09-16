
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useWallet, SUPPORTED_CHAINS } from '@/contexts/WalletContext'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Power, 
  Loader2,
  AlertTriangle,
  RefreshCw,
  Network
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export function WalletButton() {
  const { 
    isConnected, 
    address, 
    balance, 
    chainId,
    isConnecting, 
    error, 
    connect, 
    disconnect,
    switchChain
  } = useWallet()

  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const openExplorer = () => {
    if (address && chainId && SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]) {
      const explorer = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS].explorer
      window.open(`${explorer}/address/${address}`, '_blank')
    }
  }

  const handleChainSwitch = async (targetChainId: number) => {
    try {
      await switchChain(targetChainId)
      setIsNetworkMenuOpen(false)
      toast.success(`Switched to ${SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS].name}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch network')
    }
  }

  if (!isConnected) {
    return (
      <Button 
        onClick={connect} 
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    )
  }

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null

  return (
    <div className="flex items-center space-x-2">
      {/* Network Selector */}
      <DropdownMenu open={isNetworkMenuOpen} onOpenChange={setIsNetworkMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={`${currentChain ? 'border-green-500 text-green-700 dark:text-green-400' : 'border-red-500 text-red-700 dark:text-red-400'}`}
          >
            <Network className="w-4 h-4 mr-1" />
            {currentChain ? currentChain.name : 'Unknown'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
            <DropdownMenuItem
              key={id}
              onClick={() => handleChainSwitch(parseInt(id))}
              className={`${parseInt(id) === chainId ? 'bg-green-500/10 text-green-700 dark:text-green-400' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{chain.name}</span>
                {parseInt(id) === chainId && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="border-green-500 bg-green-500/5 hover:bg-green-500/10"
          >
            <Wallet className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">
                {formatAddress(address!)}
              </span>
              {balance && (
                <span className="text-xs font-medium">
                  {balance} {currentChain?.symbol || 'ETH'}
                </span>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <span>Wallet Connected</span>
              <span className="text-xs text-muted-foreground font-normal">
                {formatAddress(address!)}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Balance */}
          <div className="px-2 py-3 bg-muted/50 rounded-md mx-2 my-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <div className="flex items-center space-x-1">
                <span className="font-medium">
                  {balance || '0.0000'} {currentChain?.symbol || 'ETH'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {currentChain && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="secondary" className="text-xs">
                  {currentChain.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={openExplorer}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={disconnect}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Power className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Error Display */}
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="truncate max-w-32">{error}</span>
        </div>
      )}
    </div>
  )
}
