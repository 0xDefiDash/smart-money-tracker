// Agent Manager - Manages the complete trading system

import { TradingAgent, TradingSession, MarketData } from './agent-types';
import { asterDexClient } from './asterdex-client';
import { tradingAgentExecutor } from './trading-agents';
import { ceoAgent } from './ceo-agent';

class AgentManager {
  private sessions: Map<string, TradingSession> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  createSession(totalCapital: number = 100000): TradingSession {
    const sessionId = `session_${Date.now()}`;
    
    // Create diverse agent team
    const agents: TradingAgent[] = [
      {
        id: 'agent_trend_1',
        name: 'TrendMaster Alpha',
        type: 'TREND_FOLLOWER',
        status: 'ACTIVE',
        strategy: 'Follows strong trends using moving averages and momentum indicators',
        allocatedCapital: totalCapital * 0.25,
        currentCapital: totalCapital * 0.25,
        positions: [],
        performance: {
          agentId: 'agent_trend_1',
          totalTrades: 0,
          winRate: 0.5,
          totalPnL: 0,
          maxDrawdown: 0,
          avgHoldTime: 3600000 // 1 hour
        },
        llmProvider: 'gemini',
        riskTolerance: 'medium',
        maxPositions: 3,
        createdAt: Date.now()
      },
      {
        id: 'agent_momentum_1',
        name: 'Momentum Hunter',
        type: 'MOMENTUM',
        status: 'ACTIVE',
        strategy: 'Captures short-term price momentum and breakouts',
        allocatedCapital: totalCapital * 0.20,
        currentCapital: totalCapital * 0.20,
        positions: [],
        performance: {
          agentId: 'agent_momentum_1',
          totalTrades: 0,
          winRate: 0.5,
          totalPnL: 0,
          maxDrawdown: 0,
          avgHoldTime: 1800000 // 30 min
        },
        llmProvider: 'grok',
        riskTolerance: 'high',
        maxPositions: 5,
        createdAt: Date.now()
      },
      {
        id: 'agent_reversal_1',
        name: 'Mean Reversion Pro',
        type: 'MEAN_REVERSION',
        status: 'ACTIVE',
        strategy: 'Identifies oversold/overbought conditions for reversal trades',
        allocatedCapital: totalCapital * 0.20,
        currentCapital: totalCapital * 0.20,
        positions: [],
        performance: {
          agentId: 'agent_reversal_1',
          totalTrades: 0,
          winRate: 0.5,
          totalPnL: 0,
          maxDrawdown: 0,
          avgHoldTime: 7200000 // 2 hours
        },
        llmProvider: 'gemini',
        riskTolerance: 'medium',
        maxPositions: 3,
        createdAt: Date.now()
      },
      {
        id: 'agent_scalper_1',
        name: 'Lightning Scalper',
        type: 'SCALPER',
        status: 'ACTIVE',
        strategy: 'High-frequency scalping with tight stops and quick exits',
        allocatedCapital: totalCapital * 0.15,
        currentCapital: totalCapital * 0.15,
        positions: [],
        performance: {
          agentId: 'agent_scalper_1',
          totalTrades: 0,
          winRate: 0.5,
          totalPnL: 0,
          maxDrawdown: 0,
          avgHoldTime: 600000 // 10 min
        },
        llmProvider: 'grok',
        riskTolerance: 'low',
        maxPositions: 2,
        createdAt: Date.now()
      },
      {
        id: 'agent_arb_1',
        name: 'Arbitrage Scanner',
        type: 'ARBITRAGE',
        status: 'ACTIVE',
        strategy: 'Finds and exploits price discrepancies across markets',
        allocatedCapital: totalCapital * 0.20,
        currentCapital: totalCapital * 0.20,
        positions: [],
        performance: {
          agentId: 'agent_arb_1',
          totalTrades: 0,
          winRate: 0.5,
          totalPnL: 0,
          maxDrawdown: 0,
          avgHoldTime: 300000 // 5 min
        },
        llmProvider: 'gemini',
        riskTolerance: 'low',
        maxPositions: 4,
        createdAt: Date.now()
      }
    ];

    const session: TradingSession = {
      id: sessionId,
      startTime: Date.now(),
      status: 'RUNNING',
      totalCapital,
      usedCapital: 0,
      totalPnL: 0,
      agents,
      ceoDecisions: [],
      marketData: []
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): TradingSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): TradingSession[] {
    return Array.from(this.sessions.values());
  }

  async updateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'RUNNING') {
      return;
    }

    try {
      // Fetch latest market data
      session.marketData = await asterDexClient.getMarketData();

      // Update all agent positions with current prices
      const priceMap = new Map(
        session.marketData.map(m => [m.symbol, m.price])
      );

      session.agents.forEach(agent => {
        tradingAgentExecutor.updatePositions(agent, priceMap);
      });

      // Calculate used capital
      session.usedCapital = session.agents.reduce((sum, agent) => {
        return sum + agent.positions.reduce((pSum, p) => {
          return pSum + (p.size * p.currentPrice / p.leverage);
        }, 0);
      }, 0);

      // Calculate total PnL
      session.totalPnL = session.agents.reduce((sum, agent) => {
        return sum + agent.performance.totalPnL;
      }, 0);

      // Get agent decisions
      const agentDecisions = await Promise.all(
        session.agents
          .filter(agent => agent.status === 'ACTIVE')
          .map(async agent => ({
            agent,
            decision: await tradingAgentExecutor.executeAgent(agent, session.marketData)
          }))
      );

      // CEO evaluates and executes decisions
      const ceoDecisions = await ceoAgent.evaluateAgentDecisions(session, agentDecisions);
      session.ceoDecisions.push(...ceoDecisions);

      // Perform risk check
      const riskCheck = await ceoAgent.performRiskCheck(session);
      if (!riskCheck.safe) {
        console.warn('Risk warnings:', riskCheck.warnings);
        console.warn('Suggested actions:', riskCheck.actions);
      }

    } catch (error) {
      console.error('Session update failed:', error);
    }
  }

  startAutoUpdate(sessionId: string, intervalMs: number = 30000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateSession(sessionId);
    }, intervalMs);
  }

  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  pauseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'PAUSED';
      session.agents.forEach(agent => {
        agent.status = 'PAUSED';
      });
    }
  }

  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'RUNNING';
      session.agents.forEach(agent => {
        if (agent.status === 'PAUSED') {
          agent.status = 'ACTIVE';
        }
      });
    }
  }

  stopSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'STOPPED';
      session.agents.forEach(agent => {
        agent.status = 'STOPPED';
      });
      this.stopAutoUpdate();
    }
  }
}

export const agentManager = new AgentManager();
