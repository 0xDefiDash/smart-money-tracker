import { NextRequest, NextResponse } from 'next/server';
import { asterDexClient } from '@/lib/ai-agents/asterdex-client';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Fetch AsterDex account data
    const [account, positions, balances, tradeHistory] = await Promise.all([
      asterDexClient.getAccount().catch(() => null),
      asterDexClient.getPositions().catch(() => []),
      asterDexClient.getBalance().catch(() => []),
      asterDexClient.getTradeHistory(undefined, 100).catch(() => [])
    ]);

    const isConfigured = asterDexClient.isApiConfigured();
    const hasTrades = tradeHistory && tradeHistory.length > 0;
    const hasPositions = positions && positions.length > 0;

    // Calculate trading statistics from trade history
    let stats = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      totalVolume: 0,
      avgTradeSize: 0,
      totalCommissions: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0,
    };

    if (hasTrades) {
      const trades = tradeHistory;
      stats.totalTrades = trades.length;
      
      let grossProfit = 0;
      let grossLoss = 0;
      
      trades.forEach((trade: any) => {
        const pnl = trade.realizedPnl || 0;
        stats.totalPnL += pnl;
        stats.totalVolume += trade.price * trade.qty;
        stats.totalCommissions += trade.commission || 0;
        
        if (pnl > 0) {
          stats.winningTrades++;
          grossProfit += pnl;
          if (pnl > stats.bestTrade) stats.bestTrade = pnl;
        } else if (pnl < 0) {
          stats.losingTrades++;
          grossLoss += Math.abs(pnl);
          if (pnl < stats.worstTrade) stats.worstTrade = pnl;
        }
      });

      stats.winRate = stats.totalTrades > 0 
        ? (stats.winningTrades / stats.totalTrades) * 100 
        : 0;
      stats.avgTradeSize = stats.totalTrades > 0 
        ? stats.totalVolume / stats.totalTrades 
        : 0;
      stats.profitFactor = grossLoss > 0 
        ? grossProfit / grossLoss 
        : grossProfit > 0 ? 999 : 0;
    }

    // Calculate position metrics
    let positionStats = {
      activePositions: positions?.length || 0,
      totalUnrealizedPnL: 0,
      totalMarginUsed: 0,
      positions: [] as any[]
    };

    if (hasPositions) {
      positions.forEach((pos: any) => {
        positionStats.totalUnrealizedPnL += pos.unrealizedPnl || 0;
        positionStats.totalMarginUsed += pos.isolatedMargin || 0;
        positionStats.positions.push({
          symbol: pos.symbol,
          side: pos.side,
          size: pos.size,
          entryPrice: pos.entryPrice,
          markPrice: pos.markPrice,
          unrealizedPnl: pos.unrealizedPnl,
          pnlPercent: asterDexClient.calculatePnlPercent(pos),
          leverage: pos.leverage,
          liquidationPrice: pos.liquidationPrice
        });
      });
    }

    // Account metrics
    const accountStats = {
      totalBalance: account?.totalBalance || 0,
      availableBalance: account?.availableBalance || 0,
      totalUnrealizedPnl: account?.totalUnrealizedPnl || 0,
      totalMarginUsed: account?.totalMarginUsed || 0
    };

    // Recent trades for table
    const recentTrades = (tradeHistory || []).slice(0, 20).map((trade: any) => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      price: trade.price,
      quantity: trade.qty,
      value: trade.price * trade.qty,
      pnl: trade.realizedPnl,
      commission: trade.commission,
      time: new Date(trade.time).toISOString()
    }));

    return NextResponse.json({
      success: true,
      isConfigured,
      hasTradingData: hasTrades || hasPositions,
      account: accountStats,
      stats,
      positions: positionStats,
      recentTrades,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        isConfigured: asterDexClient.isApiConfigured(),
        hasTradingData: false
      },
      { status: 500 }
    );
  }
}
