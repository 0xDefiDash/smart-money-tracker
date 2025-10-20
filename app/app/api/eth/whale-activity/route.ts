
import { NextResponse } from 'next/server';
import { ethRPCClient } from '@/lib/eth-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minValue = parseFloat(searchParams.get('minValue') || '100');
    const blockCount = parseInt(searchParams.get('blockCount') || '10');

    const largeTransactions = await ethRPCClient.getRecentLargeTransactions(
      minValue,
      blockCount
    );

    // Sort by value descending
    largeTransactions.sort((a, b) => b.value - a.value);

    return NextResponse.json({
      transactions: largeTransactions,
      count: largeTransactions.length,
      minValue,
      network: 'Ethereum Mainnet',
    });
  } catch (error: any) {
    console.error('Error fetching ETH whale activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whale activity', details: error.message },
      { status: 500 }
    );
  }
}
