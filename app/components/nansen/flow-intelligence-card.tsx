
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface FlowData {
  inflow: number;
  outflow: number;
  netflow: number;
}

interface FlowIntelligenceData {
  tokenAddress: string;
  tokenSymbol: string;
  chain: string;
  flows: {
    smartMoney: FlowData;
    exchanges: FlowData;
    whales: FlowData;
    freshWallets: FlowData;
  };
  timestamp: string;
}

interface FlowIntelligenceCardProps {
  data: FlowIntelligenceData;
}

export function FlowIntelligenceCard({ data }: FlowIntelligenceCardProps) {
  const formatValue = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getFlowIndicator = (netflow: number) => {
    if (netflow > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <TrendingUpIcon className="h-4 w-4" />
          <span className="text-sm font-semibold">ACCUMULATION</span>
        </div>
      );
    } else if (netflow < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDownIcon className="h-4 w-4" />
          <span className="text-sm font-semibold">DISTRIBUTION</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <span className="text-sm font-semibold">NEUTRAL</span>
      </div>
    );
  };

  const flowCategories = [
    {
      name: 'Smart Money',
      key: 'smartMoney',
      description: 'Top 5,000 performing wallets',
      icon: '🧠',
      color: 'bg-purple-500/20 border-purple-500',
    },
    {
      name: 'Exchanges',
      key: 'exchanges',
      description: 'Centralized exchange wallets',
      icon: '🏦',
      color: 'bg-blue-500/20 border-blue-500',
    },
    {
      name: 'Whales',
      key: 'whales',
      description: 'Large wallet holders',
      icon: '🐋',
      color: 'bg-cyan-500/20 border-cyan-500',
    },
    {
      name: 'Fresh Wallets',
      key: 'freshWallets',
      description: 'Newly active wallets',
      icon: '🆕',
      color: 'bg-green-500/20 border-green-500',
    },
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {data.tokenSymbol} Flow Intelligence
            </CardTitle>
            <CardDescription className="mt-1">
              Chain: {data.chain.toUpperCase()} | Token: {data.tokenAddress.slice(0, 6)}...
              {data.tokenAddress.slice(-4)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Nansen Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {flowCategories.map((category) => {
            const flowData = data.flows[category.key as keyof typeof data.flows];
            const netflow = flowData.netflow;
            const isPositive = netflow >= 0;

            return (
              <Card key={category.key} className={`border-2 ${category.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    {getFlowIndicator(netflow)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Net Flow */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Net Flow</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatValue(netflow)}
                      </span>
                      {isPositive ? (
                        <ArrowUpIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Inflow */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Inflow</span>
                    </div>
                    <span className="text-sm font-semibold text-green-500">
                      {formatValue(flowData.inflow)}
                    </span>
                  </div>

                  {/* Outflow */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Outflow</span>
                    </div>
                    <span className="text-sm font-semibold text-red-500">
                      {formatValue(flowData.outflow)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Overall Analysis */}
        <Card className="mt-4 border-2 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-lg">📊 Overall Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const { smartMoney, exchanges, whales, freshWallets } = data.flows;
                const signals: string[] = [];

                if (smartMoney.netflow > 0) {
                  signals.push('🟢 Smart Money is accumulating - BULLISH signal');
                } else if (smartMoney.netflow < 0) {
                  signals.push('🔴 Smart Money is distributing - BEARISH signal');
                }

                if (exchanges.netflow < 0) {
                  signals.push('🟢 Exchange outflows - BULLISH (less selling pressure)');
                } else if (exchanges.netflow > 0) {
                  signals.push('🔴 Exchange inflows - BEARISH (potential selling)');
                }

                if (whales.netflow > 0) {
                  signals.push('🟢 Whales accumulating - BULLISH signal');
                } else if (whales.netflow < 0) {
                  signals.push('🔴 Whales distributing - BEARISH signal');
                }

                if (freshWallets.netflow > 0) {
                  signals.push('🟢 New wallet inflows - Growing interest');
                }

                return signals.length > 0 ? (
                  signals.map((signal, i) => (
                    <p key={i} className="text-sm">
                      {signal}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Neutral market activity</p>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
