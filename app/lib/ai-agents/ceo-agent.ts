// CEO Super Agent - Orchestrates all trading agents

import { TradingAgent, CEODecision, AgentDecision, TradingSession } from './agent-types';
import { llmService } from './llm-service';
import { tradingAgentExecutor } from './trading-agents';

export class CEOAgent {
  async evaluateAgentDecisions(
    session: TradingSession,
    agentDecisions: Array<{ agent: TradingAgent; decision: AgentDecision }>
  ): Promise<CEODecision[]> {
    const ceoDecisions: CEODecision[] = [];

    // Filter out HOLD decisions
    const actionableDecisions = agentDecisions.filter(ad => ad.decision.action !== 'HOLD');

    if (actionableDecisions.length === 0) {
      return ceoDecisions;
    }

    // Get market conditions summary
    const marketConditions = this.assessMarketConditions(session.marketData);

    // Get CEO's strategic decision
    const ceoDecision = await llmService.getCEODecision(
      actionableDecisions.map(ad => ({
        agent: ad.agent.name,
        decision: ad.decision
      })),
      marketConditions,
      session.totalCapital,
      session.usedCapital
    );

    ceoDecisions.push(ceoDecision);

    // Execute CEO's decision
    await this.executeCEODecision(ceoDecision, actionableDecisions, session);

    return ceoDecisions;
  }

  private assessMarketConditions(marketData: any[]): string {
    const avgChange = marketData.reduce((sum, m) => sum + m.priceChange24h, 0) / marketData.length;
    const bullishCount = marketData.filter(m => m.priceChange24h > 0).length;
    
    let condition = 'Neutral';
    if (avgChange > 5) condition = 'Strong Bullish';
    else if (avgChange > 2) condition = 'Bullish';
    else if (avgChange < -5) condition = 'Strong Bearish';
    else if (avgChange < -2) condition = 'Bearish';

    return `${condition} - ${bullishCount}/${marketData.length} assets positive, avg change ${avgChange.toFixed(2)}%`;
  }

  private async executeCEODecision(
    ceoDecision: CEODecision,
    agentDecisions: Array<{ agent: TradingAgent; decision: AgentDecision }>,
    session: TradingSession
  ): Promise<void> {
    switch (ceoDecision.action) {
      case 'APPROVE':
        // Execute all approved trades
        for (const { agent, decision } of agentDecisions) {
          if (agent.status === 'ACTIVE') {
            try {
              await tradingAgentExecutor.executeTrade(agent, decision);
            } catch (error) {
              console.error(`Failed to execute trade for ${agent.name}:`, error);
            }
          }
        }
        break;

      case 'MODIFY':
        // Apply modifications and execute
        for (const { agent, decision } of agentDecisions) {
          if (agent.status === 'ACTIVE') {
            const modifiedDecision = {
              ...decision,
              ...ceoDecision.modifications
            };
            try {
              await tradingAgentExecutor.executeTrade(agent, modifiedDecision);
            } catch (error) {
              console.error(`Failed to execute modified trade for ${agent.name}:`, error);
            }
          }
        }
        break;

      case 'REJECT':
        // Do nothing - trades are rejected
        console.log('CEO rejected all trades:', ceoDecision.reasoning);
        break;

      case 'PAUSE_AGENT':
        // Pause specific agent
        if (ceoDecision.agentId) {
          const agent = session.agents.find(a => a.id === ceoDecision.agentId);
          if (agent) {
            agent.status = 'PAUSED';
            console.log(`Agent ${agent.name} paused by CEO:`, ceoDecision.reasoning);
          }
        }
        break;

      case 'REBALANCE':
        // Rebalance capital allocation
        await this.rebalanceCapital(session);
        break;
    }
  }

  private async rebalanceCapital(session: TradingSession): Promise<void> {
    // Calculate performance-weighted allocation
    const totalPerformance = session.agents.reduce((sum, a) => {
      const perfScore = a.performance.winRate * (1 + a.performance.totalPnL / a.allocatedCapital);
      return sum + Math.max(0.1, perfScore); // Minimum 0.1 to keep underperformers active
    }, 0);

    session.agents.forEach(agent => {
      const perfScore = agent.performance.winRate * (1 + agent.performance.totalPnL / agent.allocatedCapital);
      const normalizedScore = Math.max(0.1, perfScore) / totalPerformance;
      
      // Reallocate capital
      const newAllocation = session.totalCapital * normalizedScore;
      
      console.log(`Rebalancing ${agent.name}: $${agent.allocatedCapital.toFixed(2)} → $${newAllocation.toFixed(2)}`);
      
      agent.allocatedCapital = newAllocation;
    });
  }

  async performRiskCheck(session: TradingSession): Promise<{
    safe: boolean;
    warnings: string[];
    actions: string[];
  }> {
    const warnings: string[] = [];
    const actions: string[] = [];

    // Check overall drawdown
    const totalPnL = session.agents.reduce((sum, a) => sum + a.performance.totalPnL, 0);
    const drawdownPercent = (totalPnL / session.totalCapital) * 100;

    if (drawdownPercent < -10) {
      warnings.push(`High drawdown: ${drawdownPercent.toFixed(2)}%`);
      actions.push('Consider pausing underperforming agents');
    }

    // Check capital utilization
    const utilizationPercent = (session.usedCapital / session.totalCapital) * 100;
    if (utilizationPercent > 80) {
      warnings.push(`High capital utilization: ${utilizationPercent.toFixed(1)}%`);
      actions.push('Reduce position sizes or close positions');
    }

    // Check individual agent performance
    session.agents.forEach(agent => {
      if (agent.performance.winRate < 0.3 && agent.performance.totalTrades > 10) {
        warnings.push(`${agent.name} has low win rate: ${(agent.performance.winRate * 100).toFixed(1)}%`);
        actions.push(`Consider pausing or retraining ${agent.name}`);
      }

      if (agent.performance.maxDrawdown < -20) {
        warnings.push(`${agent.name} has high drawdown: ${agent.performance.maxDrawdown.toFixed(1)}%`);
        actions.push(`Review ${agent.name}'s risk parameters`);
      }
    });

    return {
      safe: warnings.length === 0,
      warnings,
      actions
    };
  }
}

export const ceoAgent = new CEOAgent();
