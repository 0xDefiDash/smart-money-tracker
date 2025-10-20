
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Blocks, Fuel, TrendingUp } from 'lucide-react';

interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  blockTimestamp: number;
  transactionCount: number;
  tps: number;
  network: string;
}

export function EthNetworkStats() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/eth/network-stats', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch network stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching ETH network stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 12000); // Update every 12 seconds (Ethereum block time)
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 animate-pulse"
          >
            <div className="h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
        <p className="text-red-400">Error loading network stats: {error}</p>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Block */}
        <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 hover:border-purple-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Current Block</p>
              <p className="text-2xl font-bold text-white">
                {stats.blockNumber.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Blocks className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Gas Price */}
        <Card className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30 hover:border-orange-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Gas Price</p>
              <p className="text-2xl font-bold text-white">
                {stats.gasPrice} <span className="text-sm">Gwei</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500/20">
              <Fuel className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        {/* Block Transactions */}
        <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30 hover:border-blue-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Block TXs</p>
              <p className="text-2xl font-bold text-white">
                {stats.transactionCount}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        {/* TPS */}
        <Card className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30 hover:border-green-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">TPS</p>
              <p className="text-2xl font-bold text-white">{stats.tps}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Network Info */}
      <Card className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-white font-medium">
              {stats.network} - Live
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Updated {new Date().toLocaleTimeString()}
          </span>
        </div>
      </Card>
    </div>
  );
}
