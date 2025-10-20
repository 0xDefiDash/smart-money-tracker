
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Wallet, TrendingUp, ExternalLink } from 'lucide-react';

interface WalletData {
  address: string;
  balance: number;
  transactionCount: number;
  network: string;
  lastChecked: string;
}

export function EthWalletTracker() {
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackWallet = async () => {
    if (!address) return;

    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Invalid Ethereum address format');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/eth/wallet/${address}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch wallet data');
      }

      const data = await response.json();
      setWalletData(data);
    } catch (err: any) {
      console.error('Error tracking wallet:', err);
      setError(err.message);
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      trackWallet();
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-blue-500/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Wallet Tracker</h3>
            <p className="text-sm text-gray-400">
              Track any Ethereum wallet address
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter Ethereum address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button
            onClick={trackWallet}
            disabled={loading || !address}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Tracking...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Track
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Wallet Data */}
        {walletData && (
          <div className="space-y-4">
            {/* Address */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Wallet Address</p>
                  <p className="text-sm font-mono text-white">
                    {formatAddress(walletData.address)}
                  </p>
                </div>
                <a
                  href={`https://etherscan.io/address/${walletData.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </a>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Balance */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/20">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-2xl font-bold text-green-400">
                    {walletData.balance.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">ETH</p>
                </div>
              </div>

              {/* Transaction Count */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {walletData.transactionCount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-purple-400" />
                    <p className="text-xs text-gray-500">Total TXs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Checked */}
            <div className="text-xs text-gray-500 text-center">
              Last checked: {new Date(walletData.lastChecked).toLocaleString()}
            </div>
          </div>
        )}

        {/* Quick Access Buttons */}
        {!walletData && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Quick access:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
                }
                className="border-gray-700 hover:bg-gray-800 text-xs"
              >
                Vitalik.eth
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddress('0x28C6c06298d514Db089934071355E5743bf21d60')
                }
                className="border-gray-700 hover:bg-gray-800 text-xs"
              >
                Binance 14
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
