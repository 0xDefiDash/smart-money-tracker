
import { NextRequest, NextResponse } from 'next/server';
import { getWalletTransactions } from '@/lib/ethereum';
import { getSolanaTokenTransfers } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    let transactions;
    if (chain === 'solana') {
      transactions = await getSolanaTokenTransfers(address, limit);
    } else {
      transactions = await getWalletTransactions(address, chain, limit);
    }

    return NextResponse.json({
      address,
      chain,
      transactions
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
