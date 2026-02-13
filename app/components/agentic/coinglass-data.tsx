'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Activity, Flame, Users, BarChart3 } from 'lucide-react';

interface LongShortRatio {
  symbol: string;
  exchange?: string;
  longRate: number;
  shortRate: number;
  longShortRatio: number;
}

interface FundingRate {
  symbol: string;
  exchange: string;
  rate: number;
  predictedRate?: number;
}

interface OpenInterest {
  symbol: string;
  exchange?: string;
  openInterest: number;
  openInterestUsd: number;
  h24Change: number;
}

interface Liquidation {
  symbol: string;
  longLiquidationUsd: number;
  shortLiquidationUsd: number;
  totalLiquidationUsd: number;
  h1?: number;
  h4?: number;
  h12?: number;
  h24?: number;
}

interface MarketSentiment {
  symbol: string;
  longShortRatio: {
    longRate: number;
    shortRate: number;
    longShortRatio: number;
  };
  fundingRate: {
    rate: number;
  };
  openInterest: {
    openInterestUsd: number;
    h24Change: number;
  };
  liquidation24h: Liquidation;
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'];

function formatUsd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

export function CoinglassData() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [multiSentiment, setMultiSentiment] = useState<MarketSentiment[]>([]);
  const [longShortRatios, setLongShortRatios] = useState<LongShortRatio[]>([]);
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [openInterest, setOpenInterest] = useState<OpenInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [sentimentRes, multiRes, lsRes, frRes, oiRes] = await Promise.all([
        fetch(`/api/coinglass?action=sentiment&symbol=${selectedSymbol}`),
        fetch(`/api/coinglass?action=multi-sentiment&symbols=${SYMBOLS.join(',')}`),
        fetch(`/api/coinglass?action=long-short-ratio&symbol=${selectedSymbol}`),
        fetch(`/api/coinglass?action=funding-rates&symbol=${selectedSymbol}`),
        fetch(`/api/coinglass?action=open-interest&symbol=${selectedSymbol}`),
      ]);

      const [sentimentData, multiData, lsData, frData, oiData] = await Promise.all([
        sentimentRes.json(),
        multiRes.json(),
        lsRes.json(),
        frRes.json(),
        oiRes.json(),
      ]);

