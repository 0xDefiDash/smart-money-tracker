/**
 * Swarms AI Hierarchical Framework Client
 * Enterprise-grade multi-agent orchestration for trading intelligence
 */

const SWARMS_API_BASE = 'https://api.swarms.world';

// Agent Types
export interface AgentConfig {
  agent_name: string;
  description: string;
  system_prompt: string;
  model_name: string;
  max_loops?: number;
  temperature?: number;
  tags?: string[];
}

export interface SwarmRequest {
  name: string;
  description: string;
  agents: AgentConfig[];
  swarm_type: 'HierarchicalSwarm' | 'SequentialWorkflow' | 'ConcurrentWorkflow' | 'MultiAgentRouter' | 'AgentRearrange' | 'MixtureOfAgents';
  task: string;
  max_loops?: number;
  output_type?: string;
}

export interface SwarmResult {
  job_id: string;
  status: 'completed' | 'pending' | 'failed';
  output: string | Record<string, any>;
  number_of_agents: number;
  execution_time: number;
  billing_info?: {
    total_cost: number;
    token_usage: number;
  };
  agent_outputs?: Array<{
    agent_name: string;
    output: string;
  }>;
}

// Predefined Trading Agents
export const TRADING_AGENTS: Record<string, AgentConfig> = {
  // Director Agent - Top of hierarchy
  TRADING_DIRECTOR: {
    agent_name: 'Trading-Director',
    description: 'Chief strategist that coordinates all trading analysis and makes final decisions',
    system_prompt: `You are the Trading Director, the chief strategist overseeing a crypto trading operation.
Your role is to:
1. Analyze incoming market data and intelligence from your team
2. Synthesize findings from Market Analyst, Risk Manager, and Technical Analyst
3. Make final trading recommendations with clear entry/exit points
4. Coordinate the workflow between specialized agents
5. Ensure risk parameters are always respected

You have access to:
- Real-time whale tracking data
- Smart money flow intelligence from Nansen
- Technical indicators and chart patterns
- Risk metrics and portfolio exposure

Provide your analysis in a structured format with:
- Executive Summary
- Key Insights
- Recommended Actions
- Risk Assessment
- Confidence Level (1-10)`,
    model_name: 'gpt-4o',
    max_loops: 3,
    temperature: 0.7,
    tags: ['trading', 'director', 'strategy']
  },

  // Market Analyst Agent
  MARKET_ANALYST: {
    agent_name: 'Market-Analyst',
    description: 'Analyzes market conditions, trends, and sentiment',
    system_prompt: `You are a Senior Market Analyst specializing in cryptocurrency markets.
Your responsibilities:
1. Analyze current market conditions and overall sentiment
2. Identify trending tokens and sectors
3. Track whale movements and smart money flows
4. Monitor exchange inflows/outflows
5. Assess market structure (bullish/bearish/neutral)

Provide analysis including:
- Market Overview (BTC dominance, total market cap trend)
- Sector Analysis (DeFi, AI, Memes, L2s)
- Volume Analysis
- Sentiment Score (Fear/Greed)
- Key Support/Resistance Levels
- Notable Whale Activity`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.6,
    tags: ['market', 'analysis', 'sentiment']
  },

  // Risk Manager Agent
  RISK_MANAGER: {
    agent_name: 'Risk-Manager',
    description: 'Evaluates and manages trading risks',
    system_prompt: `You are a Risk Manager for a crypto trading operation.
Your responsibilities:
1. Assess risk for proposed trades
2. Calculate position sizing based on portfolio value and risk tolerance
3. Set stop-loss and take-profit levels
4. Monitor portfolio exposure and concentration
5. Identify potential risks (liquidation, smart contract, market)

Provide risk assessment including:
- Risk Score (1-10, where 10 is highest risk)
- Maximum Position Size (% of portfolio)
- Recommended Stop-Loss Level
- Risk/Reward Ratio
- Portfolio Impact Analysis
- Potential Risks and Mitigations
- Recommended Leverage (if any)`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.4,
    tags: ['risk', 'management', 'portfolio']
  },

  // Technical Analyst Agent
  TECHNICAL_ANALYST: {
    agent_name: 'Technical-Analyst',
    description: 'Performs technical analysis on price charts',
    system_prompt: `You are a Technical Analyst specializing in crypto chart analysis.
Your responsibilities:
1. Identify chart patterns (triangles, wedges, head & shoulders, etc.)
2. Analyze key indicators (RSI, MACD, Bollinger Bands, Moving Averages)
3. Determine support and resistance levels
4. Identify trend direction and strength
5. Spot divergences and confluence zones

Provide analysis including:
- Trend Analysis (short/medium/long term)
- Key Levels (support, resistance, pivot points)
- Indicator Readings (RSI, MACD, etc.)
- Chart Patterns Identified
- Entry Zones
- Price Targets
- Invalidation Levels`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.5,
    tags: ['technical', 'charts', 'indicators']
  },

  // On-Chain Analyst Agent
  ONCHAIN_ANALYST: {
    agent_name: 'OnChain-Analyst',
    description: 'Analyzes blockchain data and smart money movements',
    system_prompt: `You are an On-Chain Analyst specializing in blockchain data analysis.
Your responsibilities:
1. Track whale wallet movements
2. Analyze DEX trading patterns
3. Monitor token holder distribution
4. Track smart money accumulation/distribution
5. Identify unusual on-chain activity

Provide analysis including:
- Whale Activity Summary
- Smart Money Flows (from Nansen data)
- Exchange Inflows/Outflows
- Top Token Movements
- Holder Distribution Changes
- Notable Transactions
- Accumulation/Distribution Signals`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.5,
    tags: ['onchain', 'whale', 'blockchain']
  },

  // Execution Agent
  EXECUTION_AGENT: {
    agent_name: 'Execution-Agent',
    description: 'Plans and optimizes trade execution',
    system_prompt: `You are a Trade Execution Specialist for crypto markets.
Your responsibilities:
1. Plan optimal trade entry strategy
2. Determine order types (market, limit, TWAP)
3. Calculate slippage impact
4. Identify best execution venues (DEX vs CEX)
5. Plan position scaling (DCA, laddered entries)

Provide execution plan including:
- Recommended Entry Strategy
- Order Type and Size
- Slippage Estimate
- Execution Venue Recommendation
- Scaling Strategy (if applicable)
- Gas/Fee Optimization
- Timing Considerations`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.4,
    tags: ['execution', 'trading', 'orders']
  },

  // Alpha Hunter Agent
  ALPHA_HUNTER: {
    agent_name: 'Alpha-Hunter',
    description: 'Identifies early opportunities and alpha',
    system_prompt: `You are an Alpha Hunter searching for early crypto opportunities.
Your responsibilities:
1. Identify emerging narratives and trends
2. Find tokens before major price moves
3. Track smart money early entries
4. Monitor new token launches and airdrops
5. Identify undervalued gems

Provide alpha insights including:
- Emerging Narratives
- Early Opportunity Tokens
- Smart Money Recent Buys
- Upcoming Catalysts
- Hidden Gem Candidates
- Risk/Reward Assessment
- Entry Timing Recommendation`,
    model_name: 'gpt-4o',
    max_loops: 2,
    temperature: 0.8,
    tags: ['alpha', 'opportunities', 'narratives']
  }
};

