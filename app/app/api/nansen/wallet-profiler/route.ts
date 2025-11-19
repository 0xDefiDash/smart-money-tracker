
import { NextRequest, NextResponse } from 'next/server';
import {
  getWalletPnLSummary,
  getWalletLabels,
  getRelatedWallets,
  getWalletCounterparties,
  getWalletActivity,
  getWalletPerpPositions,
  getWalletBalance,
  getWalletTransactions,
  formatChainName,
} from '@/lib/nansen-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';
    const section = searchParams.get('section') || 'all';

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const formattedChain = formatChainName(chain);
    const results: any = {
      address,
      chain: formattedChain,
    };

    // Fetch data based on requested section
    const promises: Promise<any>[] = [];

    if (section === 'all' || section === 'pnl') {
      promises.push(
        getWalletPnLSummary(address, formattedChain, '30d')
          .then(data => ({ pnlSummary: data }))
          .catch(error => {
            console.error('PnL Summary error:', error.message);
            return { pnlSummary: null, pnlError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'labels') {
      promises.push(
        getWalletLabels(address, formattedChain)
          .then(data => ({ labels: data }))
          .catch(error => {
            console.error('Labels error:', error.message);
            return { labels: null, labelsError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'related') {
      promises.push(
        getRelatedWallets(address, formattedChain, 20)
          .then(data => ({ relatedWallets: data }))
          .catch(error => {
            console.error('Related Wallets error:', error.message);
            return { relatedWallets: [], relatedError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'counterparties') {
      promises.push(
        getWalletCounterparties(address, formattedChain, 20)
          .then(data => ({ counterparties: data }))
          .catch(error => {
            console.error('Counterparties error:', error.message);
            return { counterparties: [], counterpartiesError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'activity') {
      promises.push(
        getWalletActivity(address, formattedChain)
          .then(data => ({ activity: data }))
          .catch(error => {
            console.error('Activity error:', error.message);
            return { activity: null, activityError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'perp-positions') {
      promises.push(
        getWalletPerpPositions(address, formattedChain)
          .then(data => ({ perpPositions: data }))
          .catch(error => {
            console.error('Perp Positions error:', error.message);
            return { perpPositions: null, perpPositionsError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'balance') {
      promises.push(
        getWalletBalance(address, formattedChain)
          .then(data => ({ balance: data }))
          .catch(error => {
            console.error('Balance error:', error.message);
            return { balance: null, balanceError: error.message };
          })
      );
    }

    if (section === 'all' || section === 'transactions') {
      const limit = parseInt(searchParams.get('limit') || '50');
      promises.push(
        getWalletTransactions(address, formattedChain, limit)
          .then(data => ({ transactions: data }))
          .catch(error => {
            console.error('Transactions error:', error.message);
            return { transactions: [], transactionsError: error.message };
          })
      );
    }

    // Wait for all promises to resolve
    const dataArray = await Promise.all(promises);

    // Merge results
    dataArray.forEach(data => {
      Object.assign(results, data);
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('[Wallet Profiler API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch wallet profile data',
      },
      { status: 500 }
    );
  }
}
