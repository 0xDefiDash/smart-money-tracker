import { NextRequest, NextResponse } from 'next/server';
import { swarmsClient, TRADING_AGENTS } from '@/lib/ai-agents/swarms-client';

// Quick analysis endpoints for specific use cases
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case 'analyze_token':
        result = await analyzeToken(data);
        break;

      case 'assess_risk':
        result = await assessRisk(data);
        break;

      case 'find_alpha':
        result = await findAlpha(data);
        break;

      case 'market_sentiment':
        result = await getMarketSentiment(data);
        break;

      case 'whale_analysis':
        result = await analyzeWhaleActivity(data);
        break;

      case 'execution_plan':
        result = await createExecutionPlan(data);
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quick analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

async function analyzeToken(data: { symbol: string; address?: string; chain?: string }) {
  const task = `Perform comprehensive analysis on ${data.symbol}${data.address ? ` (${data.address})` : ''} on ${data.chain || 'ethereum'}.

Analyze:
1. Current price action and momentum
2. Key support and resistance levels  
3. On-chain metrics (if available)
4. Smart money positioning
5. Risk assessment
6. Entry/exit recommendations`;

  return swarmsClient.executeHierarchicalSwarm(task, { tokenData: data });
}

async function assessRisk(data: { position: string; size: number; leverage?: number }) {
  const task = `Assess the risk for the following trading position:
- Position: ${data.position}
- Size: $${data.size.toLocaleString()}
- Leverage: ${data.leverage || 1}x

Provide:
1. Risk score (1-10)
2. Maximum loss scenario
3. Recommended stop-loss
4. Position sizing advice
5. Risk mitigation strategies`;

  return swarmsClient.executeSingleAgent('RISK_MANAGER', task);
}

async function findAlpha(data?: { sector?: string; timeframe?: string }) {
  const context: Record<string, any> = {};
  if (data?.sector) context.sector = data.sector;
  if (data?.timeframe) context.timeframe = data.timeframe;

  return swarmsClient.huntAlpha(context);
}

async function getMarketSentiment(data?: { tokens?: string[] }) {
  const task = `Provide a comprehensive market sentiment analysis for the crypto market.
${data?.tokens ? `Focus specifically on: ${data.tokens.join(', ')}` : ''}

Include:
1. Overall market sentiment (Fear/Greed)
2. BTC and ETH outlook
3. Trending narratives
4. Volume analysis
5. Key levels to watch
6. Short-term outlook (24-48h)`;

  return swarmsClient.executeSingleAgent('MARKET_ANALYST', task);
}

async function analyzeWhaleActivity(data?: { chain?: string; token?: string }) {
  const task = `Analyze recent whale activity${data?.chain ? ` on ${data.chain}` : ''}${data?.token ? ` for ${data.token}` : ''}.

Provide:
1. Largest whale transactions (24h)
2. Smart money movements
3. Exchange inflows/outflows
4. Accumulation vs distribution signals
5. Notable wallet activity
6. Implications for price action`;

  return swarmsClient.executeSingleAgent('ONCHAIN_ANALYST', task);
}

async function createExecutionPlan(data: { 
  action: 'buy' | 'sell';
  token: string;
  amount: number;
  urgency?: 'low' | 'medium' | 'high';
}) {
  const task = `Create an execution plan for the following trade:
- Action: ${data.action.toUpperCase()}
- Token: ${data.token}
- Amount: $${data.amount.toLocaleString()}
- Urgency: ${data.urgency || 'medium'}

Provide:
1. Recommended order type
2. Entry strategy (all-in vs DCA)
3. Best execution venues
4. Slippage estimate
5. Timing recommendations
6. Gas/fee optimization`;

  return swarmsClient.executeSingleAgent('EXECUTION_AGENT', task);
}
