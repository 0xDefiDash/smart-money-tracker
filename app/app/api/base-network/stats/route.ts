
import { NextResponse } from 'next/server';
import { baseRPCClient } from '@/lib/base-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch Base network statistics
 */
export async function GET() {
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      baseRPCClient.getBlockNumber(),
      baseRPCClient.getGasPrice(),
    ]);

    const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;

    // Get recent blocks to calculate average block time
    const recentBlocks = await Promise.all([
      baseRPCClient.getBlockByNumber(blockNumber),
      baseRPCClient.getBlockByNumber(blockNumber - 10),
    ]);

    let avgBlockTime = 2; // Default Base block time
    if (recentBlocks[0] && recentBlocks[1]) {
      const timeDiff =
        parseInt(recentBlocks[0].timestamp, 16) -
        parseInt(recentBlocks[1].timestamp, 16);
      avgBlockTime = timeDiff / 10;
    }

    return NextResponse.json({
      success: true,
      data: {
        blockNumber,
        gasPrice: gasPriceGwei,
        avgBlockTime,
        network: 'Base',
        rpcProvider: 'Ankr',
      },
    });
  } catch (error) {
    console.error('Failed to fetch network stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Base network statistics',
      },
      { status: 500 }
    );
  }
}
