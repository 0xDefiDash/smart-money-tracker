
'use client';

import { useState } from 'react';
import { FlowIntelligenceCard } from '@/components/nansen/flow-intelligence-card';
import { TokenSearch } from '@/components/nansen/token-search';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertTriangleIcon } from 'lucide-react';

export default function FlowIntelligencePage() {
  const [flowData, setFlowData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (tokenAddress: string, chain: string, timeframe: string) => {
    setIsLoading(true);
    setError(null);
    setFlowData(null);

    try {
      const response = await fetch(
        `/api/nansen/token-intelligence?action=analyze&tokenAddress=${tokenAddress}&chain=${chain}&timeframe=${timeframe}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flow intelligence');
      }

      const data = await response.json();

      if (data.success && data.data.flowIntelligence) {
        setFlowData(data.data.flowIntelligence);
      } else {
        throw new Error('Flow intelligence data not available for this token');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flow intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">🌊 Flow Intelligence</h1>
        <p className="text-muted-foreground text-lg">
          Track token flows across Smart Money, Exchanges, Whales, and Fresh Wallets powered by
          Nansen
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-2 border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            What is Flow Intelligence?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Flow Intelligence provides comprehensive analysis of token movements across different
            wallet categories:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Smart Money</strong>: Top 5,000 performing wallets ranked by realized profit
              and win rate
            </li>
            <li>
              <strong>Exchanges</strong>: Centralized exchange wallets (Binance, Coinbase, etc.)
            </li>
            <li>
              <strong>Whales</strong>: Large wallet holders with significant positions
            </li>
            <li>
              <strong>Fresh Wallets</strong>: Newly active wallets showing emerging interest
            </li>
          </ul>
          <p className="pt-2 text-muted-foreground">
            Use this data to identify accumulation/distribution patterns and make informed trading
            decisions.
          </p>
        </CardContent>
      </Card>

      {/* Search Component */}
      <TokenSearch onSearch={handleSearch} isLoading={isLoading} />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Flow Intelligence Results */}
      {flowData && <FlowIntelligenceCard data={flowData} />}

      {/* Usage Tips */}
      {!flowData && !isLoading && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>💡 How to Use Flow Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Search for a Token</h3>
              <p className="text-sm text-muted-foreground">
                Enter a token contract address and select the blockchain and timeframe. You can also
                use the popular token shortcuts provided.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Interpret the Flows</h3>
              <p className="text-sm text-muted-foreground">
                Positive netflow (green) indicates accumulation, while negative netflow (red)
                indicates distribution. Pay special attention to Smart Money flows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Combine Multiple Signals</h3>
              <p className="text-sm text-muted-foreground">
                The most reliable signals occur when Smart Money accumulation aligns with exchange
                outflows and whale accumulation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Monitor Fresh Wallets</h3>
              <p className="text-sm text-muted-foreground">
                Increasing inflows from fresh wallets can indicate growing retail interest and
                potential momentum.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
