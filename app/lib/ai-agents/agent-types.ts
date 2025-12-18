// Agent Type Definitions

export interface AgentDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE';
  symbol: string;
  confidence: number; // 0-100
  reasoning: string;
  suggestedSize?: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  funding_rate?: number;
  openInterest?: number;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export interface AgentPosition {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface AgentPerformance {
  agentId: string;
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  sharpeRatio?: number;
  maxDrawdown: number;
  avgHoldTime: number;
  lastDecision?: AgentDecision;
}

export interface TradingAgent {
  id: string;
  name: string;
  type: 'TREND_FOLLOWER' | 'MEAN_REVERSION' | 'MOMENTUM' | 'ARBITRAGE' | 'SCALPER';
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  strategy: string;
  allocatedCapital: number;
  currentCapital: number;
  positions: AgentPosition[];
  performance: AgentPerformance;
  llmProvider: 'gemini' | 'grok';
  riskTolerance: 'low' | 'medium' | 'high';
  maxPositions: number;
  createdAt: number;
}

export interface CEODecision {
  timestamp: number;
  action: 'APPROVE' | 'REJECT' | 'MODIFY' | 'PAUSE_AGENT' | 'ACTIVATE_AGENT' | 'REBALANCE';
  agentId?: string;
  reasoning: string;
  modifications?: Partial<AgentDecision>;
  riskAssessment: string;
  marketConditions: string;
}

export interface TradingSession {
  id: string;
  startTime: number;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  totalCapital: number;
  usedCapital: number;
  totalPnL: number;
  agents: TradingAgent[];
  ceoDecisions: CEODecision[];
  marketData: MarketData[];
}

export interface AsterDexOrder {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
}

export interface AsterDexPosition {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
  leverage: number;
  unrealizedPnl: number;
  realizedPnl: number;
  marginType: 'ISOLATED' | 'CROSS';
}

export interface AsterDexAccount {
  totalBalance: number;
  availableBalance: number;
  totalUnrealizedPnl: number;
  totalMarginUsed: number;
  positions: AsterDexPosition[];
}
