
import { NextResponse } from 'next/server';
import { baseRPCClient } from '@/lib/base-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch wallet information from Base network
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    const [balance, txCount, gasPrice] = await Promise.all([
      baseRPCClient.getBalanceInEth(address),
      baseRPCClient.getTransactionCount(address),
      baseRPCClient.getGasPrice(),
    ]);

    const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance,
        transactionCount: txCount,
        currentGasPrice: gasPriceGwei,
        network: 'Base',
      },
    });
  } catch (error) {
    console.error('Failed to fetch wallet info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wallet information from Base network',
      },
      { status: 500 }
    );
  }
}
