
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePremium } from '@/hooks/use-premium';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Lock, Check, Bell, ExternalLink, Search, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WalletBalance {
  address: string;
  chain: string;
  balance: string;
  balanceUSD: string;
  currency: string;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  price: number;
  valueUSD: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  tokenTransfers: Array<{
    asset?: string;
    tokenSymbol?: string;
    value: string;
  }>;
}

export default function WalletTrackerPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const { hasPremiumAccess, isTrialActive, trialMinutesLeft, loading: premiumLoading } = usePremium();

  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  // Fetch watchlist on mount
  useEffect(() => {
    if (hasPremiumAccess) {
      fetchWatchlist();
    }
  }, [hasPremiumAccess]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    setIsLoading(true);
    setWalletData(null);
    setTokens([]);
    setTransactions([]);

    try {
      // Fetch balance
      const balanceRes = await fetch(`/api/wallet/balance?address=${address}&chain=${chain}`);
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setWalletData(balanceData);
      } else {
        const error = await balanceRes.json();
        toast.error(error.error || 'Failed to fetch balance');
      }

      // Fetch tokens
      const tokensRes = await fetch(`/api/wallet/tokens?address=${address}&chain=${chain}`);
      if (tokensRes.ok) {
        const tokensData = await tokensRes.json();
        setTokens(tokensData.tokens || []);
      }

      // Fetch transactions
      const txRes = await fetch(`/api/wallet/transactions?address=${address}&chain=${chain}&limit=20`);
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!walletData) return;

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletData.address,
          chain: walletData.chain,
          label: `${chain.toUpperCase()} Wallet`
        })
      });

      if (res.ok) {
        toast.success('Added to watchlist!');
        fetchWatchlist();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Add to watchlist error:', error);
      toast.error('Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Removed from watchlist');
        fetchWatchlist();
      } else {
        toast.error('Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  const getExplorerUrl = (chain: string, address: string) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      bnb: 'https://bscscan.com',
      polygon: 'https://polygonscan.com',
      base: 'https://basescan.org',
      optimism: 'https://optimistic.etherscan.io',
      arbitrum: 'https://arbiscan.io',
      solana: 'https://solscan.io'
    };
    const baseUrl = explorers[chain] || explorers.ethereum;
    return `${baseUrl}/address/${address}`;
  };

  // Show loading state while checking premium
  if (premiumLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-terminal-green" />
      </div>
    );
  }

  // Show premium prompt if no access (for now, we'll allow free access)
  // if (!hasPremiumAccess) {
  //   return (
  //     <div className="container mx-auto p-6">
  //       <Card className="max-w-md mx-auto text-center p-8 bg-black border-terminal-green">
  //         <Lock className="h-16 w-16 mx-auto mb-4 text-terminal-green" />
  //         <h2 className="text-2xl font-bold mb-2 text-terminal-green">Premium Feature</h2>
  //         <p className="text-terminal-gray mb-6">
  //           Wallet Tracker requires a premium subscription
  //         </p>
  //         <Button onClick={() => router.push('/premium')} className="bg-terminal-green text-black hover:bg-terminal-green/80">
  //           <Check className="mr-2 h-4 w-4" />
  //           Subscribe Now
  //         </Button>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Trial Banner */}
      {isTrialActive && (
        <Alert className="bg-terminal-green/10 border-terminal-green">
          <AlertDescription className="text-terminal-green flex items-center justify-between">
            <span>Free trial active: {trialMinutesLeft} minutes remaining</span>
            <Button size="sm" onClick={() => router.push('/premium')} variant="outline" className="border-terminal-green text-terminal-green">
              Subscribe Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-8 w-8 text-terminal-green" />
        <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Wallet Tracker</h1>
      </div>

      {/* Search Interface */}
      <Card className="p-6 bg-black border-terminal-green">
        <h2 className="text-2xl font-bold mb-4 text-terminal-green uppercase tracking-wider">Track Wallet</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger className="w-full md:w-[200px] border-terminal-green text-terminal-green">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-terminal-green">
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="bnb">BNB Chain</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
              <SelectItem value="arbitrum">Arbitrum</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter wallet address (0x... or base58)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 border-terminal-green text-terminal-green placeholder-terminal-gray"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="bg-terminal-green text-black hover:bg-terminal-green/80 uppercase tracking-wider"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Results Display */}
      {walletData && (
        <>
          {/* Balance Card */}
          <Card className="p-6 bg-black border-terminal-green">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-terminal-green uppercase tracking-wider">Balance</h3>
              <a
                href={getExplorerUrl(walletData.chain, walletData.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-green hover:text-terminal-green/80 flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">View on Explorer</span>
              </a>
            </div>
            <p className="text-4xl font-bold text-terminal-green font-mono">
              {walletData.balance} {walletData.currency}
            </p>
            <p className="text-terminal-gray mt-2 font-mono">
              ≈ ${parseFloat(walletData.balanceUSD).toLocaleString()}
            </p>
            <Button 
              onClick={handleAddToWatchlist} 
              className="mt-4 bg-terminal-green text-black hover:bg-terminal-green/80 uppercase tracking-wider"
            >
              <Bell className="mr-2 h-4 w-4" />
              Add to Watchlist
            </Button>
          </Card>

          {/* Token Holdings */}
          {tokens.length > 0 && (
            <Card className="p-6 bg-black border-terminal-green">
              <h3 className="text-lg font-semibold mb-4 text-terminal-green uppercase tracking-wider">Token Holdings</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-terminal-green">
                      <TableHead className="text-terminal-green">Token</TableHead>
                      <TableHead className="text-terminal-green">Balance</TableHead>
                      <TableHead className="text-terminal-green">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.address} className="border-terminal-green/30">
                        <TableCell className="text-terminal-green font-mono">
                          <div>
                            <div className="font-bold">{token.symbol}</div>
                            <div className="text-sm text-terminal-gray">{token.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-terminal-green font-mono">{token.balance}</TableCell>
                        <TableCell className="text-terminal-green font-mono">${token.valueUSD}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {/* Transaction History */}
          {transactions.length > 0 && (
            <Card className="p-6 bg-black border-terminal-green">
              <h3 className="text-lg font-semibold mb-4 text-terminal-green uppercase tracking-wider">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-terminal-green">
                      <TableHead className="text-terminal-green">Tx Hash</TableHead>
                      <TableHead className="text-terminal-green">From</TableHead>
                      <TableHead className="text-terminal-green">To</TableHead>
                      <TableHead className="text-terminal-green">Value</TableHead>
                      <TableHead className="text-terminal-green">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.hash} className="border-terminal-green/30">
                        <TableCell className="text-terminal-green font-mono">
                          <a
                            href={`${getExplorerUrl(chain, '')}/../tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-terminal-green/80 flex items-center gap-1"
                          >
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell className="text-terminal-green font-mono text-sm">
                          {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </TableCell>
                        <TableCell className="text-terminal-green font-mono text-sm">
                          {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </TableCell>
                        <TableCell className="text-terminal-green font-mono">
                          {tx.tokenTransfers && tx.tokenTransfers.length > 0 ? (
                            <span>{tx.tokenTransfers[0].value} {tx.tokenTransfers[0].asset || tx.tokenTransfers[0].tokenSymbol}</span>
                          ) : (
                            <span>{parseFloat(tx.value).toFixed(4)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-terminal-gray font-mono text-sm">
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <Card className="p-6 bg-black border-terminal-green">
          <h3 className="text-lg font-semibold mb-4 text-terminal-green uppercase tracking-wider">My Watchlist</h3>
          <div className="space-y-3">
            {watchlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-terminal-green/30 rounded">
                <div className="flex-1">
                  <div className="text-terminal-green font-mono font-bold">
                    {item.label || 'Unlabeled Wallet'}
                  </div>
                  <div className="text-terminal-gray font-mono text-sm">
                    {item.address.slice(0, 12)}...{item.address.slice(-8)} on {item.chain.toUpperCase()}
                  </div>
                  {item.tokenSymbol && (
                    <div className="text-terminal-green/80 text-sm">
                      Tracking: {item.tokenSymbol}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWatchlist(item.id)}
                  className="border-terminal-green text-terminal-green hover:bg-terminal-green/10"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
