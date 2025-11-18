
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheckIcon, TrendingUpIcon, Building2Icon } from 'lucide-react';

interface WalletLabelsData {
  address: string;
  labels: string[];
  entityName?: string;
  isSmartMoney: boolean;
  isExchange: boolean;
  isWhale: boolean;
}

interface WalletLabelsCardProps {
  data: WalletLabelsData | null;
  isLoading?: boolean;
}

export function WalletLabelsCard({ data, isLoading }: WalletLabelsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-2 border-terminal-green bg-black">
        <CardHeader>
          <CardTitle className="text-terminal-green uppercase tracking-wider">
            🏷️ Wallet Labels & Identity
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

  if (!data || data.labels.length === 0) {
    return (
      <Card className="border-2 border-terminal-green/30 bg-black">
        <CardHeader>
          <CardTitle className="text-terminal-green uppercase tracking-wider">
            🏷️ Wallet Labels & Identity
          </CardTitle>
          <CardDescription className="text-terminal-gray">
            No Nansen labels found for this wallet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-terminal-green bg-black">
      <CardHeader>
        <CardTitle className="text-terminal-green uppercase tracking-wider">
          🏷️ Wallet Labels & Identity
        </CardTitle>
        {data.entityName && (
          <CardDescription className="text-terminal-green text-lg font-bold">
            {data.entityName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Special Badges */}
        {(data.isSmartMoney || data.isExchange || data.isWhale) && (
          <div className="flex flex-wrap gap-2">
            {data.isSmartMoney && (
              <Badge className="bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500/30">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                SMART MONEY
              </Badge>
            )}
            {data.isExchange && (
              <Badge className="bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500/30">
                <Building2Icon className="h-3 w-3 mr-1" />
                EXCHANGE
              </Badge>
            )}
            {data.isWhale && (
              <Badge className="bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30">
                🐋 WHALE
              </Badge>
            )}
          </div>
        )}

        {/* All Labels */}
        <div>
          <h4 className="text-sm font-semibold text-terminal-gray uppercase tracking-wider mb-2">
            Nansen Labels
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.labels.map((label, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-terminal-green text-terminal-green font-mono"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 border border-terminal-green/50 rounded bg-terminal-green/5">
          <div className="flex items-start gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-terminal-green mt-0.5" />
            <div className="text-sm text-terminal-gray">
              <p className="font-semibold text-terminal-green mb-1">About Nansen Labels</p>
              <p>
                Nansen labels identify wallet categories based on on-chain activity. Smart Money
                labels indicate top-performing traders, Exchanges show CEX wallets, and Whales
                represent large holders.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
