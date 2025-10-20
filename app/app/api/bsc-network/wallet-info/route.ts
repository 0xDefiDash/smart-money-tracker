
import { NextResponse } from 'next/server';
import { bscRPCClient } from '@/lib/bsc-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch wallet information from BSC network
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
        { success: false, error: 'Invalid BSC address format' },
        { status: 400 }
      );
    }

    const [balance, txCount, gasPrice] = await Promise.all([
      bscRPCClient.getBalanceInBNB(address),
      bscRPCClient.getTransactionCount(address),
      bscRPCClient.getGasPrice(),
    ]);

    const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance,
        transactionCount: txCount,
        currentGasPrice: gasPriceGwei,
        network: 'BSC',
      },
    });
  } catch (error) {
    console.error('Failed to fetch BSC wallet info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch wallet information from BSC network',
      },
      { status: 500 }
    );
  }
}
