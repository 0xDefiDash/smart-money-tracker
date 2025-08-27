
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if we already have today's report
    let dailyReport = await prisma.dailyReport.findFirst({
      where: {
        date: today
      }
    })

    // If no report exists, generate one
    if (!dailyReport) {
      dailyReport = await generateDailyReport(today)
    }

    return NextResponse.json({
      status: 'success',
      data: {
        ...dailyReport,
        totalWhaleVolumeUsd: Number(dailyReport.totalWhaleVolumeUsd),
        largestTransactionUsd: dailyReport.largestTransactionUsd ? Number(dailyReport.largestTransactionUsd) : null
      }
    })

  } catch (error) {
    console.error('Daily report API error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to generate daily report'
    }, { status: 500 })
  }
}

async function generateDailyReport(date: Date) {
  try {
    const startOfDay = new Date(date)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get whale transactions for the day
    const whaleTransactions = await prisma.whaleTransaction.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        cryptocurrency: true
      }
    })

    // Calculate metrics
    const totalWhaleTransactions = whaleTransactions.length
    const totalWhaleVolumeUsd = whaleTransactions.reduce((sum: number, tx) => sum + tx.valueUsd, 0)
    const largestTransaction = whaleTransactions.reduce((max, tx) => 
      tx.valueUsd > (max?.valueUsd || 0) ? tx : max, 
      null as typeof whaleTransactions[0] | null
    )

    // Get top crypto by volume
    const cryptoVolumes = whaleTransactions.reduce((acc: Record<string, number>, tx) => {
      const symbol = tx.cryptocurrency.symbol
      acc[symbol] = (acc[symbol] || 0) + tx.valueUsd
      return acc
    }, {})
    
    const topCryptoByVolume = Object.entries(cryptoVolumes)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || null

    // Get exchange flows for the day
    const exchangeFlows = await prisma.exchangeFlow.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const exchangeInflows = exchangeFlows.filter(f => f.flowType === 'inflow')
    const exchangeOutflows = exchangeFlows.filter(f => f.flowType === 'outflow')

    const topExchangeInflow = exchangeInflows
      .reduce((max, flow) => flow.amountUsd > (max?.amountUsd || 0) ? flow : max, 
        null as typeof exchangeInflows[0] | null)?.exchangeName || null

    const topExchangeOutflow = exchangeOutflows
      .reduce((max, flow) => flow.amountUsd > (max?.amountUsd || 0) ? flow : max,
        null as typeof exchangeOutflows[0] | null)?.exchangeName || null

    // Determine market sentiment (simplified)
    let marketSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (totalWhaleVolumeUsd > 5000000000 && whaleTransactions.filter((tx) => tx.isAlert).length > 10) {
      marketSentiment = 'bullish'
    } else if (totalWhaleVolumeUsd < 1000000000) {
      marketSentiment = 'bearish'
    }

    // Create the daily report
    const dailyReport = await prisma.dailyReport.create({
      data: {
        date: date,
        totalWhaleTransactions,
        totalWhaleVolumeUsd,
        topCryptoByVolume,
        largestTransactionUsd: largestTransaction?.valueUsd || null,
        topExchangeInflow,
        topExchangeOutflow,
        marketSentiment,
        reportData: {
          summary: {
            totalTransactions: totalWhaleTransactions,
            totalVolume: totalWhaleVolumeUsd,
            averageTransactionSize: totalWhaleTransactions > 0 ? totalWhaleVolumeUsd / totalWhaleTransactions : 0,
            alertCount: whaleTransactions.filter((tx) => tx.isAlert).length
          },
          topCryptos: Object.entries(cryptoVolumes)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([symbol, volume]) => ({ symbol, volume })),
          exchangeActivity: {
            totalInflow: exchangeInflows.reduce((sum: number, f) => sum + f.amountUsd, 0),
            totalOutflow: exchangeOutflows.reduce((sum: number, f) => sum + f.amountUsd, 0),
            netFlow: exchangeInflows.reduce((sum: number, f) => sum + f.amountUsd, 0) - 
                     exchangeOutflows.reduce((sum: number, f) => sum + f.amountUsd, 0)
          }
        }
      }
    })

    return dailyReport

  } catch (error) {
    console.error('Error generating daily report:', error)
    throw error
  }
}

export async function POST() {
  try {
    // Force regenerate today's report
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Delete existing report
    await prisma.dailyReport.deleteMany({
      where: { date: today }
    })

    // Generate new report
    const newReport = await generateDailyReport(today)

    return NextResponse.json({
      status: 'success',
      data: {
        ...newReport,
        totalWhaleVolumeUsd: Number(newReport.totalWhaleVolumeUsd),
        largestTransactionUsd: newReport.largestTransactionUsd ? Number(newReport.largestTransactionUsd) : null
      },
      message: 'Daily report regenerated successfully'
    })

  } catch (error) {
    console.error('Daily report regeneration error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Failed to regenerate daily report'
    }, { status: 500 })
  }
}
