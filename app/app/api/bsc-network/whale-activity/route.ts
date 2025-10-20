
import { NextResponse } from 'next/server';
import { bscRPCClient } from '@/lib/bsc-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch whale activity on BSC network
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minValue = parseFloat(searchParams.get('minValue') || '100');
    const blockCount = parseInt(searchParams.get('blockCount') || '10');

    // Get recent large transactions
    const transactions = await bscRPCClient.getRecentLargeTransactions(
      minValue,
      blockCount
    );

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
        minValue,
        blockCount,
      },
    });
  } catch (error) {
    console.error('Failed to fetch BSC whale activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch whale activity from BSC network',
      },
      { status: 500 }
    );
  }
}
