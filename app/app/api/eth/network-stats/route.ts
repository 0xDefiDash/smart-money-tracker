
import { NextResponse } from 'next/server';
import { ethRPCClient } from '@/lib/eth-rpc-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [currentBlock, gasPrice] = await Promise.all([
      ethRPCClient.getBlockNumber(),
      ethRPCClient.getGasPrice(),
    ]);

    // Convert gas price from wei to gwei
    const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;

    // Get the latest block details
    const latestBlock = await ethRPCClient.getBlockByNumber(currentBlock, true);
    const blockTimestamp = latestBlock ? parseInt(latestBlock.timestamp, 16) : Date.now() / 1000;

    // Calculate transactions per second (approximate)
    const txCount = latestBlock?.transactions?.length || 0;
    
    // Ethereum avg block time is ~12 seconds
    const avgBlockTime = 12;
    const tps = (txCount / avgBlockTime).toFixed(2);

    return NextResponse.json({
      blockNumber: currentBlock,
      gasPrice: gasPriceGwei.toFixed(2),
      blockTimestamp,
      transactionCount: txCount,
      tps: parseFloat(tps),
      network: 'Ethereum Mainnet',
    });
  } catch (error: any) {
    console.error('Error fetching ETH network stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats', details: error.message },
      { status: 500 }
    );
  }
}
