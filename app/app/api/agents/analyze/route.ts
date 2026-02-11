import { NextRequest, NextResponse } from 'next/server';
import { swarmsClient } from '@/lib/ai-agents/swarms-client';
import { fetchCryptoPrices } from '@/lib/price-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, workflow, token, includeMarketData, includeWhaleData } = body;

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Build context from available data sources
    const context: Record<string, any> = {};

    // Include market data if requested
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

    // If specific token provided, add it to context
    if (token) {
      context.tokenData = {
        symbol: token.symbol,
        address: token.address,
        chain: token.chain || 'ethereum'
      };
    }

    // Execute the appropriate workflow
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

      case 'single':
        const agentType = body.agentType || 'MARKET_ANALYST';
        result = await swarmsClient.executeSingleAgent(agentType, task, context);
        break;

      default:
        // Default to hierarchical for comprehensive analysis
        result = await swarmsClient.executeHierarchicalSwarm(task, context);
    }

    return NextResponse.json({
      success: true,
      result,
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
    service: 'Swarms AI Trading Intelligence',
    version: '1.0.0',
    workflows: [
      {
        id: 'hierarchical',
        name: 'Hierarchical Swarm',
        description: 'Director-led comprehensive analysis with specialized agents',
        agents: ['Trading-Director', 'Market-Analyst', 'Risk-Manager', 'Technical-Analyst', 'OnChain-Analyst']
      },
      {
        id: 'concurrent',
        name: 'Concurrent Analysis',
        description: 'Parallel analysis from multiple specialists',
        agents: 'Configurable'
      },
      {
        id: 'sequential',
        name: 'Sequential Workflow',
        description: 'Step-by-step analysis pipeline',
        agents: ['Market-Analyst', 'Technical-Analyst', 'OnChain-Analyst', 'Risk-Manager', 'Execution-Agent']
      },
      {
        id: 'alpha',
        name: 'Alpha Hunter',
        description: 'Identify early opportunities and alpha',
        agents: ['Alpha-Hunter', 'OnChain-Analyst', 'Market-Analyst', 'Risk-Manager']
      },
      {
        id: 'router',
        name: 'Smart Router',
        description: 'Automatically routes to best specialist',
        agents: 'All available'
      },
      {
        id: 'single',
        name: 'Single Agent',
        description: 'Direct query to a specific specialist',
        agents: 'One selected'
      }
    ],
    availableAgents: [
      'TRADING_DIRECTOR',
      'MARKET_ANALYST', 
      'RISK_MANAGER',
      'TECHNICAL_ANALYST',
      'ONCHAIN_ANALYST',
      'EXECUTION_AGENT',
      'ALPHA_HUNTER'
    ]
  });
}
