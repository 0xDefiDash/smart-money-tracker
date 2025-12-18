// LLM Service for Gemini and Grok AI

import { AgentDecision, MarketData, AgentPosition, CEODecision } from './agent-types';

export class LLMService {
  private geminiApiKey: string;
  private grokApiKey: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.grokApiKey = process.env.GROK_API_KEY || '';
  }

  async callGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Error calling Gemini API';
    }
  }

  async callGrok(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.grokApiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are Grok, an AI trading assistant specializing in cryptocurrency perpetuals trading analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'grok-beta',
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response';
    } catch (error) {
      console.error('Grok API error:', error);
      return 'Error calling Grok API';
    }
  }

  async getAgentDecision(
    agentType: string,
    marketData: MarketData[],
    positions: AgentPosition[],
    llmProvider: 'gemini' | 'grok'
  ): Promise<AgentDecision> {
    const prompt = this.buildAgentPrompt(agentType, marketData, positions);
    
    const response = llmProvider === 'gemini' 
      ? await this.callGemini(prompt)
      : await this.callGrok(prompt);

    return this.parseAgentResponse(response, marketData[0]);
  }

  async getCEODecision(
    agentDecisions: Array<{ agent: string; decision: AgentDecision }>,
    marketConditions: string,
    totalCapital: number,
    usedCapital: number
  ): Promise<CEODecision> {
    const prompt = this.buildCEOPrompt(agentDecisions, marketConditions, totalCapital, usedCapital);
    
    // CEO always uses Gemini for strategic decisions
    const response = await this.callGemini(prompt);
    
    return this.parseCEOResponse(response);
  }

  private buildAgentPrompt(agentType: string, marketData: MarketData[], positions: AgentPosition[]): string {
    const market = marketData[0] || {};
    
    return `You are a ${agentType} trading agent analyzing cryptocurrency perpetuals.

Current Market Data:
${marketData.map(m => `
- ${m.symbol}: $${m.price.toFixed(2)}
  24h Change: ${m.priceChange24h.toFixed(2)}%
  Volume: $${(m.volume24h / 1000000).toFixed(2)}M
  Sentiment: ${m.sentiment || 'neutral'}
`).join('')}

Current Positions:
${positions.length > 0 ? positions.map(p => `
- ${p.symbol} ${p.side}: ${p.size} contracts @ $${p.entryPrice.toFixed(2)}
  Current PnL: ${p.pnlPercent.toFixed(2)}%
`).join('') : 'No open positions'}

Based on your ${agentType} strategy, provide a trading decision in this EXACT JSON format:
{
  "action": "BUY" or "SELL" or "HOLD" or "CLOSE",
  "symbol": "BTCUSDT" or other symbol,
  "confidence": 0-100,
  "reasoning": "Your detailed analysis",
  "suggestedSize": number of contracts,
  "leverage": 1-100,
  "stopLoss": price level,
  "takeProfit": price level
}

Provide ONLY the JSON response, nothing else.`;
  }

  private buildCEOPrompt(
    agentDecisions: Array<{ agent: string; decision: AgentDecision }>,
    marketConditions: string,
    totalCapital: number,
    usedCapital: number
  ): string {
    return `You are the CEO Super Agent managing a team of trading agents for cryptocurrency perpetuals.

Current Portfolio:
- Total Capital: $${totalCapital.toFixed(2)}
- Used Capital: $${usedCapital.toFixed(2)} (${((usedCapital/totalCapital)*100).toFixed(1)}%)
- Available: $${(totalCapital - usedCapital).toFixed(2)}

Market Conditions: ${marketConditions}

Agent Decisions Pending Review:
${agentDecisions.map(ad => `
${ad.agent}:
  Action: ${ad.decision.action} ${ad.decision.symbol}
  Confidence: ${ad.decision.confidence}%
  Reasoning: ${ad.decision.reasoning}
  Size: ${ad.decision.suggestedSize} @ ${ad.decision.leverage}x leverage
`).join('')}

As CEO, evaluate these decisions for:
1. Risk management
2. Portfolio diversification
3. Capital allocation
4. Market timing

Provide your decision in this EXACT JSON format:
{
  "action": "APPROVE" or "REJECT" or "MODIFY" or "PAUSE_AGENT" or "REBALANCE",
  "agentId": "agent_id_if_specific_action",
  "reasoning": "Your strategic analysis",
  "modifications": { "leverage": 5, "suggestedSize": 10 },
  "riskAssessment": "Low/Medium/High risk evaluation",
  "marketConditions": "Your market outlook"
}

Provide ONLY the JSON response, nothing else.`;
  }

  private parseAgentResponse(response: string, defaultMarket: MarketData): AgentDecision {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action || 'HOLD',
          symbol: parsed.symbol || defaultMarket?.symbol || 'BTCUSDT',
          confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
          reasoning: parsed.reasoning || 'No reasoning provided',
          suggestedSize: parsed.suggestedSize || 1,
          leverage: Math.min(100, Math.max(1, parsed.leverage || 5)),
          stopLoss: parsed.stopLoss,
          takeProfit: parsed.takeProfit,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Error parsing agent response:', error);
    }

    // Fallback decision
    return {
      action: 'HOLD',
      symbol: defaultMarket?.symbol || 'BTCUSDT',
      confidence: 0,
      reasoning: 'Failed to parse LLM response',
      timestamp: Date.now()
    };
  }

  private parseCEOResponse(response: string): CEODecision {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          timestamp: Date.now(),
          action: parsed.action || 'APPROVE',
          agentId: parsed.agentId,
          reasoning: parsed.reasoning || 'No reasoning provided',
          modifications: parsed.modifications,
          riskAssessment: parsed.riskAssessment || 'Medium',
          marketConditions: parsed.marketConditions || 'Neutral'
        };
      }
    } catch (error) {
      console.error('Error parsing CEO response:', error);
    }

    return {
      timestamp: Date.now(),
      action: 'APPROVE',
      reasoning: 'Default approval - failed to parse response',
      riskAssessment: 'Medium',
      marketConditions: 'Neutral'
    };
  }
}

export const llmService = new LLMService();
