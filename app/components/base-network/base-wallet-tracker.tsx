
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Wallet, ExternalLink } from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: number;
  transactionCount: number;
  currentGasPrice: number;
  network: string;
}

export function BaseWalletTracker() {
  const [address, setAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!address) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/base-network/wallet-info?address=${address}`
      );
      const data = await response.json();

      if (data.success) {
        setWalletInfo(data.data);
      } else {
        setError(data.error || 'Failed to fetch wallet information');
      }
    } catch (err) {
      setError('Failed to fetch wallet information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <Wallet className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Base Wallet Tracker
          </h3>
          <p className="text-sm text-muted-foreground">
            Track any wallet on Base network
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter wallet address (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 font-mono"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !address}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Wallet Info */}
      {walletInfo && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Address</span>
              <a
                href={`https://basescan.org/address/${walletInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline"
              >
                <span className="text-xs">View on BaseScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="font-mono text-sm text-white break-all">
              {walletInfo.address}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <p className="text-xs text-muted-foreground mb-2">Balance</p>
              <p className="text-2xl font-bold text-white">
                {walletInfo.balance.toFixed(6)}
              </p>
              <p className="text-xs text-green-400 mt-1">ETH</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <p className="text-xs text-muted-foreground mb-2">Transactions</p>
              <p className="text-2xl font-bold text-white">
                {walletInfo.transactionCount.toLocaleString()}
              </p>
              <p className="text-xs text-blue-400 mt-1">Total</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <p className="text-xs text-muted-foreground mb-2">Current Gas</p>
              <p className="text-2xl font-bold text-white">
                {walletInfo.currentGasPrice.toFixed(2)}
              </p>
              <p className="text-xs text-purple-400 mt-1">Gwei</p>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
}
