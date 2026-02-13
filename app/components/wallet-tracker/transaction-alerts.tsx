
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession() || {};
  const [alerts, setAlerts] = useState<TransactionAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch alerts if user is authenticated
    if (status === 'authenticated') {
      fetchAlerts();
      // Poll for new alerts every 30 seconds
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [status]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/watchlist/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setUnreadCount(data.unreadCount || 0);
      } else if (res.status === 401) {
        // User is not authenticated, silently ignore
        setAlerts([]);
        setUnreadCount(0);
      }
    } catch (error) {
      // Silently ignore errors for unauthenticated users
      setAlerts([]);
      setUnreadCount(0);
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

  // Don't render anything if user is not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-primary hover:bg-primary/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-black"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background border-primary max-h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center p-2 border-b border-primary">
          <span className="font-semibold text-primary uppercase tracking-wider">Transaction Alerts</span>
          {alerts.some(a => a.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearReadAlerts}
              className="text-primary hover:bg-primary/10 text-xs"
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
                className={`p-3 cursor-pointer border-b border-primary/20 hover:bg-primary/10 focus:bg-primary/10 ${!alert.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => !alert.isRead && markAsRead([alert.id])}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-start">
                    <span className="font-medium capitalize text-primary">
                      {alert.type} Transaction
                    </span>
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      {alert.chain.toUpperCase()}
                    </Badge>
                  </div>
                  {alert.tokenSymbol && alert.tokenAmount && (
                    <span className="text-sm text-primary font-mono">
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
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-mono"
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
