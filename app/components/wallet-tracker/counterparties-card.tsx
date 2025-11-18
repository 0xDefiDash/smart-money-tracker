
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon, Building2 } from 'lucide-react';

interface Counterparty {
  address: string;
  label?: string;
  entityName?: string;
  transactionCount: number;
  totalValueSent: number;
  totalValueReceived: number;
  netFlow: number;
  firstInteraction: string;
  lastInteraction: string;
  category?: 'exchange' | 'smart_money' | 'whale' | 'defi' | 'nft' | 'other';
}

interface CounterpartiesCardProps {
  data: Counterparty[];
  isLoading?: boolean;
}

export function CounterpartiesCard({ data, isLoading }: CounterpartiesCardProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-terminal-green bg-black">
        <CardHeader>
          <CardTitle className="text-terminal-green uppercase tracking-wider">
            🤝 Top Counterparties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terminal-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const formatValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getCategoryBadge = (category?: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      exchange: { color: 'border-blue-500 text-blue-400', label: 'EXCHANGE' },
      smart_money: { color: 'border-purple-500 text-purple-400', label: 'SMART MONEY' },
      whale: { color: 'border-cyan-500 text-cyan-400', label: 'WHALE' },
      defi: { color: 'border-green-500 text-green-400', label: 'DEFI' },
      nft: { color: 'border-pink-500 text-pink-400', label: 'NFT' },
    };

    if (!category || !configs[category]) return null;

    return (
      <Badge variant="outline" className={configs[category].color}>
        {configs[category].label}
      </Badge>
    );
  };

  return (
    <Card className="border-2 border-terminal-green bg-black">
      <CardHeader>
        <CardTitle className="text-terminal-green uppercase tracking-wider flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Top Counterparties
        </CardTitle>
        <CardDescription className="text-terminal-gray">
          Most frequent trading partners and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 10).map((counterparty, index) => (
            <div
              key={counterparty.address}
              className="p-4 border border-terminal-green/30 rounded"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-terminal-green font-mono text-sm">#{index + 1}</span>
                    {counterparty.entityName ? (
                      <span className="text-terminal-green font-bold">
                        {counterparty.entityName}
                      </span>
                    ) : counterparty.label ? (
                      <span className="text-terminal-green font-mono">
                        {counterparty.label}
                      </span>
                    ) : (
                      <span className="text-terminal-gray font-mono text-sm">
                        {counterparty.address.slice(0, 10)}...
                        {counterparty.address.slice(-6)}
                      </span>
                    )}
                    {getCategoryBadge(counterparty.category)}
                  </div>
                  <div className="text-xs text-terminal-gray">
                    {counterparty.transactionCount} transactions
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-xs text-terminal-gray">Sent</div>
                    <div className="text-sm font-mono text-red-500 font-bold">
                      {formatValue(counterparty.totalValueSent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowDownIcon className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-xs text-terminal-gray">Received</div>
                    <div className="text-sm font-mono text-green-500 font-bold">
                      {formatValue(counterparty.totalValueReceived)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-terminal-green/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-terminal-gray">
                    Net Flow:{' '}
                    <span
                      className={`font-mono font-bold ${
                        counterparty.netFlow >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {counterparty.netFlow >= 0 ? '+' : ''}
                      {formatValue(counterparty.netFlow)}
                    </span>
                  </span>
                  <span className="text-terminal-gray">
                    {new Date(counterparty.lastInteraction).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