      if (sentimentData.success) setSentiment(sentimentData.data);
      if (multiData.success) setMultiSentiment(multiData.data);
      if (lsData.success) setLongShortRatios(lsData.data || []);
      if (frData.success) setFundingRates(frData.data || []);
      if (oiData.success) setOpenInterest(oiData.data || []);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching Coinglass data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const getBias = (longRate: number) => {
    if (longRate > 55) return { text: 'BULLISH', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (longRate < 45) return { text: 'BEARISH', color: 'text-red-400', bg: 'bg-red-500/20' };
    return { text: 'NEUTRAL', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  };

  return (
    <Card className="bg-background/90 border-green-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Coinglass Market Data
            </CardTitle>
            <CardDescription className="text-gray-500">
              Long/Short Ratios • Funding Rates • Open Interest • Liquidations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Symbol Selector */}
        <div className="flex gap-2 mt-3">
          {SYMBOLS.map((symbol) => (
            <Button
              key={symbol}
              variant={selectedSymbol === symbol ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSymbol(symbol)}
              className={selectedSymbol === symbol 
                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                : 'border-gray-700 text-gray-400 hover:border-green-500/30'
              }
            >
              {symbol}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full bg-surface-300 border border-green-500/20">
            <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="longshort" className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              L/S Ratio
            </TabsTrigger>
            <TabsTrigger value="funding" className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Funding
            </TabsTrigger>
            <TabsTrigger value="oi" className="flex-1 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              OI
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Multi-coin Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                  {multiSentiment.map((s) => {
                    const bias = getBias(s.longShortRatio.longRate);
                    return (
                      <div
                        key={s.symbol}
                        className={`p-3 rounded-lg border ${selectedSymbol === s.symbol ? 'border-green-500/50 bg-green-500/10' : 'border-gray-800 bg-surface-300'}`}
                        onClick={() => setSelectedSymbol(s.symbol)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-white">{s.symbol}</span>
                          <Badge className={`${bias.bg} ${bias.color} text-xs`}>
                            {bias.text}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Long</span>
                            <span className="text-green-400">{s.longShortRatio.longRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Short</span>
                            <span className="text-red-400">{s.longShortRatio.shortRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Funding</span>
                            <span className={s.fundingRate.rate >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {formatPercent(s.fundingRate.rate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Symbol Details */}
                {sentiment && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Long/Short Ratio */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-red-500/10 border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Long/Short Ratio</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-green-400">
                          {sentiment.longShortRatio.longRate.toFixed(1)}%
                        </span>
                        <span className="text-lg text-gray-500">/</span>
                        <span className="text-2xl font-bold text-red-400">
                          {sentiment.longShortRatio.shortRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${sentiment.longShortRatio.longRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Funding Rate */}
                    <div className="p-4 rounded-lg bg-surface-300 border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">Funding Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sentiment.fundingRate.rate >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                        <span className={`text-2xl font-bold ${sentiment.fundingRate.rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(sentiment.fundingRate.rate)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {sentiment.fundingRate.rate >= 0
                          ? 'Longs pay shorts'
                          : 'Shorts pay longs'}
                      </p>
                    </div>

                    {/* Open Interest */}
                    <div className="p-4 rounded-lg bg-surface-300 border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Open Interest</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatUsd(sentiment.openInterest.openInterestUsd)}
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {sentiment.openInterest.h24Change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs ${sentiment.openInterest.h24Change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sentiment.openInterest.h24Change >= 0 ? '+' : ''}{sentiment.openInterest.h24Change.toFixed(2)}% (24h)
                        </span>
                      </div>
                    </div>

                    {/* Liquidations */}
                    <div className="p-4 rounded-lg bg-surface-300 border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-gray-400">24h Liquidations</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-400">
                        {formatUsd(sentiment.liquidation24h.totalLiquidationUsd)}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Longs:</span>
                          <span className="ml-1 text-red-400">{formatUsd(sentiment.liquidation24h.longLiquidationUsd)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Shorts:</span>
                          <span className="ml-1 text-green-400">{formatUsd(sentiment.liquidation24h.shortLiquidationUsd)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Long/Short Tab */}
          <TabsContent value="longshort" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm text-gray-400 mb-3">Long/Short Ratio by Exchange - {selectedSymbol}</h4>
                {longShortRatios.map((ratio, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-300 border border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-white">{ratio.exchange || 'Exchange'}</span>
                      <Badge className={ratio.longRate > 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {ratio.longShortRatio.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-green-400">Long: {ratio.longRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-red-400">Short: {ratio.shortRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${ratio.longRate}%` }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${ratio.shortRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Funding Tab */}
          <TabsContent value="funding" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm text-gray-400 mb-3">Funding Rates by Exchange - {selectedSymbol}</h4>
                {fundingRates.map((fr, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-300 border border-gray-800 flex items-center justify-between">
                    <span className="font-mono text-white">{fr.exchange}</span>
                    <div className="flex items-center gap-2">
                      {fr.rate >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-mono text-lg ${fr.rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(fr.rate)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-xs text-yellow-400">
                    <strong>Note:</strong> Positive funding = longs pay shorts (bullish pressure). Negative funding = shorts pay longs (bearish pressure).
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Open Interest Tab */}
          <TabsContent value="oi" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm text-gray-400 mb-3">Open Interest by Exchange - {selectedSymbol}</h4>
                {openInterest.map((oi, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-surface-300 border border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-white">{oi.exchange || 'Exchange'}</span>
                      <div className="flex items-center gap-2">
                        {oi.h24Change >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm ${oi.h24Change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {oi.h24Change >= 0 ? '+' : ''}{oi.h24Change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-purple-400">
                      {formatUsd(oi.openInterestUsd)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
