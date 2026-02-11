import { NextRequest, NextResponse } from 'next/server';
import { quickAnalyzer } from '@/lib/ai-agents/quick-analysis';

export const dynamic = 'force-dynamic';

// Quick analysis endpoints for fast responses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case 'analyze_token':
        result = await quickAnalyzer.analyzeToken(data?.symbol || 'BTC');
        break;

      case 'assess_risk':
        result = await quickAnalyzer.assessRisk(
          `Position: ${data?.position || 'BTC Long'}, Size: $${data?.size || 1000}, Leverage: ${data?.leverage || 1}x`
        );
        break;

      case 'find_alpha':
        result = await quickAnalyzer.scanAlpha();
        break;

      case 'market_sentiment':
        result = await quickAnalyzer.analyzeMarket('What is the current crypto market sentiment? Analyze BTC, ETH, and overall market conditions.');
        break;

      case 'whale_analysis':
        result = await quickAnalyzer.analyzeMarket(`Analyze whale activity on ${data?.chain || 'ethereum'}. What are large wallets doing?`);
        break;

      case 'execution_plan':
        result = await quickAnalyzer.analyzeMarket(
          `Create an execution plan to ${data?.action || 'accumulate'} $${data?.amount || 10000} worth of ${data?.token || 'BTC'} over ${data?.timeframe || '24 hours'}.`
        );
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      result: {
        job_id: `quick-${action}-${Date.now()}`,
        status: 'completed',
        output: result.analysis,
        number_of_agents: 1,
        execution_time: result.executionTime,
        marketContext: result.marketContext,
        mode: 'quick'
      },
      timestamp: result.timestamp
    });

  } catch (error) {
    console.error('Quick analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Quick Trading Analysis',
    version: '2.0.0',
    actions: [
      { id: 'analyze_token', description: 'Quick token analysis', params: ['symbol'] },
      { id: 'assess_risk', description: 'Risk assessment', params: ['position', 'size', 'leverage'] },
      { id: 'find_alpha', description: 'Hunt for alpha opportunities', params: [] },
      { id: 'market_sentiment', description: 'Current market sentiment', params: [] },
      { id: 'whale_analysis', description: 'Whale activity analysis', params: ['chain'] },
      { id: 'execution_plan', description: 'Create execution plan', params: ['action', 'amount', 'token', 'timeframe'] }
    ]
  });
}