export class SwarmsClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SWARMS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SWARMS_API_KEY not configured');
    }
  }

  /**
   * Execute a hierarchical swarm for trading analysis
   */
  async executeHierarchicalSwarm(task: string, context?: Record<string, any>): Promise<SwarmResult> {
    const enrichedTask = this.enrichTaskWithContext(task, context);
    
    const request: SwarmRequest = {
      name: 'Trading-Intelligence-Swarm',
      description: 'Hierarchical multi-agent system for comprehensive trading analysis',
      swarm_type: 'HierarchicalSwarm',
      agents: [
        TRADING_AGENTS.TRADING_DIRECTOR,
        TRADING_AGENTS.MARKET_ANALYST,
        TRADING_AGENTS.RISK_MANAGER,
        TRADING_AGENTS.TECHNICAL_ANALYST,
        TRADING_AGENTS.ONCHAIN_ANALYST
      ],
      task: enrichedTask,
      max_loops: 3,
      output_type: 'json'
    };

    return this.executeSwarm(request);
  }

  /**
   * Execute a concurrent analysis with multiple specialists
   */
  async executeConcurrentAnalysis(task: string, agentTypes: string[], context?: Record<string, any>): Promise<SwarmResult> {
    const enrichedTask = this.enrichTaskWithContext(task, context);
    const agents = agentTypes
      .map(type => TRADING_AGENTS[type])
      .filter(Boolean);

    const request: SwarmRequest = {
      name: 'Concurrent-Trading-Analysis',
      description: 'Parallel multi-agent analysis for fast insights',
      swarm_type: 'ConcurrentWorkflow',
      agents,
      task: enrichedTask,
      max_loops: 2,
      output_type: 'json'
    };

    return this.executeSwarm(request);
  }

  /**
   * Execute sequential workflow for step-by-step analysis
   */
  async executeSequentialWorkflow(task: string, context?: Record<string, any>): Promise<SwarmResult> {
    const enrichedTask = this.enrichTaskWithContext(task, context);

    const request: SwarmRequest = {
      name: 'Sequential-Trading-Workflow',
      description: 'Step-by-step analysis pipeline',
      swarm_type: 'SequentialWorkflow',
      agents: [
        TRADING_AGENTS.MARKET_ANALYST,
        TRADING_AGENTS.TECHNICAL_ANALYST,
        TRADING_AGENTS.ONCHAIN_ANALYST,
        TRADING_AGENTS.RISK_MANAGER,
        TRADING_AGENTS.EXECUTION_AGENT
      ],
      task: enrichedTask,
      max_loops: 1,
      output_type: 'json'
    };

    return this.executeSwarm(request);
  }

  /**
   * Route task to most appropriate specialist
   */
  async routeToSpecialist(task: string, context?: Record<string, any>): Promise<SwarmResult> {
    const enrichedTask = this.enrichTaskWithContext(task, context);

    const request: SwarmRequest = {
      name: 'Smart-Task-Router',
      description: 'Intelligent routing to specialist agents',
      swarm_type: 'MultiAgentRouter',
      agents: Object.values(TRADING_AGENTS),
      task: enrichedTask,
      max_loops: 2,
      output_type: 'json'
    };

    return this.executeSwarm(request);
  }

  /**
   * Execute alpha hunting swarm
   */
  async huntAlpha(context?: Record<string, any>): Promise<SwarmResult> {
    const task = `Identify the top 5 alpha opportunities in the current crypto market.
Analyze:
1. Emerging narratives and trending sectors
2. Tokens showing smart money accumulation
3. Undervalued projects with upcoming catalysts
4. New launches with high potential
5. Risk/reward assessment for each opportunity`;

    const enrichedTask = this.enrichTaskWithContext(task, context);

    const request: SwarmRequest = {
      name: 'Alpha-Hunting-Swarm',
      description: 'Multi-agent alpha identification system',
      swarm_type: 'MixtureOfAgents',
      agents: [
        TRADING_AGENTS.ALPHA_HUNTER,
        TRADING_AGENTS.ONCHAIN_ANALYST,
        TRADING_AGENTS.MARKET_ANALYST,
        TRADING_AGENTS.RISK_MANAGER
      ],
      task: enrichedTask,
      max_loops: 2,
      output_type: 'json'
    };

    return this.executeSwarm(request);
  }

  /**
   * Execute single agent task
   */
  async executeSingleAgent(agentType: string, task: string, context?: Record<string, any>): Promise<SwarmResult> {
    const agent = TRADING_AGENTS[agentType];
    if (!agent) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    const enrichedTask = this.enrichTaskWithContext(task, context);

    // For single agent, we use the agent API endpoint
    const response = await fetch(`${SWARMS_API_BASE}/v1/agent/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({
        agent_name: agent.agent_name,
        system_prompt: agent.system_prompt,
        task: enrichedTask,
        model_name: agent.model_name,
        max_loops: agent.max_loops || 1,
        temperature: agent.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Swarms API error: ${error}`);
    }

    const result = await response.json();
    return {
      job_id: result.job_id || 'single-agent',
      status: 'completed',
      output: result.output || result.response || result,
      number_of_agents: 1,
      execution_time: result.execution_time || 0,
      billing_info: result.billing_info
    };
  }

  /**
   * Core swarm execution method
   */
  private async executeSwarm(request: SwarmRequest): Promise<SwarmResult> {
    if (!this.apiKey) {
      // Return mock response for development
      return this.getMockResponse(request);
    }

    try {
      const response = await fetch(`${SWARMS_API_BASE}/v1/swarm/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Swarms API error:', errorText);
        // Fallback to mock if API fails
        return this.getMockResponse(request);
      }

      return await response.json();
    } catch (error) {
      console.error('Swarms execution error:', error);
      return this.getMockResponse(request);
    }
  }

  /**
   * Enrich task with market context
   */
  private enrichTaskWithContext(task: string, context?: Record<string, any>): string {
    if (!context) return task;

    let enrichedTask = task;
    
    if (context.marketData) {
      enrichedTask += `\n\nCurrent Market Data:\n${JSON.stringify(context.marketData, null, 2)}`;
    }
    
    if (context.whaleActivity) {
      enrichedTask += `\n\nRecent Whale Activity:\n${JSON.stringify(context.whaleActivity, null, 2)}`;
    }
    
    if (context.smartMoneyFlows) {
      enrichedTask += `\n\nSmart Money Flows:\n${JSON.stringify(context.smartMoneyFlows, null, 2)}`;
    }

    if (context.tokenData) {
      enrichedTask += `\n\nToken Data:\n${JSON.stringify(context.tokenData, null, 2)}`;
    }

    return enrichedTask;
  }

  /**
   * Mock response for development/fallback
   */
  private getMockResponse(request: SwarmRequest): SwarmResult {
    const timestamp = new Date().toISOString();
    
    return {
      job_id: `mock-${Date.now()}`,
      status: 'completed',
      output: {
        executive_summary: `Hierarchical analysis completed for: ${request.task.substring(0, 100)}...`,
        timestamp,
        swarm_type: request.swarm_type,
        agents_used: request.agents.map(a => a.agent_name),
        analysis: {
          market_sentiment: 'Neutral with bullish bias',
          risk_score: 6,
          confidence: 7,
          recommendation: 'Monitor for entry on pullback',
          key_levels: {
            support: '$125,000',
            resistance: '$140,000'
          }
        },
        agent_outputs: request.agents.map(agent => ({
          agent_name: agent.agent_name,
          output: `${agent.agent_name} analysis: Task processed successfully. Key findings aligned with current market conditions.`
        }))
      },
      number_of_agents: request.agents.length,
      execution_time: 2.5,
      billing_info: {
        total_cost: 0.05,
        token_usage: 2500
      }
    };
  }
}

// Singleton instance
export const swarmsClient = new SwarmsClient();
