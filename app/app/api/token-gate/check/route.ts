
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// $DEFIDASH Token Contract
const DEFIDASH_CONTRACT = '0xd6df108d516a5dc83f39020a349085c79d4edf0d';
const REQUIRED_BALANCE = 3000; // 3000 tokens required

// Chain configurations
const CHAIN_CONFIGS: Record<string, { rpc: string; name: string }> = {
  '1': { rpc: 'https://eth-mainnet.g.alchemy.com/v2/' + (process.env.ALCHEMY_API_KEY || ''), name: 'Ethereum' },
  '8453': { rpc: 'https://base-mainnet.g.alchemy.com/v2/' + (process.env.ALCHEMY_API_KEY || ''), name: 'Base' },
  '56': { rpc: 'https://bsc-dataseed1.binance.org', name: 'BSC' },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '8453'; // Default to Base

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get chain config
    const chainConfig = CHAIN_CONFIGS[chainId];
    if (!chainConfig) {
      return NextResponse.json(
        { error: 'Unsupported chain' },
        { status: 400 }
      );
    }

    // Create provider
    const provider = new ethers.JsonRpcProvider(chainConfig.rpc);
    
    // Create contract instance
    const contract = new ethers.Contract(DEFIDASH_CONTRACT, ERC20_ABI, provider);

    // Get balance and decimals
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
    ]);

    // Convert balance to human-readable format
    const tokenBalance = parseFloat(ethers.formatUnits(balance, decimals));
    
    // Check if user has enough tokens
    const hasAccess = tokenBalance >= REQUIRED_BALANCE;

    return NextResponse.json({
      success: true,
      address,
      chain: chainConfig.name,
      chainId,
      contractAddress: DEFIDASH_CONTRACT,
      balance: tokenBalance,
      required: REQUIRED_BALANCE,
      hasAccess,
      message: hasAccess 
        ? `Access granted! You hold ${tokenBalance.toFixed(2)} $DEFIDASH tokens.`
        : `Insufficient balance. You need ${REQUIRED_BALANCE} $DEFIDASH tokens, but you have ${tokenBalance.toFixed(2)}.`,
    });

  } catch (error: any) {
    console.error('Token gate check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check token balance',
      details: error.toString(),
    }, { status: 500 });
  }
}
