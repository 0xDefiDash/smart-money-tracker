
import { NextRequest, NextResponse } from 'next/server';
import { getTopCryptos, getRecentWhaleTransactions, getTrendingTokens, getMarketSentiment } from '@/lib/market-data';

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
