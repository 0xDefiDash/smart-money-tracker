
import { NextRequest, NextResponse } from 'next/server';
import { 
  getTopCryptos, 
  getRecentWhaleTransactions, 
  getTrendingTokens, 
  getMarketSentiment,
  getDeFiProtocols,
  getOnChainMetrics,
  getAIMarketInsights
} from '@/lib/market-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'top-cryptos':
        const cryptos = await getTopCryptos();
        return NextResponse.json(cryptos);

      case 'whale-transactions':
        const whaleTransactions = await getRecentWhaleTransactions();
        return NextResponse.json(whaleTransactions);

      case 'trending-tokens':
        const trendingTokens = await getTrendingTokens();
        return NextResponse.json(trendingTokens);

      case 'market-sentiment':
        const sentiment = await getMarketSentiment();
        return NextResponse.json(sentiment);

      case 'defi-protocols':
        const defiProtocols = await getDeFiProtocols();
        return NextResponse.json(defiProtocols);

      case 'onchain-metrics':
        const onchainMetrics = await getOnChainMetrics();
        return NextResponse.json(onchainMetrics);

      case 'ai-insights':
        const aiInsights = await getAIMarketInsights();
        return NextResponse.json(aiInsights);

      case 'enhanced':
        // Enhanced data set for AI analysis
        const [
          enhancedCryptos, 
          enhancedWhales, 
          enhancedTrending, 
          enhancedSentiment,
          defiData,
          onchainData,
          aiInsightsData
        ] = await Promise.all([
          getTopCryptos(),
          getRecentWhaleTransactions(),
          getTrendingTokens(),
          getMarketSentiment(),
          getDeFiProtocols(),
          getOnChainMetrics(),
          getAIMarketInsights()
        ]);

        return NextResponse.json({
          cryptos: enhancedCryptos,
          whaleTransactions: enhancedWhales,
          trendingTokens: enhancedTrending,
          marketSentiment: enhancedSentiment,
          defiProtocols: defiData,
          onChainMetrics: onchainData,
          aiInsights: aiInsightsData,
          lastUpdated: new Date().toISOString()
        });

      case 'all':
      default:
        const [allCryptos, allWhales, allTrending, allSentiment] = await Promise.all([
          getTopCryptos(),
          getRecentWhaleTransactions(),
          getTrendingTokens(),
          getMarketSentiment()
        ]);

        return NextResponse.json({
          cryptos: allCryptos,
          whaleTransactions: allWhales,
          trendingTokens: allTrending,
          marketSentiment: allSentiment,
          lastUpdated: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Market context API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market context' },
      { status: 500 }
    );
  }
}
