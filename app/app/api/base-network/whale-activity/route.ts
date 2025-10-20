
import { NextResponse } from 'next/server';
import { baseRPCClient } from '@/lib/base-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch whale activity on Base network
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minValue = parseFloat(searchParams.get('minValue') || '10');
    const blockCount = parseInt(searchParams.get('blockCount') || '10');

    // Get recent large transactions
    const transactions = await baseRPCClient.getRecentLargeTransactions(
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
    console.error('Failed to fetch whale activity:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch whale activity from Base network',
      },
      { status: 500 }
    );
  }
}
