
import { NextRequest, NextResponse } from 'next/server';
import { getWalletBalance } from '@/lib/ethereum';
import { getSolanaBalance } from '@/lib/solana';
import { etherscanClient } from '@/lib/etherscan-client';
import { moralisClient } from '@/lib/moralis-client';

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
        currency: 'SOL',
        source: 'helius'
      });
    }

    // For EVM chains, try multiple sources for redundancy
    let balanceData: any = null;
    let source = '';
    const errors: string[] = [];

    // Try Alchemy first (most comprehensive)
    try {
      balanceData = await getWalletBalance(address, chain);
      source = 'alchemy';
    } catch (alchemyError: any) {
      errors.push(`Alchemy: ${alchemyError.message}`);
      console.error('Alchemy balance fetch failed:', alchemyError.message);
    }

    // If Alchemy fails, try Moralis
    if (!balanceData) {
      try {
        const chainId = moralisClient.getChainId(chain);
        const chainInfo = moralisClient.getChainInfo(chainId);
        const nativeBalance = await moralisClient.getNativeBalance(address, chainId);
        const nativeData = nativeBalance.toJSON();
        
        balanceData = {
          address,
          chain,
          balance: moralisClient.formatWei(nativeData.balance, 18),
          balanceUSD: '0', // Moralis doesn't provide USD directly in balance endpoint
          currency: chainInfo.symbol
        };
        source = 'moralis';
      } catch (moralisError: any) {
        errors.push(`Moralis: ${moralisError.message}`);
        console.error('Moralis balance fetch failed:', moralisError.message);
      }
    }

    // If both fail, try Etherscan as final fallback
    if (!balanceData) {
      try {
        const etherscanBalance = await etherscanClient.getBalance(address, chain);
        const config = moralisClient.getChainInfo(moralisClient.getChainId(chain));
        
        balanceData = {
          address,
          chain,
          balance: etherscanBalance.balance,
          balanceUSD: '0',
          currency: config.symbol
        };
        source = 'etherscan';
      } catch (etherscanError: any) {
        errors.push(`Etherscan: ${etherscanError.message}`);
        console.error('Etherscan balance fetch failed:', etherscanError.message);
      }
    }

    if (!balanceData) {
      return NextResponse.json(
        { 
          error: 'All balance providers failed',
          details: errors 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...balanceData,
      source,
      providers: {
        attempted: ['alchemy', 'moralis', 'etherscan'],
        used: source,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
