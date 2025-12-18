// Individual Trading Agent Implementation

import { TradingAgent, AgentDecision, MarketData, AgentPosition } from './agent-types';
import { llmService } from './llm-service';
import { asterDexClient } from './asterdex-client';

export class TradingAgentExecutor {
  async executeAgent(agent: TradingAgent, marketData: MarketData[]): Promise<AgentDecision> {
    // Get AI decision based on agent type and strategy
    const decision = await llmService.getAgentDecision(
      agent.type,
      marketData,
      agent.positions,
      agent.llmProvider
    );

    // Apply risk controls based on agent's risk tolerance
    const controlledDecision = this.applyRiskControls(decision, agent, marketData);

    // Update agent's last decision
    if (agent.performance.lastDecision) {
      agent.performance.lastDecision = controlledDecision;
    }

    return controlledDecision;
  }

  private applyRiskControls(decision: AgentDecision, agent: TradingAgent, marketData: MarketData[]): AgentDecision {
    const controlled = { ...decision };

    // Adjust leverage based on risk tolerance
    const maxLeverage = {
      low: 5,
      medium: 10,
      high: 20
    }[agent.riskTolerance];

    if (controlled.leverage && controlled.leverage > maxLeverage) {
      controlled.leverage = maxLeverage;
      controlled.reasoning += ` (Leverage capped at ${maxLeverage}x due to ${agent.riskTolerance} risk tolerance)`;
    }

    // Check if agent has room for more positions
    if (decision.action === 'BUY' && agent.positions.length >= agent.maxPositions) {
      controlled.action = 'HOLD';
      controlled.reasoning = 'Max positions reached. Cannot open new position.';
      controlled.confidence = 0;
    }

    // Check capital availability
    const requiredCapital = (controlled.suggestedSize || 0) * (marketData[0]?.price || 0);
    if (requiredCapital > agent.currentCapital * 0.2) { // Max 20% per trade
      const maxSize = (agent.currentCapital * 0.2) / (marketData[0]?.price || 1);
      controlled.suggestedSize = Math.floor(maxSize);
      controlled.reasoning += ` (Position size reduced to 20% of capital)`;
    }

    return controlled;
  }

  async executeTrade(agent: TradingAgent, decision: AgentDecision): Promise<void> {
    if (decision.action === 'HOLD') {
      return;
    }

    try {
      if (decision.action === 'CLOSE') {
        // Close existing position
        const position = agent.positions.find(p => p.symbol === decision.symbol);
        if (position) {
          await asterDexClient.closePosition(decision.symbol);
          // Remove position from agent
          agent.positions = agent.positions.filter(p => p.symbol !== decision.symbol);
        }
      } else if (decision.action === 'BUY' || decision.action === 'SELL') {
        // Open new position
        await asterDexClient.placeOrder({
          symbol: decision.symbol,
          side: decision.action,
          type: 'MARKET',
          quantity: decision.suggestedSize || 1,
          leverage: decision.leverage,
          stopLoss: decision.stopLoss,
          takeProfit: decision.takeProfit
        });

        // Add position to agent (simplified, would need actual order confirmation)
        const currentPrice = await asterDexClient.getMarketPrice(decision.symbol);
        agent.positions.push({
          symbol: decision.symbol,
          side: decision.action === 'BUY' ? 'LONG' : 'SHORT',
          size: decision.suggestedSize || 1,
          entryPrice: currentPrice,
          currentPrice,
          leverage: decision.leverage || 5,
          pnl: 0,
          pnlPercent: 0,
          stopLoss: decision.stopLoss,
          takeProfit: decision.takeProfit
        });
      }

      // Update performance
      agent.performance.totalTrades++;
    } catch (error) {
      console.error(`Trade execution failed for agent ${agent.id}:`, error);
      throw error;
    }
  }

  updatePositions(agent: TradingAgent, currentPrices: Map<string, number>): void {
    agent.positions.forEach(position => {
      const currentPrice = currentPrices.get(position.symbol);
      if (currentPrice) {
        position.currentPrice = currentPrice;
        
        // Calculate PnL
        if (position.side === 'LONG') {
          position.pnl = (currentPrice - position.entryPrice) * position.size * position.leverage;
          position.pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100 * position.leverage;
        } else {
          position.pnl = (position.entryPrice - currentPrice) * position.size * position.leverage;
          position.pnlPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100 * position.leverage;
        }
      }
    });

    // Update agent's current capital
    const totalPnL = agent.positions.reduce((sum, p) => sum + p.pnl, 0);
    agent.currentCapital = agent.allocatedCapital + totalPnL;
    agent.performance.totalPnL = totalPnL;
  }
}

export const tradingAgentExecutor = new TradingAgentExecutor();
