
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchChain: (chainId: number) => Promise<void>
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: React.ReactNode
}

// Coinbase Wallet instance
let coinbaseWallet: CoinbaseWalletSDK | null = null

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Coinbase Wallet
  const initializeWallet = useCallback(() => {
    if (typeof window !== 'undefined' && !coinbaseWallet) {
      coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'DeFiDash Smart Money Tracker',
        appLogoUrl: '/logo.png',
      })
    }
    return coinbaseWallet
  }, [])

  // Get Ethereum provider
  const getProvider = useCallback(() => {
    const wallet = initializeWallet()
    return wallet?.makeWeb3Provider() // Default provider
  }, [initializeWallet])

  // Update balance
  const updateBalance = useCallback(async (userAddress: string) => {
    try {
      const provider = getProvider()
      if (provider && userAddress) {
        const balanceWei = await provider.request({
          method: 'eth_getBalance',
          params: [userAddress, 'latest']
        }) as string
        
        // Convert Wei to ETH
        const balanceEth = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
        setBalance(balanceEth)
      }
    } catch (err) {
      console.error('Error updating balance:', err)
    }
  }, [getProvider])

  // Connect wallet
  const connect = useCallback(async () => {
    if (isConnecting) return
    
    setIsConnecting(true)
    setError(null)

    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error('Failed to initialize wallet provider')
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[]

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const userAddress = accounts[0]
      setAddress(userAddress)
      setIsConnected(true)

      // Get network info
      const network = await provider.request({
        method: 'eth_chainId',
      }) as string
      setChainId(parseInt(network, 16))

      // Update balance
      await updateBalance(userAddress)

      // Store connection state
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', userAddress)

    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect wallet')
      setIsConnected(false)
      setAddress(null)
    } finally {
      setIsConnecting(false)
    }
  }, [isConnecting, getProvider, updateBalance])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      const provider = getProvider()
      if (provider) {
        // For Coinbase Wallet SDK, we need to close the provider connection
        try {
          await (provider as any).close?.()
        } catch (e) {
          // Silently ignore close errors
        }
      }

      setIsConnected(false)
      setAddress(null)
      setBalance(null)
      setChainId(null)
      setError(null)

      // Clear storage
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('walletAddress')

    } catch (err: any) {
      console.error('Disconnect error:', err)
      setError(err.message || 'Failed to disconnect wallet')
    }
  }, [getProvider])

  // Switch chain
  const switchChain = useCallback(async (targetChainId: number) => {
    try {
      const provider = getProvider()
      if (!provider) {
        throw new Error('Wallet not connected')
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        })
        setChainId(targetChainId)
      } catch (switchError: any) {
        // If chain doesn't exist, add it
        if (switchError.code === 4902) {
          const chainConfigs: Record<number, any> = {
            1: {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.infura.io/v3/'],
              blockExplorerUrls: ['https://etherscan.io/'],
            },
            137: {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://polygon-rpc.com'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
            8453: {
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org/'],
            },
          }

          const chainConfig = chainConfigs[targetChainId]
          if (chainConfig) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig],
            })
            setChainId(targetChainId)
          } else {
            throw new Error('Unsupported chain ID')
          }
        } else {
          throw switchError
        }
      }

      // Update balance after chain switch
      if (address) {
        await updateBalance(address)
      }

    } catch (err: any) {
      console.error('Switch chain error:', err)
      setError(err.message || 'Failed to switch chain')
      throw err
    }
  }, [getProvider, address, updateBalance])

  // Send transaction
  const sendTransaction = useCallback(async (to: string, value: string, data?: string): Promise<string> => {
    try {
      const provider = getProvider()
      if (!provider || !address) {
        throw new Error('Wallet not connected')
      }

      const transaction: any = {
        from: address,
        to,
        value: `0x${parseInt(value).toString(16)}`,
      }

      if (data) {
        transaction.data = data
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      }) as string

      // Update balance after transaction
      setTimeout(() => updateBalance(address), 2000)

      return txHash
    } catch (err: any) {
      console.error('Transaction error:', err)
      setError(err.message || 'Transaction failed')
      throw err
    }
  }, [getProvider, address, updateBalance])

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const wasConnected = localStorage.getItem('walletConnected')
      const savedAddress = localStorage.getItem('walletAddress')
      
      if (wasConnected === 'true' && savedAddress && !isConnected) {
        try {
          await connect()
        } catch (err) {
          console.log('Auto-connect failed, clearing storage')
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('walletAddress')
        }
      }
    }

    autoConnect()
  }, [connect, isConnected])

  // Listen for account changes
  useEffect(() => {
    const provider = getProvider()
    if (!provider) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== address) {
        setAddress(accounts[0])
        updateBalance(accounts[0])
        localStorage.setItem('walletAddress', accounts[0])
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      setChainId(newChainId)
      if (address) {
        updateBalance(address)
      }
    }

    const handleDisconnect = () => {
      disconnect()
    }

    // Add listeners
    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)
    provider.on('disconnect', handleDisconnect)

    return () => {
      // Remove listeners
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('disconnect', handleDisconnect)
    }
  }, [getProvider, address, updateBalance, disconnect])

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Chain information
export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
  8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
} as const

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS
