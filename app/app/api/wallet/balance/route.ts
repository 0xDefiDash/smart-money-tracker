
import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/ethereum';
import { getSolanaBalance } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    if (chain === 'solana') {
      const balance = await getSolanaBalance(address);
      return NextResponse.json({
        address,
        chain: 'solana',
        balance: balance.sol,
        balanceUSD: balance.usd,
        currency: 'SOL'
      });
    } else {
      const balance = await getWalletBalance(address, chain);
      return NextResponse.json(balance);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
