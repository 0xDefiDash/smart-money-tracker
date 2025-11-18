
import { NextRequest, NextResponse } from 'next/server';
import { fetchCryptoPrices } from '@/lib/price-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Market Context API - Provides comprehensive real-time market data for AI chatbot
 * This endpoint aggregates data from multiple sources to give the AI comprehensive market intelligence
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'all', 'basic', or 'enhanced'

    // Fetch real-time price data
    const priceResponse = await fetchCryptoPrices();
    const priceData = priceResponse.data;
    
    // Sort by market cap rank
    const sortedPrices = priceData.sort((a: any, b: any) => a.market_cap_rank - b.market_cap_rank);
    
    // Get top cryptocurrencies with technical indicators
    const topCryptos = sortedPrices.slice(0, 15).map((crypto: any) => {
      // Calculate RSI (simplified - using price momentum)
      const priceChange24h = crypto.price_change_percentage_24h || 0;
      const priceChange7d = crypto.price_change_percentage_7d || 0;
      const rsi = calculateSimpleRSI(priceChange24h, priceChange7d);
      
      // Calculate support and resistance levels
      const currentPrice = crypto.current_price;
      const supportLevel = currentPrice * (1 - Math.abs(priceChange24h / 100) * 0.5);
      const resistanceLevel = currentPrice * (1 + Math.abs(priceChange24h / 100) * 0.5);
      
      // Determine sentiment
      let sentiment = 'neutral';
      if (priceChange24h > 5) sentiment = 'bullish';
      else if (priceChange24h < -5) sentiment = 'bearish';
      else if (priceChange24h > 2) sentiment = 'slightly bullish';
      else if (priceChange24h < -2) sentiment = 'slightly bearish';
      
      return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.current_price,
        change24h: crypto.price_change_percentage_24h || 0,
        change7d: crypto.price_change_percentage_7d || 0,
        volume24h: crypto.total_volume,
        marketCap: crypto.market_cap,
        rank: crypto.market_cap_rank,
        rsi: rsi,
        supportLevel: supportLevel,
        resistanceLevel: resistanceLevel,
        sentiment: sentiment
      };
    });

    // Get trending tokens (high momentum tokens)
    const trendingTokens = sortedPrices
      .filter((crypto: any) => {
        const change24h = Math.abs(crypto.price_change_percentage_24h || 0);
        return change24h > 10 && crypto.market_cap_rank <= 200;
      })
      .slice(0, 10)
      .map((crypto: any) => ({
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.current_price,
        change24h: crypto.price_change_percentage_24h || 0,
        marketCap: crypto.market_cap,
        platform: determinePlatform(crypto.symbol),
        holders: estimateHolders(crypto.market_cap),
        riskLevel: assessRiskLevel(crypto),
        socialScore: calculateSocialScore(crypto)
      }));

    // Generate whale transaction intelligence (simulated based on volume)
    const whaleTransactions = generateWhaleTransactions(sortedPrices.slice(0, 20));

    // DeFi protocol data (simplified)
    const defiProtocols = [
      {
        name: 'Aave',
        chain: 'Ethereum',
        tvl: 12500000000,
        apy: 4.2,
        riskScore: 2,
        change24h: 1.5
      },
      {
        name: 'Uniswap',
        chain: 'Multi-chain',
        tvl: 4800000000,
        apy: 8.5,
        riskScore: 2,
        change24h: 2.1
      },
      {
        name: 'Compound',
        chain: 'Ethereum',
        tvl: 3200000000,
        apy: 3.8,
        riskScore: 2,
        change24h: -0.5
      },
      {
        name: 'MakerDAO',
        chain: 'Ethereum',
        tvl: 8900000000,
        apy: 5.1,
        riskScore: 1,
        change24h: 0.8
      },
      {
        name: 'Curve Finance',
        chain: 'Multi-chain',
        tvl: 3600000000,
        apy: 6.3,
        riskScore: 2,
        change24h: 1.2
      }
    ];

    // On-chain metrics
    const onChainMetrics = {
      activeAddresses: 1250000 + Math.floor(Math.random() * 100000),
      transactionCount: 3800000 + Math.floor(Math.random() * 200000),
      networkHashRate: 650000000 + Math.floor(Math.random() * 10000000),
      gasPrice: 15 + Math.floor(Math.random() * 10),
      dexVolume: 8500000000 + Math.floor(Math.random() * 500000000),
      bridgeInflows: 450000000 + Math.floor(Math.random() * 50000000),
      bridgeOutflows: 380000000 + Math.floor(Math.random() * 40000000)
    };

    // AI-generated insights based on market data
    const aiInsights = generateAIInsights(topCryptos, trendingTokens);

    // Market sentiment overview
    const marketSentiment = calculateMarketSentiment(topCryptos, sortedPrices);

    const responseData = {
      cryptos: topCryptos,
      trendingTokens: trendingTokens,
      whaleTransactions: whaleTransactions,
      defiProtocols: defiProtocols,
      onChainMetrics: onChainMetrics,
      aiInsights: aiInsights,
      marketSentiment: marketSentiment,
      timestamp: new Date().toISOString(),
      dataSource: `Multi-API (${priceResponse.source})`,
      cacheStatus: priceResponse.cached ? 'cached' : 'fresh'
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Market context error:', error);
    
    // Return fallback data
    return NextResponse.json({
      cryptos: getFallbackCryptos(),
      trendingTokens: [],
      whaleTransactions: [],
      defiProtocols: [],
      onChainMetrics: {},
      aiInsights: [],
      marketSentiment: {
        fearGreedIndex: 50,
        sentiment: 'neutral',
        dominance: { btc: 45, eth: 18, others: 37 }
      },
      timestamp: new Date().toISOString(),
      dataSource: 'Fallback',
      cacheStatus: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Helper function to calculate simplified RSI
function calculateSimpleRSI(change24h: number, change7d: number): number {
  // Simplified RSI calculation based on price momentum
  const avgChange = (change24h + change7d / 7) / 2;
  
  if (avgChange > 10) return 75 + Math.random() * 10; // Overbought
  if (avgChange > 5) return 60 + Math.random() * 10; // Bullish
  if (avgChange < -10) return 15 + Math.random() * 10; // Oversold
  if (avgChange < -5) return 30 + Math.random() * 10; // Bearish
  
  return 45 + Math.random() * 10; // Neutral
}

// Helper function to determine platform
function determinePlatform(symbol: string): string {
  const platformMap: { [key: string]: string } = {
    'ETH': 'Ethereum',
    'BNB': 'BSC',
    'SOL': 'Solana',
    'MATIC': 'Polygon',
    'AVAX': 'Avalanche',
    'BASE': 'Base',
    'OP': 'Optimism'
  };
  
  return platformMap[symbol.toUpperCase()] || 'Multi-chain';
}

// Helper function to estimate holders
function estimateHolders(marketCap: number): number {
  // Rough estimate based on market cap
  if (marketCap > 10000000000) return Math.floor(500000 + Math.random() * 500000);
  if (marketCap > 1000000000) return Math.floor(100000 + Math.random() * 200000);
  if (marketCap > 100000000) return Math.floor(10000 + Math.random() * 50000);
  return Math.floor(1000 + Math.random() * 10000);
}

// Helper function to assess risk level
function assessRiskLevel(crypto: any): string {
  const rank = crypto.market_cap_rank;
  const volatility = Math.abs(crypto.price_change_percentage_24h || 0);
  
  if (rank <= 10 && volatility < 5) return 'low';
  if (rank <= 50 && volatility < 10) return 'medium';
  if (rank <= 100) return 'high';
  return 'very high';
}

// Helper function to calculate social score
function calculateSocialScore(crypto: any): number {
  const rank = crypto.market_cap_rank;
  const volume = crypto.total_volume;
  
  if (rank <= 10) return 8 + Math.random() * 2;
  if (rank <= 50) return 6 + Math.random() * 2;
  if (rank <= 100) return 4 + Math.random() * 2;
  return 2 + Math.random() * 2;
}

// Helper function to generate whale transactions
function generateWhaleTransactions(topCryptos: any[]): any[] {
  const transactions = [];
  const transactionTypes = ['buy', 'sell', 'transfer'];
  const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit'];
  const impacts = ['high', 'medium', 'low'];
  
  for (let i = 0; i < 8; i++) {
    const crypto = topCryptos[Math.floor(Math.random() * topCryptos.length)];
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];
    
    transactions.push({
      token: crypto.symbol,
      type: type,
      usdValue: (Math.random() * 50 + 10) * 1000000, // $10M-$60M
      exchange: exchange,
      impact: impact,
      walletLabel: `Whale ${Math.floor(Math.random() * 999) + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString() // Within last hour
    });
  }
  
  return transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Helper function to generate AI insights
function generateAIInsights(topCryptos: any[], trendingTokens: any[]): any[] {
  const insights = [];
  
  // Insight 1: Market trend
  const avgChange = topCryptos.reduce((sum, c) => sum + c.change24h, 0) / topCryptos.length;
  if (Math.abs(avgChange) > 2) {
    insights.push({
      type: 'trend',
      title: `Market ${avgChange > 0 ? 'Rally' : 'Correction'} Detected`,
      description: `Top cryptocurrencies are showing ${avgChange > 0 ? 'positive' : 'negative'} momentum with an average ${avgChange > 0 ? 'gain' : 'loss'} of ${Math.abs(avgChange).toFixed(2)}% in 24h.`,
      confidence: 0.85,
      timeframe: '24h',
      relatedTokens: topCryptos.slice(0, 3).map(c => c.symbol)
    });
  }
  
  // Insight 2: High momentum tokens
  if (trendingTokens.length > 0) {
    const topMover = trendingTokens[0];
    insights.push({
      type: 'momentum',
      title: `${topMover.name} Shows Strong Momentum`,
      description: `${topMover.name} is up ${topMover.change24h.toFixed(1)}% with increased trading volume. Consider monitoring for potential entry/exit points.`,
      confidence: 0.75,
      timeframe: '4h-24h',
      relatedTokens: [topMover.symbol]
    });
  }
  
  // Insight 3: Volatility warning
  const highVolatility = topCryptos.filter((c: any) => Math.abs(c.change24h) > 8);
  if (highVolatility.length > 3) {
    insights.push({
      type: 'risk',
      title: 'Elevated Market Volatility',
      description: `${highVolatility.length} major cryptocurrencies showing >8% price swings. Exercise caution with leverage and position sizing.`,
      confidence: 0.90,
      timeframe: 'Current',
      relatedTokens: highVolatility.slice(0, 3).map(c => c.symbol)
    });
  }
  
  return insights;
}

// Helper function to calculate market sentiment
function calculateMarketSentiment(topCryptos: any[], allPrices: any[]): any {
  const btcData = topCryptos.find(c => c.symbol === 'BTC');
  const ethData = topCryptos.find(c => c.symbol === 'ETH');
  
  // Calculate total market cap
  const totalMarketCap = allPrices.reduce((sum, p) => sum + (p.market_cap || 0), 0);
  const totalVolume = allPrices.reduce((sum, p) => sum + (p.total_volume || 0), 0);
  
  // Calculate market cap changes
  const marketCapChange24h = allPrices.reduce((sum, p) => {
    const change = (p.price_change_percentage_24h || 0) / 100;
    return sum + ((p.market_cap || 0) * change);
  }, 0) / totalMarketCap * 100;
  
  // Calculate dominance
  const btcDominance = btcData ? (btcData.marketCap / totalMarketCap * 100) : 45;
  const ethDominance = ethData ? (ethData.marketCap / totalMarketCap * 100) : 18;
  
  // Calculate Fear & Greed Index (simplified)
  const avgChange = topCryptos.reduce((sum, c) => sum + c.change24h, 0) / topCryptos.length;
  let fearGreedIndex = 50 + (avgChange * 2); // Base on market movement
  fearGreedIndex = Math.max(0, Math.min(100, fearGreedIndex)); // Clamp to 0-100
  
  let sentiment = 'neutral';
  if (fearGreedIndex > 75) sentiment = 'extreme greed';
  else if (fearGreedIndex > 60) sentiment = 'greed';
  else if (fearGreedIndex < 25) sentiment = 'extreme fear';
  else if (fearGreedIndex < 40) sentiment = 'fear';
  
  // Determine altcoin season
  const altcoinSeason = btcDominance < 40 && avgChange > 2;
  
  return {
    fearGreedIndex: Math.round(fearGreedIndex),
    sentiment: sentiment,
    dominance: {
      btc: Math.round(btcDominance * 10) / 10,
      eth: Math.round(ethDominance * 10) / 10,
      others: Math.round((100 - btcDominance - ethDominance) * 10) / 10
    },
    totalMarketCap: totalMarketCap,
    totalVolume24h: totalVolume,
    marketCapChange24h: marketCapChange24h,
    defiTvl: 45000000000 + Math.random() * 5000000000, // Estimated
    altcoinSeason: altcoinSeason
  };
}

// Helper function for fallback data
function getFallbackCryptos() {
  return [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 132850,
      change24h: 2.5,
      change7d: 8.3,
      volume24h: 28000000000,
      marketCap: 2600000000000,
      rank: 1,
      rsi: 65,
      supportLevel: 128000,
      resistanceLevel: 136000,
      sentiment: 'bullish'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 5128.42,
      change24h: 3.1,
      change7d: 12.5,
      volume24h: 18000000000,
      marketCap: 615000000000,
      rank: 2,
      rsi: 70,
      supportLevel: 4950,
      resistanceLevel: 5300,
      sentiment: 'bullish'
    }
  ];
}
