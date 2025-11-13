
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getCryptoPrice } from './price-service';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

// Get Solana connection
export function getSolanaConnection() {
  return new Connection(HELIUS_RPC, 'confirmed');
}

// Fetch SOL balance
export async function getSolanaBalance(address: string) {
  try {
    const connection = getSolanaConnection();
    const pubKey = new PublicKey(address);
    const lamports = await connection.getBalance(pubKey);
    const sol = lamports / LAMPORTS_PER_SOL;

    // Get SOL price
    let priceUSD = 0;
    try {
      const priceData = await getCryptoPrice('SOL');
      priceUSD = typeof priceData === 'object' && priceData && 'price' in priceData ? (priceData as any).price : 0;
    } catch {
      priceUSD = 0;
    }
    const usd = sol * priceUSD;

    return {
      sol: sol.toFixed(6),
      usd: usd.toFixed(2),
      lamports
    };
  } catch (error: any) {
    console.error('Error fetching Solana balance:', error);
    throw new Error(`Failed to fetch Solana balance: ${error.message}`);
  }
}

// Fetch SPL token balances
export async function getSolanaTokenBalances(address: string) {
  try {
    const connection = getSolanaConnection();
    const pubKey = new PublicKey(address);
    
    const response = await connection.getParsedTokenAccountsByOwner(pubKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });

    const tokens = [];

    for (const account of response.value) {
      const info = account.account.data.parsed.info;
      const mint = info.mint;
      const balance = parseFloat(info.tokenAmount.uiAmountString || '0');
      
      if (balance < 0.0001) continue;

      // Try to get token price
      let priceUSD = 0;
      try {
        const priceData = await getCryptoPrice(info.tokenAmount.symbol || '');
        priceUSD = typeof priceData === 'object' && priceData && 'price' in priceData ? (priceData as any).price : 0;
      } catch {
        priceUSD = 0;
      }

      tokens.push({
        address: mint,
        symbol: 'Unknown',
        name: 'Unknown Token',
        balance: balance.toFixed(4),
        decimals: info.tokenAmount.decimals,
        price: priceUSD,
        valueUSD: (balance * priceUSD).toFixed(2)
      });
    }

    return tokens;
  } catch (error: any) {
    console.error('Error fetching Solana token balances:', error);
    throw new Error(`Failed to fetch Solana token balances: ${error.message}`);
  }
}

// Fetch Solana transactions
export async function getSolanaTokenTransfers(address: string, limit: number = 20) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}&type=TOKEN_TRANSFER`
    );

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const transactions = await response.json();

    return transactions.map((tx: any) => ({
      hash: tx.signature,
      timestamp: new Date(tx.timestamp * 1000).toISOString(),
      blockTimestamp: new Date(tx.timestamp * 1000).toISOString(),
      from: tx.feePayer,
      to: tx.accountData?.[0]?.account || '',
      value: '0',
      tokenTransfers: tx.tokenTransfers?.map((transfer: any) => ({
        tokenAddress: transfer.mint,
        tokenSymbol: transfer.tokenSymbol || 'Unknown',
        contractAddress: transfer.mint,
        value: transfer.tokenAmount?.toString() || '0',
        valueFormatted: transfer.tokenAmount?.toString() || '0',
        from: transfer.fromUserAccount,
        to: transfer.toUserAccount
      })) || []
    }));
  } catch (error: any) {
    console.error('Error fetching Solana transactions:', error);
    throw new Error(`Failed to fetch Solana transactions: ${error.message}`);
  }
}
