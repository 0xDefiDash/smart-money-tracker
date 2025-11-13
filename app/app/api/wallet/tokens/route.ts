
import { NextRequest, NextResponse } from 'next/server';
import { moralisClient } from '@/lib/moralis-client';
import { getSolanaTokenBalances } from '@/lib/solana';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  try {
    let tokens: any[] = [];
    let nativeBalance: any = null;
    let chainInfo: any = null;

    if (chain === 'solana') {
      tokens = await getSolanaTokenBalances(address);
    } else {
      // Use Moralis for EVM chains (Ethereum, BSC, Base, etc.)
      const chainId = moralisClient.getChainId(chain);
      chainInfo = moralisClient.getChainInfo(chainId);

      // Get native balance
      const nativeBalanceResponse = await moralisClient.getNativeBalance(address, chainId);
      const nativeData = nativeBalanceResponse.toJSON();
      nativeBalance = {
        symbol: chainInfo.symbol,
        name: chainInfo.name,
        balance: moralisClient.formatWei(nativeData.balance, 18),
        balanceRaw: nativeData.balance,
        decimals: 18,
        isNative: true
      };

      // Get token balances with prices
      const tokenBalancesResponse = await moralisClient.getWalletTokenBalances(address, chainId);
      const tokenData = tokenBalancesResponse.toJSON();
      
      if (tokenData?.result) {
        tokens = tokenData.result.map((token: any) => ({
          symbol: token.symbol || 'UNKNOWN',
          name: token.name || 'Unknown Token',
          balance: moralisClient.formatWei(token.balance, token.decimals || 18),
          balanceRaw: token.balance,
          decimals: token.decimals || 18,
          contractAddress: token.token_address,
          usdValue: token.usd_value || 0,
          usdPrice: token.usd_price || 0,
          percentageRelativeToTotal: token.percentage_relative_to_total_supply || 0,
          logo: token.logo || token.thumbnail || null,
          isNative: false
        }));
      }
    }

    return NextResponse.json({
      address,
      chain,
      chainInfo,
      nativeBalance,
      tokens,
      totalTokens: tokens.length
    });
  } catch (error: any) {
    console.error('Error fetching token balances:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch token balances' },
      { status: 500 }
    );
  }
}
