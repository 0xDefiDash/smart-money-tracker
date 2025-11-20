
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  timestamp: number;
}

export function LivePriceFeed() {
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [newPriceIds, setNewPriceIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.prices && Array.isArray(data.prices)) {
        const updates: PriceUpdate[] = data.prices.slice(0, 10).map((p: any) => ({
          symbol: p.symbol,
          price: p.current_price,
          change24h: p.price_change_percentage_24h || 0,
          volume: p.total_volume || 0,
          timestamp: Date.now()
        }));

        // Detect price changes
        const changedSymbols = new Set<string>();
        updates.forEach((update) => {
          const existing = prices.find(p => p.symbol === update.symbol);
          if (existing && existing.price !== update.price) {
            changedSymbols.add(update.symbol);
          }
        });

        if (changedSymbols.size > 0) {
          setNewPriceIds(changedSymbols);
          setTimeout(() => setNewPriceIds(new Set()), 2000);
        }

        setPrices(updates);
      }
    } catch (error) {
      console.error('[Live Price Feed] Error:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Update every 15 seconds for real-time feel
    intervalRef.current = setInterval(fetchPrices, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20">
      <CardHeader className="border-b border-primary/10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Live Prices</span>
          </CardTitle>
          <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 text-xs">
            <Zap className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="p-3 space-y-2">
            {prices.map((price) => {
              const isNew = newPriceIds.has(price.symbol);
              const isPositive = price.change24h >= 0;
              
              return (
                <div
                  key={price.symbol}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    isNew
                      ? 'bg-yellow-500/20 border-yellow-500/50 animate-pulse'
                      : isPositive
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">{price.symbol}</span>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(price.price)}</div>
                      <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{price.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
