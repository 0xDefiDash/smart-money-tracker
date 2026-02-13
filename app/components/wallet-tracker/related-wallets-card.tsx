
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Users } from 'lucide-react';

interface RelatedWallet {
  address: string;
  label?: string;
  relationship: string;
  transactionCount: number;
  totalValueUsd: number;
}

interface RelatedWalletsCardProps {
  data: RelatedWallet[];
  chain: string;
  isLoading?: boolean;
}

export function RelatedWalletsCard({ data, chain, isLoading }: RelatedWalletsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-primary bg-background">
        <CardHeader>
          <CardTitle className="text-primary uppercase tracking-wider">
            🔗 Related Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const getExplorerUrl = (address: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      bnb: 'https://bscscan.com',
      polygon: 'https://polygonscan.com',
      base: 'https://basescan.org',
      optimism: 'https://optimistic.etherscan.io',
      arbitrum: 'https://arbiscan.io',
    };
    return `${explorers[chain] || explorers.ethereum}/address/${address}`;
  };

  return (
    <Card className="border-2 border-primary bg-background">
      <CardHeader>
        <CardTitle className="text-primary uppercase tracking-wider flex items-center gap-2">
          <Users className="h-5 w-5" />
          Related Wallets
        </CardTitle>
        <CardDescription className="text-terminal-gray">
          First-degree connections (top {data.length} by transaction volume)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((wallet, index) => (
            <div
              key={wallet.address}
              className="p-4 border border-white/10 rounded hover:border-primary/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary font-mono text-sm">#{index + 1}</span>
                    {wallet.label && (
                      <Badge variant="outline" className="border-primary text-primary">
                        {wallet.label}
                      </Badge>
                    )}
                  </div>
                  <div className="font-mono text-primary text-sm break-all mb-2">
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-terminal-gray">
                    <span>
                      <span className="text-primary">{wallet.transactionCount}</span>{' '}
                      transactions
                    </span>
                    <span>
                      <span className="text-primary">
                        {formatValue(wallet.totalValueUsd)}
                      </span>{' '}
                      total value
                    </span>
                    <span className="text-muted-foreground">{wallet.relationship}</span>
                  </div>
                </div>
                <a
                  href={getExplorerUrl(wallet.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
