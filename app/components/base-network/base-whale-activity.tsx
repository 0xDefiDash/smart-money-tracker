
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  blockNumber: number;
  timestamp: number;
}

export function BaseWhaleActivity() {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [minValue, setMinValue] = useState(10);

  const fetchWhaleActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/base-network/whale-activity?minValue=${minValue}&blockCount=10`
      );
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch whale activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhaleActivity();
    const interval = setInterval(fetchWhaleActivity, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [minValue]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Base Whale Activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Large transactions on Base network
            </p>
          </div>
        </div>
        <Button
          onClick={fetchWhaleActivity}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Min Value Filter */}
      <div className="flex gap-2 mb-4">
        {[5, 10, 25, 50, 100].map((value) => (
          <Button
            key={value}
            onClick={() => setMinValue(value)}
            variant={minValue === value ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            ≥ {value} ETH
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-muted/50 animate-pulse h-24"
            />
          ))
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No whale transactions found with value ≥ {minValue} ETH
          </div>
        ) : (
          transactions.map((tx) => (
            <Card
              key={tx.hash}
              className="p-4 bg-gradient-to-r from-muted/50 to-transparent hover:from-muted/80 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">
                      {tx.value.toFixed(4)} ETH
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Block #{tx.blockNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <a
                        href={`https://basescan.org/address/${tx.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {formatAddress(tx.from)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <a
                        href={`https://basescan.org/address/${tx.to || 'Contract Creation'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {tx.to ? formatAddress(tx.to) : 'Contract Creation'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={`https://basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-blue-400 flex items-center gap-1"
                    >
                      {formatAddress(tx.hash)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
