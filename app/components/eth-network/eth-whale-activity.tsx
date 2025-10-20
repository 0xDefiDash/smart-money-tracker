
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, ExternalLink } from 'lucide-react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  blockNumber: number;
  timestamp: number;
}

interface WhaleActivityData {
  transactions: Transaction[];
  count: number;
  minValue: number;
  network: string;
}

export function EthWhaleActivity() {
  const [data, setData] = useState<WhaleActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minValue, setMinValue] = useState(100);

  const fetchWhaleActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/eth/whale-activity?minValue=${minValue}&blockCount=10`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch whale activity');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching ETH whale activity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhaleActivity();
  }, [minValue]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Whale Activity
              </h3>
              <p className="text-sm text-gray-400">
                Large transactions (≥{minValue} ETH)
              </p>
            </div>
          </div>
          <Button
            onClick={fetchWhaleActivity}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Min Value Filter */}
        <div className="flex gap-2">
          {[50, 100, 500, 1000].map((val) => (
            <Button
              key={val}
              onClick={() => setMinValue(val)}
              size="sm"
              variant={minValue === val ? 'default' : 'outline'}
              className={
                minValue === val
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'border-gray-600 hover:bg-gray-800'
              }
            >
              ≥{val} ETH
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-gray-800/50 animate-pulse"
              >
                <div className="h-16" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
            <p className="text-sm text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Transactions List */}
        {data && (
          <div className="space-y-3">
            {data.transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">
                  No whale transactions found in recent blocks
                </p>
              </div>
            ) : (
              data.transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.hash}
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Amount */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-purple-400">
                          {tx.value.toFixed(2)} ETH
                        </span>
                        <span className="text-xs text-gray-500">
                          Block #{tx.blockNumber}
                        </span>
                      </div>

                      {/* Addresses */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">From:</span>
                        <a
                          href={`https://etherscan.io/address/${tx.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono"
                        >
                          {formatAddress(tx.from)}
                        </a>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-400">To:</span>
                        <a
                          href={`https://etherscan.io/address/${tx.to}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono"
                        >
                          {formatAddress(tx.to)}
                        </a>
                      </div>

                      {/* Time */}
                      <div className="text-xs text-gray-500">
                        {formatTime(tx.timestamp)}
                      </div>
                    </div>

                    {/* View on Etherscan */}
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-400" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Stats */}
        {data && data.transactions.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Total whale transactions found:
              </span>
              <span className="text-white font-semibold">{data.count}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
