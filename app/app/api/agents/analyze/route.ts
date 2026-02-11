import { NextRequest, NextResponse } from 'next/server';
import { quickAnalyzer } from '@/lib/ai-agents/quick-analysis';
import { swarmsClient } from '@/lib/ai-agents/swarms-client';
import { fetchCryptoPrices } from '@/lib/price-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, workflow, token, includeMarketData, useQuickMode = true } = body;

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Use Quick Analysis for fast responses (default)
    if (useQuickMode || workflow === 'quick' || workflow === 'single') {
      const quickResult = await quickAnalyzer.analyzeMarket(task);
      
      return NextResponse.json({
        success: true,
        result: {
          job_id: `quick-${Date.now()}`,
          status: 'completed',
          output: quickResult.analysis,
          number_of_agents: 1,
          execution_time: quickResult.executionTime,
          marketContext: quickResult.marketContext,
          mode: 'quick'
        },
        timestamp: quickResult.timestamp
      });
    }

    // For complex multi-agent workflows, use Swarms (slower but more comprehensive)
    const context: Record<string, any> = {};

    if (includeMarketData) {
      try {
        const priceResult = await fetchCryptoPrices();
        const prices = priceResult.data || [];
        context.marketData = {
          btc: prices.find((p: any) => p.symbol === 'BTC'),
          eth: prices.find((p: any) => p.symbol === 'ETH'),
          topMovers: prices.slice(0, 10)
        };
      } catch (e) {
        console.error('Failed to fetch market data:', e);
      }
    }

    if (token) {
      context.tokenData = {
        symbol: token.symbol,
        address: token.address,
        chain: token.chain || 'ethereum'
      };
    }

    let result;
    switch (workflow) {
      case 'hierarchical':
        result = await swarmsClient.executeHierarchicalSwarm(task, context);
        break;
      case 'concurrent':
        const agents = body.agents || ['MARKET_ANALYST', 'TECHNICAL_ANALYST', 'RISK_MANAGER'];
        result = await swarmsClient.executeConcurrentAnalysis(task, agents, context);
        break;
      case 'sequential':
        result = await swarmsClient.executeSequentialWorkflow(task, context);
        break;
      case 'alpha':
        result = await swarmsClient.huntAlpha(context);
        break;
      case 'router':
        result = await swarmsClient.routeToSpecialist(task, context);
        break;
      default:
        result = await swarmsClient.executeHierarchicalSwarm(task, context);
    }

    return NextResponse.json({
      success: true,
      result: { ...result, mode: 'swarm' },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agent analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Quick Trading Analysis',
    version: '2.0.0',
    modes: [
      { id: 'quick', name: 'Quick Analysis', description: 'Fast AI-powered analysis (5-10 seconds)' },
      { id: 'swarm', name: 'Multi-Agent Swarm', description: 'Comprehensive multi-agent analysis (slower)' }
    ],
    endpoints: {
      analyze: 'POST /api/agents/analyze',
      quick: 'POST /api/agents/quick'
    }
  });
}
