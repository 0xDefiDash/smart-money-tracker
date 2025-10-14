
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = "force-dynamic"

// Enhanced whale transaction generator for October 14, 2025
const generateWhaleTransactions = (limit: number = 50) => {
  const baseTimestamp = new Date().getTime();
  
  const cryptoData = [
    { symbol: 'BTC', price: 111888, name: 'Bitcoin' },
    { symbol: 'ETH', price: 3988.53, name: 'Ethereum' },
    { symbol: 'SOL', price: 197.75, name: 'Solana' },
    { symbol: 'USDC', price: 0.999902, name: 'USD Coin' },
    { symbol: 'USDT', price: 1.001, name: 'Tether' },
    { symbol: 'TON', price: 2.26, name: 'Toncoin' },
    { symbol: 'AVAX', price: 22.5, name: 'Avalanche' },
    { symbol: 'ADA', price: 0.683446, name: 'Cardano' },
    { symbol: 'WBTC', price: 111881, name: 'Wrapped Bitcoin' },
    { symbol: 'BNB', price: 1186.98, name: 'BNB' }
  ];

  const blockchains = ['ethereum', 'bitcoin', 'solana', 'avalanche', 'cardano', 'polygon', 'arbitrum', 'base'];
  const transactionTypes = ['large_transfer', 'exchange_deposit', 'exchange_withdrawal', 'whale_accumulation', 'institutional_movement', 'defi_interaction', 'cross_chain_bridge', 'stablecoin_movement'];

  return Array.from({ length: limit }, (_, index) => {
    const crypto = cryptoData[Math.floor(Math.random() * cryptoData.length)];
    const blockchain = blockchains[Math.floor(Math.random() * blockchains.length)];
    const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    // Generate realistic transaction amounts based on crypto type
    let baseAmount, valueUsd;
    
    if (crypto.symbol === 'BTC' || crypto.symbol === 'WBTC') {
      baseAmount = Math.random() * 2000 + 50; // 50-2050 BTC
      valueUsd = baseAmount * crypto.price;
    } else if (crypto.symbol === 'ETH') {
      baseAmount = Math.random() * 30000 + 500; // 500-30,500 ETH
      valueUsd = baseAmount * crypto.price;
    } else if (crypto.symbol === 'USDC' || crypto.symbol === 'USDT') {
      valueUsd = Math.random() * 50000000 + 1000000; // $1M - $51M
      baseAmount = valueUsd / crypto.price;
    } else if (crypto.symbol === 'SOL') {
      baseAmount = Math.random() * 500000 + 10000; // 10K-510K SOL
      valueUsd = baseAmount * crypto.price;
    } else {
      baseAmount = Math.random() * 1000000 + 50000; // Large amounts for other cryptos
      valueUsd = baseAmount * crypto.price;
    }
    
    const isAlert = valueUsd >= 5000000; // Alert threshold: $5M+
    const timeOffset = Math.random() * 7200000; // Random time within last 2 hours
    
    return {
      id: `tx_${Date.now()}_${index}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      fromAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      toAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      value: formatCryptoAmount(baseAmount),
      valueUsd: Math.round(valueUsd),
      cryptocurrency: {
        symbol: crypto.symbol,
        name: crypto.name
      },
      timestamp: new Date(baseTimestamp - timeOffset),
      blockchain,
      isAlert,
      type: txType,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: blockchain === 'ethereum' ? Math.floor(Math.random() * 500000) + 21000 : null,
      gasPrice: blockchain === 'ethereum' ? Math.floor(Math.random() * 100) + 10 : null
    };
  });
};

function formatCryptoAmount(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M';
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(2) + 'K';
  }
  return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const minUsd = parseFloat(searchParams.get('minUsd') || '1000000')
    const crypto = searchParams.get('crypto') || 'all'
    const blockchain = searchParams.get('blockchain') || 'all'

    // Generate fresh whale transactions
    let transactions = generateWhaleTransactions(Math.max(limit, 100));
    
    // Apply filters
    if (minUsd > 0) {
      transactions = transactions.filter(tx => tx.valueUsd >= minUsd);
    }
    
    if (crypto !== 'all') {
      transactions = transactions.filter(tx => 
        tx.cryptocurrency.symbol.toLowerCase() === crypto.toLowerCase()
      );
    }
    
    if (blockchain !== 'all') {
      transactions = transactions.filter(tx => 
        tx.blockchain.toLowerCase() === blockchain.toLowerCase()
      );
    }
    
    // Sort by timestamp (most recent first) and limit results
    transactions = transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Calculate summary stats
    const summary = {
      totalTransactions: transactions.length,
      totalValue: transactions.reduce((sum, tx) => sum + tx.valueUsd, 0),
      averageValue: transactions.length > 0 ? 
        transactions.reduce((sum, tx) => sum + tx.valueUsd, 0) / transactions.length : 0,
      alertCount: transactions.filter(tx => tx.isAlert).length,
      uniqueBlockchains: [...new Set(transactions.map(tx => tx.blockchain))].length,
      uniqueTokens: [...new Set(transactions.map(tx => tx.cryptocurrency.symbol))].length,
      timeRange: transactions.length > 0 ? {
        earliest: new Date(Math.min(...transactions.map(tx => new Date(tx.timestamp).getTime()))),
        latest: new Date(Math.max(...transactions.map(tx => new Date(tx.timestamp).getTime())))
      } : null
    };

    return NextResponse.json({
      status: 'success',
      data: transactions,
      summary,
      total: transactions.length,
      timestamp: new Date().toISOString(),
      source: 'live-simulation-oct2025'
    })

  } catch (error) {
    console.error('Whale transactions API error:', error)
    
    // Fallback to basic transactions if error occurs
    const fallbackTransactions = generateWhaleTransactions(20);
    
    return NextResponse.json({
      status: 'success',
      data: fallbackTransactions,
      total: fallbackTransactions.length,
      timestamp: new Date().toISOString(),
      source: 'fallback-data',
      message: 'Using simulated data due to processing error'
    })
  }
}


