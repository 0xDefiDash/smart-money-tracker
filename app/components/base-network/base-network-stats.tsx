
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface NetworkStats {
  blockNumber: number;
  gasPrice: number;
  avgBlockTime: number;
  network: string;
  rpcProvider: string;
}

export function BaseNetworkStats() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/base-network/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch Base network stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-blue-400 font-medium">LIVE</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            #{stats.blockNumber.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Current Block</p>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {stats.gasPrice.toFixed(2)} Gwei
          </p>
          <p className="text-xs text-muted-foreground">Gas Price</p>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-5 h-5 text-green-400" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {stats.avgBlockTime.toFixed(1)}s
          </p>
          <p className="text-xs text-muted-foreground">Avg Block Time</p>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{stats.network}</p>
          <p className="text-xs text-muted-foreground">via {stats.rpcProvider}</p>
        </div>
      </Card>
    </div>
  );
}
