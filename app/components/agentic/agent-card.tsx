'use client';

import { TradingAgent } from '@/lib/ai-agents/agent-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, TrendingDown, Activity, Pause, Play, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AgentCardProps {
  agent: TradingAgent;
  onStatusChange: (agentId: string, status: 'ACTIVE' | 'PAUSED') => void;
}

export function AgentCard({ agent, onStatusChange }: AgentCardProps) {
  const pnlColor = agent.performance.totalPnL >= 0 ? 'text-terminal-green' : 'text-red-500';
  const pnlPercent = (agent.performance.totalPnL / agent.allocatedCapital) * 100;

  const getAgentIcon = (type: string) => {
    const icons: Record<string, typeof Brain> = {
      TREND_FOLLOWER: TrendingUp,
      MOMENTUM: Activity,
      MEAN_REVERSION: TrendingDown,
      SCALPER: Activity,
      ARBITRAGE: ArrowUpRight
    };
    const Icon = icons[type] || Brain;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <Card className="border-2 border-terminal-green/30 bg-black/95 p-4 hover:border-terminal-green/60 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terminal-green/20 rounded-lg">
            {getAgentIcon(agent.type)}
          </div>
          <div>
            <h3 className="text-terminal-green font-bold text-sm uppercase tracking-wider">
              {agent.name}
            </h3>
            <p className="text-terminal-gray text-xs mt-1">{agent.type.replace('_', ' ')}</p>
          </div>
        </div>
        <Badge 
          variant={agent.status === 'ACTIVE' ? 'default' : 'secondary'}
          className={agent.status === 'ACTIVE' ? 'bg-terminal-green/20 text-terminal-green' : ''}
        >
          {agent.status}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-terminal-gray">LLM Provider:</span>
          <span className="text-terminal-green uppercase">{agent.llmProvider}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-terminal-gray">Strategy:</span>
          <span className="text-white text-right ml-2 flex-1">{agent.strategy}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/50 border border-terminal-green/30 rounded p-2">
          <div className="text-terminal-gray text-[10px] uppercase mb-1">Capital</div>
          <div className="text-terminal-green font-mono text-sm">
            ${agent.currentCapital.toFixed(0)}
          </div>
        </div>
        <div className="bg-black/50 border border-terminal-green/30 rounded p-2">
          <div className="text-terminal-gray text-[10px] uppercase mb-1">PnL</div>
          <div className={`${pnlColor} font-mono text-sm font-bold flex items-center gap-1`}>
            {agent.performance.totalPnL >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            ${Math.abs(agent.performance.totalPnL).toFixed(0)} ({pnlPercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div>
          <div className="text-terminal-gray">Trades</div>
          <div className="text-terminal-green font-mono">{agent.performance.totalTrades}</div>
        </div>
        <div>
          <div className="text-terminal-gray">Win Rate</div>
          <div className="text-terminal-green font-mono">{(agent.performance.winRate * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-terminal-gray">Positions</div>
          <div className="text-terminal-green font-mono">{agent.positions.length}/{agent.maxPositions}</div>
        </div>
      </div>

      {agent.positions.length > 0 && (
        <div className="space-y-2 mb-3">
          <div className="text-terminal-gray text-xs uppercase">Open Positions</div>
          {agent.positions.map((pos, idx) => (
            <div key={idx} className="bg-black/50 border border-terminal-green/20 rounded p-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-terminal-green text-xs font-mono">{pos.symbol}</div>
                  <div className="text-terminal-gray text-[10px]">
                    {pos.side} • {pos.leverage}x • {pos.size}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-mono ${pos.pnlPercent >= 0 ? 'text-terminal-green' : 'text-red-500'}`}>
                    {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                  </div>
                  <div className="text-terminal-gray text-[10px]">
                    ${pos.currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-terminal-green/30 text-terminal-green hover:bg-terminal-green/10"
          onClick={() => onStatusChange(agent.id, agent.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
        >
          {agent.status === 'ACTIVE' ? (
            <><Pause className="h-3 w-3 mr-1" /> Pause</>
          ) : (
            <><Play className="h-3 w-3 mr-1" /> Activate</>
          )}
        </Button>
      </div>
    </Card>
  );
}
