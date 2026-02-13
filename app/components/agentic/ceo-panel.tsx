'use client';

import { CEODecision } from '@/lib/ai-agents/agent-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, CheckCircle, XCircle, AlertTriangle, Pause, RefreshCw } from 'lucide-react';

interface CEOPanelProps {
  decisions: CEODecision[];
  totalCapital: number;
  usedCapital: number;
  totalPnL: number;
}

export function CEOPanel({ decisions, totalCapital, usedCapital, totalPnL }: CEOPanelProps) {
  const utilizationPercent = (usedCapital / totalCapital) * 100;
  const pnlPercent = (totalPnL / totalCapital) * 100;

  const getActionIcon = (action: string) => {
    const icons: Record<string, typeof CheckCircle> = {
      APPROVE: CheckCircle,
      REJECT: XCircle,
      MODIFY: AlertTriangle,
      PAUSE_AGENT: Pause,
      REBALANCE: RefreshCw
    };
    const Icon = icons[action] || CheckCircle;
    return <Icon className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      APPROVE: 'text-primary',
      REJECT: 'text-red-500',
      MODIFY: 'text-yellow-500',
      PAUSE_AGENT: 'text-orange-500',
      REBALANCE: 'text-blue-500'
    };
    return colors[action] || 'text-primary';
  };

  return (
    <Card className="border-2 border-yellow-500/50 bg-background/95 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-500/20 rounded-lg">
          <Crown className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-yellow-500 font-bold text-xl uppercase tracking-wider">
            CEO Super Agent
          </h2>
          <p className="text-terminal-gray text-sm">Strategic Oversight & Risk Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-300 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-terminal-gray text-xs uppercase mb-2">Account Status</div>
          <div className="text-yellow-500 text-lg font-mono font-bold">
            NOT FUNDED
          </div>
          <div className="text-terminal-gray text-xs mt-1">
            Fund your AsterDex account to activate trading
          </div>
        </div>
        <div className="bg-surface-300 border border-white/10 rounded-lg p-4">
          <div className="text-terminal-gray text-xs uppercase mb-2">Total PnL</div>
          <div className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)}
          </div>
          <div className={`text-xs mt-1 ${totalPnL >= 0 ? 'text-primary' : 'text-red-500'}`}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-yellow-500 font-bold uppercase tracking-wider text-sm">Recent Decisions</h3>
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            {decisions.length} Total
          </Badge>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {decisions.length === 0 ? (
            <div className="text-center text-terminal-gray py-8">
              <p className="text-sm">No decisions yet. CEO will evaluate agent proposals soon.</p>
            </div>
          ) : (
            decisions.map((decision, idx) => (
              <div
                key={idx}
                className="bg-surface-300 border border-primary/20 rounded-lg p-3 hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={getActionColor(decision.action)}>
                      {getActionIcon(decision.action)}
                    </div>
                    <span className={`font-bold text-sm uppercase ${getActionColor(decision.action)}`}>
                      {decision.action.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-terminal-gray text-xs">
                    {new Date(decision.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-primary text-sm mb-2">{decision.reasoning}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-terminal-gray">Risk: </span>
                    <span className="text-white">{decision.riskAssessment}</span>
                  </div>
                  <div>
                    <span className="text-terminal-gray">Market: </span>
                    <span className="text-white">{decision.marketConditions}</span>
                  </div>
                </div>

                {decision.modifications && (
                  <div className="mt-2 pt-2 border-t border-primary/20">
                    <div className="text-terminal-gray text-xs">Modifications Applied</div>
                    <div className="text-primary text-xs font-mono mt-1">
                      {JSON.stringify(decision.modifications)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
