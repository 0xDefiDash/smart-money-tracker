
import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalances } from '@/lib/ethereum';
import { getSolanaTokenBalances } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    let tokens;
    if (chain === 'solana') {
      tokens = await getSolanaTokenBalances(address);
    } else {
      tokens = await getTokenBalances(address, chain);
    }

    return NextResponse.json({
      address,
      chain,
      tokens
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token balances' },
      { status: 500 }
    );
  }
}
