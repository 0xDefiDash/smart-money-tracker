
import { NextRequest, NextResponse } from 'next/server';
import { getWalletTransactions } from '@/lib/ethereum';
import { getSolanaTokenTransfers } from '@/lib/solana';
import { etherscanClient } from '@/lib/etherscan-client';
import { moralisClient } from '@/lib/moralis-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    if (chain === 'solana') {
      const transactions = await getSolanaTokenTransfers(address, limit);
      return NextResponse.json({
        address,
        chain,
        transactions,
        count: transactions.length,
        source: 'helius'
      });
    }

    // For EVM chains, try multiple sources
    let transactions: any[] = [];
    let source = '';
    const errors: string[] = [];

    // Try Alchemy first (best for recent transactions)
    try {
      transactions = await getWalletTransactions(address, chain, limit);
      source = 'alchemy';
    } catch (alchemyError: any) {
      errors.push(`Alchemy: ${alchemyError.message}`);
      console.error('Alchemy transactions fetch failed:', alchemyError.message);
    }

    // If Alchemy fails, try Moralis
    if (transactions.length === 0) {
      try {
        const chainId = moralisClient.getChainId(chain);
        const txResponse = await moralisClient.getWalletTransactions(address, chainId, limit);
        const txData = txResponse.toJSON();
        
        if (txData?.result) {
          transactions = txData.result.map((tx: any) => ({
            hash: tx.hash,
            from: tx.from_address,
            to: tx.to_address,
            value: moralisClient.formatWei(tx.value || '0', 18),
            timestamp: tx.block_timestamp,
            blockNumber: tx.block_number,
            gasUsed: tx.gas_used,
            gasPrice: tx.gas_price
          }));
          source = 'moralis';
        }
      } catch (moralisError: any) {
        errors.push(`Moralis: ${moralisError.message}`);
        console.error('Moralis transactions fetch failed:', moralisError.message);
      }
    }

    // If both fail, try Etherscan (most comprehensive historical data)
    if (transactions.length === 0) {
      try {
        const etherscanTxs = await etherscanClient.getAllTransactions(address, chain, limit);
        transactions = etherscanTxs.map(tx => etherscanClient.formatTransaction(tx, chain));
        source = 'etherscan';
      } catch (etherscanError: any) {
        errors.push(`Etherscan: ${etherscanError.message}`);
        console.error('Etherscan transactions fetch failed:', etherscanError.message);
      }
    }

    if (transactions.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          error: 'All transaction providers failed',
          details: errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      address,
      chain,
      transactions,
      count: transactions.length,
      source,
      providers: {
        attempted: ['alchemy', 'moralis', 'etherscan'],
        used: source,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
