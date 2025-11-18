
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Lock, Check, Bell, ExternalLink, Search, Wallet, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TokenGate } from '@/components/wallet/TokenGate';
import { PnLSummaryCard } from '@/components/wallet-tracker/pnl-summary-card';
import { WalletLabelsCard } from '@/components/wallet-tracker/wallet-labels-card';
import { RelatedWalletsCard } from '@/components/wallet-tracker/related-wallets-card';
import { CounterpartiesCard } from '@/components/wallet-tracker/counterparties-card';

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
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  
  // Nansen Profiler data
  const [nansenData, setNansenData] = useState<any>(null);
  const [isLoadingNansen, setIsLoadingNansen] = useState(false);
  const [nansenError, setNansenError] = useState<string | null>(null);

  // Fetch watchlist on mount (stored in local storage)
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      // Try to fetch from API first (if authenticated)
      const res = await fetch('/api/watchlist');
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data.watchlist || []);
      } else {
        // Fallback to local storage if not authenticated
        const stored = localStorage.getItem('watchlist');
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
      // Fallback to local storage
      const stored = localStorage.getItem('watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
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
    setNansenData(null);
    setNansenError(null);

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

      // Fetch Nansen Profiler data (in parallel with other requests)
      fetchNansenData();
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNansenData = async () => {
    if (!address.trim()) return;

    setIsLoadingNansen(true);
    setNansenError(null);

    try {
      const res = await fetch(
        `/api/nansen/wallet-profiler?address=${address}&chain=${chain}&section=all`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNansenData(data.data);
          toast.success('✨ Nansen intelligence loaded!', { icon: '🧠' });
        } else {
          setNansenError(data.error || 'Failed to load Nansen data');
        }
      } else {
        const errorData = await res.json();
        setNansenError(errorData.error || 'Failed to load Nansen data');
      }
    } catch (error: any) {
      console.error('Nansen data error:', error);
      setNansenError(error.message || 'Failed to fetch Nansen data');
    } finally {
      setIsLoadingNansen(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!walletData) return;

    try {
      // Try API first (if authenticated)
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
        // Fallback to local storage
        const newItem = {
          id: Date.now().toString(),
          address: walletData.address,
          chain: walletData.chain,
          label: `${chain.toUpperCase()} Wallet`,
          createdAt: new Date().toISOString()
        };
        const updatedWatchlist = [...watchlist, newItem];
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        setWatchlist(updatedWatchlist);
        toast.success('Added to local watchlist!');
      }
    } catch (error) {
      console.error('Add to watchlist error:', error);
      // Fallback to local storage
      const newItem = {
        id: Date.now().toString(),
        address: walletData.address,
        chain: walletData.chain,
        label: `${chain.toUpperCase()} Wallet`,
        createdAt: new Date().toISOString()
      };
      const updatedWatchlist = [...watchlist, newItem];
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setWatchlist(updatedWatchlist);
      toast.success('Added to local watchlist!');
    }
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      // Try API first (if authenticated)
      const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Removed from watchlist');
        fetchWatchlist();
      } else {
        // Fallback to local storage
        const updatedWatchlist = watchlist.filter(item => item.id !== id);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        setWatchlist(updatedWatchlist);
        toast.success('Removed from local watchlist');
      }
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      // Fallback to local storage
      const updatedWatchlist = watchlist.filter(item => item.id !== id);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setWatchlist(updatedWatchlist);
      toast.success('Removed from local watchlist');
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

  return (
    <TokenGate
      requiredTokens={3000}
      contractAddress="0xd6df108d516a5dc83f39020a349085c79d4edf0d"
      chainId="8453"
    >
      <div className="container mx-auto p-4 md:p-6 space-y-6">
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-black border-2 border-terminal-green">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-black text-terminal-green uppercase tracking-wider"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="intelligence" 
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-black text-terminal-green uppercase tracking-wider"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Intelligence
            </TabsTrigger>
            <TabsTrigger 
              value="holdings" 
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-black text-terminal-green uppercase tracking-wider"
            >
              Holdings
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-terminal-green data-[state=active]:text-black text-terminal-green uppercase tracking-wider"
            >
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 bg-black border-terminal-green">
                <div className="text-sm text-terminal-gray uppercase tracking-wider mb-1">Chain</div>
                <div className="text-2xl font-bold text-terminal-green uppercase">{chain}</div>
              </Card>
              <Card className="p-4 bg-black border-terminal-green">
                <div className="text-sm text-terminal-gray uppercase tracking-wider mb-1">Token Count</div>
                <div className="text-2xl font-bold text-terminal-green">{tokens.length}</div>
              </Card>
              <Card className="p-4 bg-black border-terminal-green">
                <div className="text-sm text-terminal-gray uppercase tracking-wider mb-1">Transactions</div>
                <div className="text-2xl font-bold text-terminal-green">{transactions.length}+</div>
              </Card>
            </div>
          </TabsContent>

          {/* Nansen Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            {isLoadingNansen && (
              <Card className="p-8 bg-black border-terminal-green">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-terminal-green" />
                  <p className="text-terminal-green text-lg">
                    Loading Nansen Intelligence...
                  </p>
                  <p className="text-terminal-gray text-sm">
                    Analyzing wallet with institutional-grade data
                  </p>
                </div>
              </Card>
            )}

            {nansenError && (
              <Alert className="border-yellow-500 bg-yellow-500/10">
                <AlertDescription className="text-yellow-500">
                  <strong>Note:</strong> {nansenError}
                  <br />
                  <span className="text-sm">
                    Nansen data may not be available for all wallets or chains.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {nansenData && !isLoadingNansen && (
              <>
                {/* Wallet Labels */}
                <WalletLabelsCard data={nansenData.labels} isLoading={false} />

                {/* PnL Summary */}
                <PnLSummaryCard data={nansenData.pnlSummary} isLoading={false} />

                {/* Related Wallets */}
                {nansenData.relatedWallets && nansenData.relatedWallets.length > 0 && (
                  <RelatedWalletsCard 
                    data={nansenData.relatedWallets} 
                    chain={chain}
                    isLoading={false} 
                  />
                )}

                {/* Counterparties */}
                {nansenData.counterparties && nansenData.counterparties.length > 0 && (
                  <CounterpartiesCard 
                    data={nansenData.counterparties} 
                    isLoading={false} 
                  />
                )}
              </>
            )}

            {!nansenData && !isLoadingNansen && !nansenError && (
              <Card className="p-8 bg-black border-terminal-green/50">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-terminal-green mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-terminal-green uppercase mb-2">
                    Nansen Intelligence
                  </h3>
                  <p className="text-terminal-gray">
                    Search for a wallet to see institutional-grade analytics including PnL tracking,
                    Smart Money labels, and on-chain relationships.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            {tokens.length > 0 ? (
              <Card className="p-6 bg-black border-terminal-green">
                <h3 className="text-lg font-semibold mb-4 text-terminal-green uppercase tracking-wider">
                  Token Holdings ({tokens.length})
                </h3>
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
            ) : (
              <Card className="p-8 bg-black border-terminal-green/50">
                <div className="text-center text-terminal-gray">
                  No token holdings found
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {transactions.length > 0 ? (
              <Card className="p-6 bg-black border-terminal-green">
                <h3 className="text-lg font-semibold mb-4 text-terminal-green uppercase tracking-wider">
                  Recent Transactions ({transactions.length})
                </h3>
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
            ) : (
              <Card className="p-8 bg-black border-terminal-green/50">
                <div className="text-center text-terminal-gray">
                  No transactions found
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
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
    </TokenGate>
  );
}
