
import { NextResponse } from 'next/server';
import { bscRPCClient } from '@/lib/bsc-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * API route to fetch BSC network statistics
 */
export async function GET() {
  try {
    const [blockNumber, gasPrice] = await Promise.all([
      bscRPCClient.getBlockNumber(),
      bscRPCClient.getGasPrice(),
    ]);

    const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;

    // Get recent blocks to calculate average block time
    const recentBlocks = await Promise.all([
      bscRPCClient.getBlockByNumber(blockNumber),
      bscRPCClient.getBlockByNumber(blockNumber - 10),
    ]);

    let avgBlockTime = 3; // Default BSC block time
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
        network: 'BSC',
        rpcProvider: 'Ankr',
      },
    });
  } catch (error) {
    console.error('Failed to fetch BSC network stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch BSC network statistics',
      },
      { status: 500 }
    );
  }
}
