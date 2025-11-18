
import { NextRequest, NextResponse } from 'next/server';
import {
  getWalletBalance,
  getWalletTransactions,
  getWalletPnLSummary,
  getWalletLabels,
  getRelatedWallets,
  formatChainName,
  isNansenConfigured,
} from '@/lib/nansen-client';

/**
 * Wallet Analysis API
 * 
 * Deep wallet profiling powered by Nansen:
 * - Current balance and holdings
 * - Transaction history
 * - PnL summary and performance
 * - Wallet labels (Smart Money, Exchange, Whale, etc.)
 * - Related wallets (first-degree connections)
 */
export async function GET(request: NextRequest) {
  try {
    if (!isNansenConfigured()) {
      return NextResponse.json(
        { error: 'Nansen API is not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = formatChainName(searchParams.get('chain') || 'ethereum');
    const timeframe = searchParams.get('timeframe') || '30d';
    const detailed = searchParams.get('detailed') === 'true';

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Always get labels first (lightweight)
    const labels = await getWalletLabels(address, chain);

    if (!detailed) {
      // Quick analysis - labels only
      return NextResponse.json({
        success: true,
        data: {
          address,
          chain,
          labels: labels.labels,
          entityName: labels.entityName,
          isSmartMoney: labels.isSmartMoney,
          isExchange: labels.isExchange,
          isWhale: labels.isWhale,
        },
        source: 'nansen',
        timestamp: new Date().toISOString(),
      });
    }

    // Detailed analysis - fetch all data
    const [balance, transactions, pnlSummary, relatedWallets] = await Promise.allSettled([
      getWalletBalance(address, chain),
      getWalletTransactions(address, chain, 50),
      getWalletPnLSummary(address, chain, timeframe),
      getRelatedWallets(address, chain, 20),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        address,
        chain,
        timeframe,
        labels: labels.labels,
        entityName: labels.entityName,
        classification: {
          isSmartMoney: labels.isSmartMoney,
          isExchange: labels.isExchange,
          isWhale: labels.isWhale,
        },
        balance: balance.status === 'fulfilled' ? balance.value : null,
        recentTransactions: transactions.status === 'fulfilled' ? transactions.value : [],
        performance: pnlSummary.status === 'fulfilled' ? pnlSummary.value : null,
        relatedWallets: relatedWallets.status === 'fulfilled' ? relatedWallets.value : [],
      },
      source: 'nansen',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Wallet Analysis API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch wallet analysis data',
      },
      { status: 500 }
    );
  }
}
