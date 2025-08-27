
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { BlockchainAPI, EtherscanAPI } from '@/lib/api-clients'

export const dynamic = "force-dynamic"

const blockchainAPI = new BlockchainAPI()
const etherscanAPI = new EtherscanAPI()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const minUsd = parseFloat(searchParams.get('minUsd') || '1000000')
    const crypto = searchParams.get('crypto') || 'all'
    const blockchain = searchParams.get('blockchain') || 'all'

    // Build where clause for filtering
    const whereClause: any = {
      valueUsd: {
        gte: minUsd
      }
    }

    if (crypto !== 'all') {
      const cryptoRecord = await prisma.cryptocurrency.findFirst({
        where: { symbol: crypto.toUpperCase() }
      })
      if (cryptoRecord) {
        whereClause.cryptoId = cryptoRecord.id
      }
    }

    if (blockchain !== 'all') {
      whereClause.blockchain = blockchain.toLowerCase()
    }

    // Fetch whale transactions from database
    const transactions = await prisma.whaleTransaction.findMany({
      where: whereClause,
      include: {
        cryptocurrency: {
          select: {
            symbol: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })

    // If we don't have enough recent data, fetch from APIs
    if (transactions.length < 10) {
      try {
        await fetchAndStoreRecentTransactions()
        
        // Re-fetch from database
        const updatedTransactions = await prisma.whaleTransaction.findMany({
          where: whereClause,
          include: {
            cryptocurrency: {
              select: {
                symbol: true,
                name: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: limit
        })

        return NextResponse.json({
          status: 'success',
          data: updatedTransactions.map(tx => ({
            ...tx,
            valueUsd: Number(tx.valueUsd),
            blockNumber: tx.blockNumber ? tx.blockNumber.toString() : null,
            gasUsed: tx.gasUsed ? tx.gasUsed.toString() : null,
            gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
          })),
          total: updatedTransactions.length,
          timestamp: new Date().toISOString()
        })
      } catch (apiError) {
        console.error('API fetch error:', apiError)
      }
    }

    return NextResponse.json({
      status: 'success',
      data: transactions.map(tx => ({
        ...tx,
        valueUsd: Number(tx.valueUsd),
        blockNumber: tx.blockNumber ? tx.blockNumber.toString() : null,
        gasUsed: tx.gasUsed ? tx.gasUsed.toString() : null,
        gasPrice: tx.gasPrice ? tx.gasPrice.toString() : null,
      })),
      total: transactions.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Whale transactions API error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to fetch whale transactions'
    }, { status: 500 })
  }
}

async function fetchAndStoreRecentTransactions() {
  try {
    // Fetch Bitcoin transactions
    const btcTransactions = await blockchainAPI.getLargeTransactions(100) // 100+ BTC
    const btcCrypto = await prisma.cryptocurrency.findFirst({
      where: { symbol: 'BTC' }
    })

    if (btcCrypto) {
      for (const tx of btcTransactions.slice(0, 10)) {
        try {
          const outputValue = tx.out?.reduce((sum: number, output: any) => sum + (output.value || 0), 0) || 0
          const btcValue = outputValue / 100000000 // Convert satoshis to BTC
          const usdValue = btcValue * (btcCrypto.price || 40000) // Use current BTC price

          if (usdValue >= 1000000) { // Only store if >= $1M
            await prisma.whaleTransaction.upsert({
              where: { txHash: tx.hash },
              update: {},
              create: {
                txHash: tx.hash,
                cryptoId: btcCrypto.id,
                fromAddress: tx.inputs?.[0]?.prev_out?.addr || 'unknown',
                toAddress: tx.out?.[0]?.addr || 'unknown',
                value: btcValue.toString(),
                valueUsd: usdValue,
                timestamp: new Date(tx.time * 1000),
                blockchain: 'bitcoin',
                isAlert: usdValue >= 10000000, // Alert for $10M+
                alertThreshold: usdValue >= 10000000 ? 10000000 : undefined,
              }
            })
          }
        } catch (txError) {
          console.error('Error processing BTC transaction:', txError)
          continue
        }
      }
    }

  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    throw error
  }
}
