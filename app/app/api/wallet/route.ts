

import { NextRequest, NextResponse } from 'next/server'
import { moralisClient } from '@/lib/moralis-client'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const chain = searchParams.get('chain') || '0x1' // Default to Ethereum mainnet

  if (!address) {
    return NextResponse.json({
      status: 'error',
      error: 'Wallet address is required'
    }, { status: 400 })
  }

  try {
    // Get wallet token balances with prices
    const tokenBalances = await moralisClient.getWalletTokenBalances(address, chain)

    // Get wallet history (recent transactions)
    const walletHistory = await moralisClient.getWalletTransactions(address, chain, 20)

    // Get native token balance (ETH/BNB etc.)
    const nativeBalance = await moralisClient.getNativeBalance(address, chain)

    // Get wallet NFTs
    const nfts = await moralisClient.getWalletNFTs(address, chain, 20)

    // Get chain info
    const chainInfo = moralisClient.getChainInfo(chain)

    // Calculate portfolio value
    const nativeBalanceInEth = parseFloat(nativeBalance.raw.balance || '0') / Math.pow(10, 18)
    
    // Access token balance data correctly based on Moralis response structure
    let tokenBalanceResult: any[] = []
    
    try {
      if ((tokenBalances as any).result) {
        tokenBalanceResult = (tokenBalances as any).result
      } else if (typeof (tokenBalances as any).raw === 'function') {
        const rawData = (tokenBalances as any).raw()
        tokenBalanceResult = rawData?.result || []
      } else if (Array.isArray(tokenBalances)) {
        tokenBalanceResult = tokenBalances
      }
    } catch (error) {
      console.log('Error accessing token balance data:', error)
      tokenBalanceResult = []
    }
    
    const tokenValue = Array.isArray(tokenBalanceResult) ? tokenBalanceResult.reduce((total: number, token: any) => {
      return total + (parseFloat(token.usd_value || '0'))
    }, 0) : 0
    
    // Approximate native token value (simplified calculation)
    const nativeValue = chain === '0x1' ? nativeBalanceInEth * 2500 : // ETH price approximation
                       chain === '0x38' ? nativeBalanceInEth * 300 :   // BNB price approximation
                       chain === '0x89' ? nativeBalanceInEth * 0.8 :   // MATIC price approximation
                       nativeBalanceInEth * 100 // Default approximation

    const portfolioValue = tokenValue + nativeValue

    // Get top holdings
    const topHoldings = Array.isArray(tokenBalanceResult) ? tokenBalanceResult.sort((a: any, b: any) => 
      parseFloat(b.usd_value || '0') - parseFloat(a.usd_value || '0')
    ).slice(0, 10) : []

    return NextResponse.json({
      status: 'success',
      data: {
        address: address,
        chain: chain,
        portfolioValue: portfolioValue,
        nativeBalance: {
          balance: nativeBalance.raw.balance,
          formatted: moralisClient.formatWei(nativeBalance.raw.balance || '0'),
          symbol: chainInfo.symbol
        },
        tokenBalances: tokenBalanceResult,
        topHoldings: topHoldings,
        recentTransactions: (() => {
          try {
            return ((walletHistory as any).result || (walletHistory as any).raw?.() || []).slice(0, 10)
          } catch {
            return []
          }
        })(),
        nfts: (() => {
          try {
            return (nfts as any).result || (nfts as any).raw?.() || []
          } catch {
            return []
          }
        })(),
        totalTokens: tokenBalanceResult.length,
        totalNFTs: (() => {
          try {
            const nftData = (nfts as any).result || (nfts as any).raw?.() || []
            return Array.isArray(nftData) ? nftData.length : 0
          } catch {
            return 0
          }
        })()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to fetch wallet data'
    }, { status: 500 })
  }
}


