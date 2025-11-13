
'use client';

import { useState, useEffect } from 'react';
import { Bell, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionAlert {
  id: string;
  walletAddress: string;
  chain: string;
  transactionHash: string;
  type: string;
  tokenSymbol?: string;
  tokenAmount?: string;
  value?: string;
  isRead: boolean;
  notifiedAt: string;
}

export function TransactionAlerts() {
  const [alerts, setAlerts] = useState<TransactionAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/watchlist/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertIds: string[]) => {
    try {
      await fetch('/api/watchlist/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds })
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const clearReadAlerts = async () => {
    try {
      await fetch('/api/watchlist/alerts', { method: 'DELETE' });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to clear alerts:', error);
    }
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
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
    return `${baseUrl}/tx/${txHash}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-terminal-green hover:bg-terminal-green/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-terminal-green text-black"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-black border-terminal-green max-h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center p-2 border-b border-terminal-green">
          <span className="font-semibold text-terminal-green uppercase tracking-wider">Transaction Alerts</span>
          {alerts.some(a => a.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearReadAlerts}
              className="text-terminal-green hover:bg-terminal-green/10 text-xs"
            >
              Clear Read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-terminal-gray">
              No alerts yet
            </div>
          ) : (
            alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={`p-3 cursor-pointer border-b border-terminal-green/20 hover:bg-terminal-green/10 focus:bg-terminal-green/10 ${!alert.isRead ? 'bg-terminal-green/5' : ''}`}
                onClick={() => !alert.isRead && markAsRead([alert.id])}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <span className="font-medium capitalize text-terminal-green">
                      {alert.type} Transaction
                    </span>
                    <Badge variant="outline" className="text-xs border-terminal-green text-terminal-green">
                      {alert.chain.toUpperCase()}
                    </Badge>
                  </div>
                  {alert.tokenSymbol && alert.tokenAmount && (
                    <span className="text-sm text-terminal-green font-mono">
                      {alert.tokenAmount} {alert.tokenSymbol}
                    </span>
                  )}
                  <span className="text-xs text-terminal-gray truncate font-mono">
                    {alert.walletAddress}
                  </span>
                  <a
                    href={getExplorerUrl(alert.chain, alert.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-terminal-green hover:text-terminal-green/80 flex items-center gap-1 font-mono"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-terminal-gray font-mono">
                    {new Date(alert.notifiedAt).toLocaleString()}
                  </span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
