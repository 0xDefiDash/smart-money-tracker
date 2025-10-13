
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, conversation } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch enhanced real-time market context with timeout and error handling
    let marketContext = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for enhanced data
      
      const marketResponse = await fetch(`${request.nextUrl.origin}/api/market-context?type=enhanced`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        marketContext = `

## 🚀 ENHANCED MARKET INTELLIGENCE (Real-time):

### 📊 **Top Cryptocurrencies & Technical Analysis:**
${marketData.cryptos?.map((crypto: any) => 
  `- **${crypto.name} (${crypto.symbol})**: $${crypto.price >= 1 ? crypto.price.toLocaleString() : crypto.price.toFixed(8)} (${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}% 24h, ${crypto.change7d >= 0 ? '+' : ''}${crypto.change7d?.toFixed(2)}% 7d)
    • RSI: ${crypto.rsi} | Support: $${crypto.supportLevel?.toLocaleString()} | Resistance: $${crypto.resistanceLevel?.toLocaleString()}
    • Sentiment: ${crypto.sentiment?.toUpperCase()} | Vol: $${(crypto.volume24h / 1000000000).toFixed(2)}B`
).join('\n') || 'Loading technical data...'}

### 🐋 **Whale Transaction Intelligence:**
${marketData.whaleTransactions?.map((tx: any) => 
  `- **${tx.impact.toUpperCase()} IMPACT**: ${tx.walletLabel || 'Unknown Whale'} ${tx.type.toUpperCase()} $${(tx.usdValue / 1000000).toFixed(2)}M ${tx.token} via ${tx.exchange || 'Unknown'} (${Math.floor((Date.now() - new Date(tx.timestamp).getTime()) / 60000)}m ago)`
).join('\n') || 'Loading whale data...'}

### 🔥 **Trending Meme/Alt Tokens:**
${marketData.trendingTokens?.map((token: any) => 
  `- **${token.name} (${token.symbol})** on ${token.platform}: $${token.price >= 1 ? token.price.toFixed(2) : token.price.toFixed(8)} (${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(1)}%)
    • MCap: $${(token.marketCap / 1000000).toFixed(1)}M | Holders: ${token.holders.toLocaleString()} | Risk: ${token.riskLevel.toUpperCase()} | Social: ${token.socialScore}/10`
).join('\n') || 'Loading trending tokens...'}

### 💹 **DeFi Protocol Performance:**
${marketData.defiProtocols?.map((protocol: any) => 
  `- **${protocol.name}** (${protocol.chain}): $${(protocol.tvl / 1000000000).toFixed(2)}B TVL | ${protocol.apy.toFixed(1)}% APY | Risk Score: ${protocol.riskScore}/5 (${protocol.change24h >= 0 ? '+' : ''}${protocol.change24h.toFixed(1)}%)`
).join('\n') || 'Loading DeFi data...'}

### ⛓️ **On-Chain Metrics:**
- Active Addresses: ${marketData.onChainMetrics?.activeAddresses?.toLocaleString()}
- Daily Transactions: ${marketData.onChainMetrics?.transactionCount?.toLocaleString()}
- Network Hash Rate: ${marketData.onChainMetrics?.networkHashRate ? (marketData.onChainMetrics.networkHashRate / 1000000).toFixed(0) + 'M' : 'N/A'} TH/s
- Avg Gas Price: ${marketData.onChainMetrics?.gasPrice} gwei
- DEX Volume: $${marketData.onChainMetrics?.dexVolume ? (marketData.onChainMetrics.dexVolume / 1000000000).toFixed(2) + 'B' : 'N/A'}
- Bridge Activity: $${marketData.onChainMetrics?.bridgeInflows ? (marketData.onChainMetrics.bridgeInflows / 1000000).toFixed(0) + 'M' : 'N/A'} in, $${marketData.onChainMetrics?.bridgeOutflows ? (marketData.onChainMetrics.bridgeOutflows / 1000000).toFixed(0) + 'M' : 'N/A'} out

### 🤖 **AI Market Insights:**
${marketData.aiInsights?.map((insight: any) => 
  `- **${insight.type.toUpperCase()}** (${(insight.confidence * 100).toFixed(0)}% confidence): ${insight.title}
    ${insight.description} | Timeframe: ${insight.timeframe} | Related: ${insight.relatedTokens.join(', ')}`
).join('\n') || 'Loading AI insights...'}

### 📈 **Market Sentiment Overview:**
- **Fear & Greed Index**: ${marketData.marketSentiment?.fearGreedIndex}/100 (${marketData.marketSentiment?.sentiment})
- **Market Dominance**: BTC ${marketData.marketSentiment?.dominance?.btc}% | ETH ${marketData.marketSentiment?.dominance?.eth}% | Others ${marketData.marketSentiment?.dominance?.others}%
- **Total Market Cap**: $${marketData.marketSentiment?.totalMarketCap ? (marketData.marketSentiment.totalMarketCap / 1000000000000).toFixed(2) + 'T' : 'N/A'} (${marketData.marketSentiment?.marketCapChange24h >= 0 ? '+' : ''}${marketData.marketSentiment?.marketCapChange24h?.toFixed(1)}% 24h)
- **24h Volume**: $${marketData.marketSentiment?.totalVolume24h ? (marketData.marketSentiment.totalVolume24h / 1000000000).toFixed(1) + 'B' : 'N/A'}
- **DeFi TVL**: $${marketData.marketSentiment?.defiTvl ? (marketData.marketSentiment.defiTvl / 1000000000).toFixed(1) + 'B' : 'N/A'}
- **Altcoin Season**: ${marketData.marketSentiment?.altcoinSeason ? '✅ ACTIVE' : '❌ INACTIVE'}

**Last Updated**: ${new Date().toLocaleTimeString()} | Market Status: ${marketData.marketSentiment?.altcoinSeason ? '🚀 ALTCOIN SEASON' : '🔶 BTC DOMINANCE'}`;
      }
    } catch (error) {
      console.error('Failed to fetch enhanced market context:', error);
      // Fallback to basic market context
      try {
        const fallbackResponse = await fetch(`${request.nextUrl.origin}/api/market-context?type=all`);
        if (fallbackResponse.ok) {
          const basicData = await fallbackResponse.json();
          marketContext = `

## 📊 Basic Market Context (Fallback):
**Top Cryptocurrencies:**
${basicData.cryptos?.map((crypto: any) => 
  `- ${crypto.symbol}: $${crypto.price >= 1 ? crypto.price.toLocaleString() : crypto.price.toFixed(8)} (${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%)`
).join('\n') || 'Loading...'}

*Enhanced market data temporarily unavailable. I can still provide comprehensive crypto analysis and platform guidance.*`;
        }
      } catch (fallbackError) {
        marketContext = `

## 🤖 AI Mode:
*Market data feeds temporarily offline. I'm still your expert crypto advisor with deep knowledge of:
- Technical analysis and trading strategies
- DeFi protocols and yield opportunities  
- Smart Money Tracker platform features
- Risk management and portfolio optimization*`;
      }
    }

    // Build context-aware system prompt
    const systemPrompt = `You are DefiDash Agent, the world's most advanced cryptocurrency and DeFi market expert AI assistant. You help users navigate the Smart Money Tracker platform and provide expert crypto market analysis.${marketContext}

## Your Expertise:
- Real-time cryptocurrency market analysis and insights
- DeFi protocols, yield farming, and liquidity mining
- Whale activity tracking and on-chain analysis
- NFT markets and trends (Pump.fun, Zora, Bonk.fun)
- Technical analysis and trading strategies
- Risk management and portfolio optimization
- Blockchain technology and smart contracts
- Market sentiment analysis

## Smart Money Tracker Platform Features:
- **Dashboard**: Real-time whale transactions, exchange flows, market stats
- **Whale Tracker**: Monitor large wallet movements, whale rankings
- **Dash Wars**: Gamified trading system with leaderboards
- **Pump.fun Tracker**: Track trending meme coins and new launches
- **Zora Tracker**: Monitor NFT collections and artist activity
- **Bonk.fun Tracker**: Solana ecosystem token tracking
- **Exchange Tracker**: Monitor CEX and DEX flows
- **Profile System**: User authentication and portfolio tracking

## Your Personality:
- Expert but approachable
- Data-driven and analytical
- Always up-to-date with latest market trends
- Helpful with both technical and beginner questions
- Proactive in suggesting relevant platform features

## Response Guidelines:
- Provide actionable insights and specific data when possible
- Reference relevant platform features that can help users
- Include market context and risk warnings when appropriate
- Use emojis sparingly but effectively (📈📉💎🐋)
- Keep responses concise but comprehensive
- Always prioritize user safety and responsible trading

Current date: ${new Date().toISOString().split('T')[0]}

Respond conversationally and help users with their crypto and platform questions.`;

    // Prepare messages for LLM
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversation || []),
      { role: 'user', content: message }
    ];

    // Make streaming request to LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          while (true) {
            const { done, value } = await reader?.read() || { done: true, value: undefined };
            if (done) break;
            
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
