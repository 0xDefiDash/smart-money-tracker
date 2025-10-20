
import { NextResponse } from 'next/server';
import { ethRPCClient } from '@/lib/eth-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    const [balance, transactionCount] = await Promise.all([
      ethRPCClient.getBalanceInEth(address),
      ethRPCClient.getTransactionCount(address),
    ]);

    return NextResponse.json({
      address,
      balance,
      transactionCount,
      network: 'Ethereum Mainnet',
      lastChecked: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching ETH wallet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data', details: error.message },
      { status: 500 }
    );
  }
}
