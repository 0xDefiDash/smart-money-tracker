
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, conversation } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch real-time market context with timeout and error handling
    let marketContext = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const marketResponse = await fetch(`${request.nextUrl.origin}/api/market-context?type=all`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        marketContext = `

## Current Market Context (Real-time):
**Top Cryptocurrencies:**
${marketData.cryptos?.map((crypto: any) => 
  `- ${crypto.symbol}: ${crypto.price >= 1 ? `$${crypto.price.toLocaleString()}` : `$${crypto.price.toFixed(8)}`} (${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%)`
).join('\n') || 'Loading...'}

**Recent Whale Activity:**
${marketData.whaleTransactions?.map((tx: any) => 
  `- ${tx.type.toUpperCase()}: ${tx.value.toLocaleString()} ${tx.token} (${Math.floor((Date.now() - new Date(tx.timestamp).getTime()) / 60000)}m ago)`
).join('\n') || 'Loading...'}

**Trending Tokens:**
${marketData.trendingTokens?.map((token: any) => 
  `- ${token.symbol} (${token.platform}): ${token.price >= 1 ? `$${token.price.toFixed(2)}` : `$${token.price.toFixed(8)}`} (+${token.change24h.toFixed(1)}%)`
).join('\n') || 'Loading...'}

**Market Sentiment:**
- Fear & Greed Index: ${marketData.marketSentiment?.fearGreedIndex || 'N/A'} (${marketData.marketSentiment?.sentiment || 'N/A'})
- BTC Dominance: ${marketData.marketSentiment?.dominance?.btc || 'N/A'}%
- Total Market Cap: $${marketData.marketSentiment?.totalMarketCap ? (marketData.marketSentiment.totalMarketCap / 1000000000000).toFixed(2) + 'T' : 'N/A'}

Last Updated: ${new Date().toLocaleTimeString()}`;
      }
    } catch (error) {
      console.error('Failed to fetch market context:', error);
      // Continue without market context - the AI can still function
      marketContext = `

## Market Context:
*Real-time market data is temporarily unavailable. I can still help with platform features and general crypto knowledge.*`;
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
- **Block Wars**: Gamified trading system with leaderboards
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
